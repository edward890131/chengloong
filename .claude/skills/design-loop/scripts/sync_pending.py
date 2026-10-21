#!/usr/bin/env python3
"""PostToolUse hook：改到 design-loop 專案的監看檔案時，記進 _design-loop/SYNC_PENDING.md

由 init_project.py --install-hook 安裝（matcher：Edit|Write|MultiEdit|NotebookEdit|Bash）。
▸ 判斷方式是「監看檔案的 mtime 有沒有變」，不是看工具參數：Edit／Write／MultiEdit 與 Bash
  （heredoc、sed -i、python 腳本、腳本內再寫檔）一視同仁，subagent 寫的也算。
▸ 只在 manifest.stage 是 S5（三邊都已建立、進入常駐同步）時記錄；S0–S4 首次建置期間不記。
▸ 索引放 _design-loop/.sync_state.json。第一次建立（或剛進 S5）只建索引、不記錄，
  避免把既有檔案全部倒進清單。
▸ 同一個檔案已有未勾選項目 → 不重複記。一次改超過 MAX_LIST 個檔就記成一行摘要。
"""
import json
import os
import sys
from datetime import datetime
from fnmatch import fnmatch
from pathlib import Path

MAX_LIST = 12
SKIP_DIRS = {'.git', 'node_modules', '.venv', '__pycache__', '.next', 'dist', 'build'}


def match(rel, patterns):
    return any(fnmatch(rel, p) or (p.startswith('**/') and fnmatch(rel, p[3:])) for p in patterns)


def find_root(data):
    """從 tool_input.file_path、hook 的 cwd、或現在的工作目錄往上找 _design-loop/manifest.json"""
    cands = []
    fp = (data.get('tool_input') or {}).get('file_path')
    if fp:
        cands.append(Path(fp))
    for key in ('cwd', 'project_dir', 'workspace_dir'):
        if data.get(key):
            cands.append(Path(data[key]))
    cands.append(Path.cwd())
    for c in cands:
        c = c if c.is_absolute() else Path.cwd() / c
        for p in [c, *c.parents]:
            if (p / '_design-loop' / 'manifest.json').is_file():
                return p
    return None


def scan(root, watch, ignore):
    """回傳 {相對路徑: mtime}，只含監看範圍內的檔"""
    out = {}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]
        for name in filenames:
            path = Path(dirpath) / name
            rel = path.relative_to(root).as_posix()
            if not match(rel, watch) or match(rel, ignore):
                continue
            try:
                out[rel] = path.stat().st_mtime
            except OSError:
                pass
    return out


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return
    root = find_root(data)
    if root is None:
        return
    manifest = json.loads((root / '_design-loop' / 'manifest.json').read_text(encoding='utf-8'))
    if manifest.get('stage') != 'S5':
        return

    watch = manifest.get('sync_watch') or []
    ignore = (manifest.get('sync_ignore') or []) + ['_design-loop/**', '.claude/**']
    state_path = root / '_design-loop' / '.sync_state.json'
    current = scan(root, watch, ignore)

    if not state_path.exists():
        state_path.write_text(json.dumps({'mtimes': current}, ensure_ascii=False), encoding='utf-8')
        return
    try:
        previous = json.loads(state_path.read_text(encoding='utf-8')).get('mtimes', {})
    except Exception:
        previous = {}
    state_path.write_text(json.dumps({'mtimes': current}, ensure_ascii=False), encoding='utf-8')

    changed = sorted(rel for rel, m in current.items() if m - previous.get(rel, 0) > 0.5)
    if not changed:
        return

    pending = root / '_design-loop' / 'SYNC_PENDING.md'
    text = pending.read_text(encoding='utf-8') if pending.exists() else '# 待同步（SYNC_PENDING）\n\n'
    open_lines = [l for l in text.splitlines() if l.startswith('- [ ]')]
    new = [rel for rel in changed if not any(f'`{rel}`' in l for l in open_lines)]
    if not new:
        return

    stamp = datetime.now().strftime('%Y-%m-%d %H:%M')
    tool = data.get('tool_name', '')
    if not text.endswith('\n'):
        text += '\n'
    if len(new) <= MAX_LIST:
        for rel in new:
            text += f'- [ ] {stamp} `{rel}`（{tool}）\n'
    else:
        text += (f'- [ ] {stamp} {len(new)} 個監看檔案異動（{tool}）：`{new[0]}` 等，'
                 f'完整清單見 `_design-loop/.sync_state.json` 比對或 `git status`\n')
    pending.write_text(text, encoding='utf-8')
    print(json.dumps({'hookSpecificOutput': {
        'hookEventName': 'PostToolUse',
        'additionalContext': (f'design-loop：{len(new)} 個監看檔案異動已記進 _design-loop/SYNC_PENDING.md'
                              f'（{", ".join(new[:3])}{" 等" if len(new) > 3 else ""}）。'
                              '這些異動要走 S5 三邊同步（core/s5-sync.md）才算完成。'),
    }}, ensure_ascii=False))


if __name__ == '__main__':
    main()
