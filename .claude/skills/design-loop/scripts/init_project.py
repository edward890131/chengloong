#!/usr/bin/env python3
"""design-loop 開案：在專案根目錄建立 _design-loop/

用法：
  python3 init_project.py <專案根目錄> --platform web --prefix xx --name "專案名" [--install-hook]
  python3 init_project.py <專案根目錄> --platform app --prefix ab --name "專案名" [--unified-platform] [--dark] [--tablet] [--framework flutter] [--install-hook]
  其他：--figma-prefix XX（預設＝prefix 大寫）

▸ --unified-platform（APP）：iOS／Android 不差異化。不建 modes.Platform、viewports 只留 Phone（＋Tablet）、
    manifest.platform_policy 預填決策；對應 platforms/app.md「開案分支」。沒加＝差異化（兩平台各一個 viewport 與 Platform mode）

▸ 已經有 _design-loop/ 就停止，不覆蓋任何檔案
▸ --install-hook：在 <專案>/.claude/settings.json 加 PostToolUse hook（Edit／Write／MultiEdit／NotebookEdit／Bash），
    改到監看檔案時記進 SYNC_PENDING.md；判斷依 mtime，Bash 寫檔也抓得到
"""
import argparse
import json
import shutil
import sys
from datetime import date
from pathlib import Path

SKILL = Path(__file__).resolve().parents[1]
TPL = SKILL / 'templates' / 'project'
HOOK_CMD = 'python3 "$HOME/.claude/skills/design-loop/scripts/sync_pending.py"'


def app_preset(dark, tablet, unified):
    today = date.today().isoformat()
    size = [{'mode': 'Phone', 'css': ':root'}]
    if unified:
        viewports = [{'name': 'Phone', 'width': 393, 'height': 852}]
        if tablet:
            viewports.append({'name': 'Tablet', 'width': 834, 'height': 1194})
        platform_modes = []
        policy = f'{today} 開案：iOS／Android 不差異化，Android 沿用 iOS 版面與 system chrome（--unified-platform）。理由：（待填）'
    else:
        viewports = [
            {'name': 'iOS', 'width': 393, 'height': 852},
            {'name': 'Android', 'width': 412, 'height': 915},
        ]
        if tablet:
            viewports += [
                {'name': 'iPad', 'width': 834, 'height': 1194},
                {'name': 'Android Tablet', 'width': 800, 'height': 1280},
            ]
        platform_modes = [
            {'mode': 'iOS', 'css': ':root'},
            {'mode': 'Android', 'css': '[data-platform="android"]'},
        ]
        policy = f'{today} 開案：iOS／Android 差異化（init 預設）。理由：（待填）'
    if tablet:
        size.append({'mode': 'Tablet', 'css': '@media (min-width:600px)'})
    return {
        'viewports': viewports,
        'modes': {
            'Semantic': semantic_modes(dark),
            'Platform': platform_modes,
            'Size': size,
        },
        'options': {'dark': dark, 'tablet': tablet, 'unified_platform': unified},
        'platform_policy': policy,
    }


def semantic_modes(dark):
    modes = [{'mode': 'Light', 'css': ':root'}]
    if dark:
        modes.append({'mode': 'Dark', 'css': '[data-theme="dark"]'})
    return modes


def install_hook(root):
    path = root / '.claude' / 'settings.json'
    data = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
    post = data.setdefault('hooks', {}).setdefault('PostToolUse', [])
    for entry in post:
        for h in entry.get('hooks', []):
            if 'sync_pending.py' in h.get('command', ''):
                return '・hook 已存在，略過'
    post.append({'matcher': 'Edit|Write|MultiEdit|NotebookEdit|Bash', 'hooks': [{'type': 'command', 'command': HOOK_CMD}]})
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return f'✓ hook 已寫入 {path}（沒生效就重開 session）'


def main():
    ap = argparse.ArgumentParser(description='design-loop 開案')
    ap.add_argument('root')
    ap.add_argument('--platform', choices=['web', 'app'], required=True)
    ap.add_argument('--prefix', required=True, help='CSS 前綴，例：xx')
    ap.add_argument('--name', required=True)
    ap.add_argument('--figma-prefix')
    ap.add_argument('--dark', action='store_true')
    ap.add_argument('--tablet', action='store_true', help='APP 才需要指定；Web 預設就有平板')
    ap.add_argument('--framework', default='', help='APP 交接框架，例：flutter')
    ap.add_argument('--unified-platform', action='store_true', help='APP：iOS／Android 不差異化（見 platforms/app.md 開案分支）')
    ap.add_argument('--install-hook', action='store_true')
    a = ap.parse_args()
    if a.unified_platform and a.platform != 'app':
        sys.exit('✕ --unified-platform 只用在 --platform app')

    root = Path(a.root).expanduser().resolve()
    if not root.is_dir():
        sys.exit(f'✕ 找不到專案資料夾：{root}')
    dest = root / '_design-loop'
    if dest.exists():
        sys.exit(f'✕ 已經有 {dest}，不覆蓋。升版請照 CHANGELOG 手動調整 manifest。')

    fp = a.figma_prefix or a.prefix.upper()
    version = (SKILL / 'VERSION').read_text(encoding='utf-8').strip()
    shutil.copytree(TPL, dest)
    for sub in ('measure', 'evidence'):
        (dest / sub).mkdir(exist_ok=True)

    repl = {'__VERSION__': version, '__NAME__': a.name, '__PREFIX__': a.prefix,
            '__FIGMA_PREFIX__': fp, '__DATE__': date.today().isoformat()}
    for f in dest.rglob('*'):
        if f.is_file() and f.suffix in ('.md', '.json'):
            text = f.read_text(encoding='utf-8')
            for k, v in repl.items():
                text = text.replace(k, v)
            f.write_text(text, encoding='utf-8')

    mpath = dest / 'manifest.json'
    m = json.loads(mpath.read_text(encoding='utf-8'))
    m['platform'] = a.platform
    if a.platform == 'app':
        m.update(app_preset(a.dark, a.tablet, a.unified_platform))
        m['handoff'] = {'framework': a.framework}
    elif a.dark:
        m['options']['dark'] = True
        m['modes']['Semantic'] = semantic_modes(True)
    mpath.write_text(json.dumps(m, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    policy = '，iOS／Android 不差異化' if a.unified_platform else ''
    print(f'✓ 建立 {dest}（design-loop {version}，platform={a.platform}{policy}，prefix={a.prefix}／{fp}）')
    for f in sorted(dest.iterdir()):
        print('  ·', f.name)
    if a.install_hook:
        print(install_hook(root))
    print('\n下一步：')
    print('  1. 把 _design-loop/CLAUDE.snippet.md 的內容加進專案 CLAUDE.md')
    print('  2. 填 manifest.source 與 figma.file_key，進 S0（core/s0-source-to-html.md）')


if __name__ == '__main__':
    main()
