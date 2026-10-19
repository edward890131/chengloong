#!/usr/bin/env python3
"""tokens.json（＋並行碎片）→ tokens.css（S1 產出，S5 每次改 token 後重跑）

用法：
  python3 tokens_build.py [--manifest _design-loop/manifest.json] [--json tokens/tokens.json] [--css css/tokens.css]
      [--frag 'comp-*.json'] [--check] [--merge-into-json]

▸ 預設路徑讀 manifest.paths.tokens_json／tokens_css（相對專案根目錄＝_design-loop 的上一層）；
  --manifest 沒給時從目前目錄往上找 _design-loop/manifest.json
▸ 每個有 $extensions.designLoop.css 的 token 產一行 CSS 變數；alias {a.b.c} 轉成 var(<目標的 css 名>)
▸ 複合型：shadow 物件或陣列 → box-shadow（含 inset）；fontFamily 陣列 → 字體清單；cubicBezier → cubic-bezier()；
  {value, unit} → 數值接單位；欄位裡的 alias 也轉成 var()
▸ $extensions.designLoop.modes：依 manifest.modes 的 css 情境輸出覆寫區塊（@media 開頭的包一層 :root）
▸ 並行碎片：tokens.json 同目錄符合 --frag（預設 comp-*.json）的檔，build 時深度合併進來（任何頂層樹都可以）。
  撞名一律報錯、全部列出、不寫檔（結束碼 1）：
    - 同一個 token 路徑在兩個來源都有（碎片對 tokens.json、碎片對碎片）
    - 一邊是 token、另一邊是 group
    - 同一個 group 的 $type／$description 兩邊寫的不一樣
    - 同一個檔案裡同一層出現重複 key（JSON 解析會靜默保留後者，這裡改成報錯）
  避免撞名：碎片 key 各自加負責人或元件前綴（例 comp.xx-card、comp.xx-sheet），不要兩個碎片寫同一個元件
▸ --check：只檢查撞名與 alias，不寫檔
▸ --merge-into-json：檢查通過後把碎片併回 tokens.json（S1 收尾用；碎片檔不自動刪，確認後手動刪）
▸ tokens.css 是產物，不手改
▸ 結束碼：撞名、alias 找不到、mode 不在 manifest.modes → 1；成功 → 0
"""
import argparse
import json
import re
import sys
from pathlib import Path

ALIAS = re.compile(r'^\{([^}]+)\}$')


class BuildError(Exception):
    pass


# ---------- 讀檔（抓同檔重複 key） ----------
def load_json(path, dup_errors):
    def hook(pairs):
        obj = {}
        for k, v in pairs:
            if k in obj:
                dup_errors.append(f'{path.name}：同一層重複 key「{k}」（JSON 只會保留後者）')
            obj[k] = v
        return obj

    return json.loads(path.read_text(encoding='utf-8'), object_pairs_hook=hook)


def find_manifest(start):
    for d in [start, *start.parents]:
        p = d / '_design-loop' / 'manifest.json'
        if p.exists():
            return p
    return None


# ---------- 合併 ----------
def is_token(node):
    return isinstance(node, dict) and '$value' in node


def merge(dst, src, path, owner, src_name, conflicts):
    """把 src 深度合併進 dst；owner 記每個 token 路徑來自哪個檔，用來寫衝突訊息"""
    for k, v in src.items():
        p = path + (k,)
        dotted = '.'.join(p)
        if k.startswith('$'):
            if k in dst and dst[k] != v:
                conflicts.append(f'{dotted}：{owner.get(path, "?")} 與 {src_name} 的值不同（{dst[k]!r} ≠ {v!r}）')
            else:
                dst[k] = v
            continue
        if k not in dst:
            dst[k] = v
            mark(owner, p, v, src_name)
            continue
        cur = dst[k]
        if is_token(cur) or is_token(v):
            kind = 'token 重複' if is_token(cur) and is_token(v) else 'token 與 group 同名'
            conflicts.append(f'{dotted}：{kind}（{owner.get(p, "?")} 與 {src_name}）')
            continue
        if isinstance(cur, dict) and isinstance(v, dict):
            merge(cur, v, p, owner, src_name, conflicts)
        else:
            conflicts.append(f'{dotted}：非 token 的值重複（{owner.get(p, "?")} 與 {src_name}）')


def mark(owner, path, node, name):
    owner[path] = name
    if isinstance(node, dict) and not is_token(node):
        for k, v in node.items():
            if not k.startswith('$'):
                mark(owner, path + (k,), v, name)


# ---------- 產 CSS ----------
def walk(node, path=(), inherited=None):
    typ = node.get('$type', inherited)
    for k, v in node.items():
        if k.startswith('$') or not isinstance(v, dict):
            continue
        if '$value' in v:
            yield '.'.join(path + (k,)), v, v.get('$type', typ)
        else:
            yield from walk(v, path + (k,), typ)


def css_ref(value, index):
    m = ALIAS.match(value.strip()) if isinstance(value, str) else None
    if not m:
        return None
    target = index.get(m.group(1))
    if not target:
        raise BuildError(f'alias 找不到：{value}')
    css = target['tok'].get('$extensions', {}).get('designLoop', {}).get('css')
    if not css:
        raise BuildError(f'alias 目標沒有 $extensions.designLoop.css：{value}')
    return f'var({css})'


def scalar(v, index):
    ref = css_ref(v, index)
    if ref:
        return ref
    if isinstance(v, dict) and 'value' in v and 'unit' in v:
        return f"{v['value']}{v['unit']}"
    if isinstance(v, dict) and 'hex' in v:
        a = v.get('alpha', 1)
        return v['hex'] if a in (1, None) else f"{v['hex']}{round(a * 255):02x}"
    return str(v)


def fmt(value, type_, index):
    ref = css_ref(value, index)
    if ref:
        return ref
    if type_ == 'shadow' or (isinstance(value, dict) and 'offsetX' in value):
        items = value if isinstance(value, list) else [value]
        return ', '.join(('inset ' if s.get('inset') else '') +
                         ' '.join(scalar(s.get(k, '0'), index) for k in ('offsetX', 'offsetY', 'blur', 'spread', 'color'))
                         for s in items)
    if isinstance(value, list) and value and all(isinstance(x, str) for x in value):  # fontFamily 陣列
        return ', '.join(f'"{f}"' if ' ' in f else f for f in value)
    if type_ == 'cubicBezier' and isinstance(value, list):
        return 'cubic-bezier(' + ', '.join(str(x) for x in value) + ')'
    return scalar(value, index)


def build_css(doc, manifest):
    tokens = list(walk(doc))
    index = {p: {'tok': t, 'type': ty} for p, t, ty in tokens}
    contexts = {m['mode']: m['css'] for group in manifest.get('modes', {}).values() for m in group}
    root, overrides, layer, errors = [], {}, None, []
    for path, tok, typ in tokens:
        ext = tok.get('$extensions', {}).get('designLoop', {})
        css = ext.get('css')
        if not css:
            continue
        top = path.split('.')[0]
        if top != layer:
            layer = top
            root.append(f'\n  /* ── {top} ── */')
        try:
            root.append(f"  {css}: {fmt(tok['$value'], typ, index)};")
            for mode, val in ext.get('modes', {}).items():
                ctx = contexts.get(mode)
                if not ctx:
                    raise BuildError(f'{path} 的 mode「{mode}」不在 manifest.modes')
                overrides.setdefault(ctx, []).append(f"  {css}: {fmt(val, typ, index)};")
        except BuildError as e:
            errors.append(f'{path}：{e}')
    return root, overrides, errors


def main():
    ap = argparse.ArgumentParser(description='tokens.json（＋碎片）→ tokens.css')
    ap.add_argument('--manifest')
    ap.add_argument('--json')
    ap.add_argument('--css')
    ap.add_argument('--frag', default='comp-*.json', help='碎片檔名 glob（在 tokens.json 同目錄找）')
    ap.add_argument('--check', action='store_true', help='只檢查，不寫檔')
    ap.add_argument('--merge-into-json', action='store_true', help='檢查通過後把碎片併回 tokens.json')
    a = ap.parse_args()

    mpath = Path(a.manifest) if a.manifest else find_manifest(Path.cwd().resolve())
    manifest = json.loads(mpath.read_text(encoding='utf-8')) if mpath else {}
    base = mpath.resolve().parent.parent if mpath else Path.cwd()
    paths = manifest.get('paths', {})
    json_path = Path(a.json) if a.json else base / (paths.get('tokens_json') or 'tokens/tokens.json')
    css_path = Path(a.css) if a.css else (base / paths['tokens_css'] if paths.get('tokens_css') else None)
    if not a.check and not css_path:
        sys.exit('✕ 沒有 --css，manifest.paths.tokens_css 也沒填')

    dup = []
    doc = load_json(json_path, dup)
    owner = {}
    mark(owner, (), doc, json_path.name)
    conflicts = []
    frags = sorted(p for p in json_path.parent.glob(a.frag) if p.resolve() != json_path.resolve())
    for frag in frags:
        merge(doc, load_json(frag, dup), (), owner, frag.name, conflicts)
    conflicts = dup + conflicts
    if conflicts:
        print(f'✕ 撞名 {len(conflicts)} 處（碎片 {len(frags)} 個），未寫檔：')
        for c in conflicts:
            print('  ▸ ' + c)
        sys.exit(1)

    root, overrides, errors = build_css(doc, manifest)
    if errors:
        print(f'✕ 產生 CSS 失敗 {len(errors)} 處，未寫檔：')
        for e in errors:
            print('  ▸ ' + e)
        sys.exit(1)

    count = sum(1 for l in root if l.strip().startswith('--'))
    if a.check:
        print(f'✓ 檢查通過：{json_path.name}＋碎片 {len(frags)} 個，{count} 個變數，無撞名')
        return

    if a.merge_into_json and frags:
        json_path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f'✓ 碎片 {len(frags)} 個已併回 {json_path}（碎片檔確認後手動刪除：{", ".join(f.name for f in frags)}）')

    name = manifest.get('project') or 'project'
    out = [f'/* {name} tokens.css — 由 {json_path.name} 產生（design-loop scripts/tokens_build.py），不要手改 */', ':root {']
    out += root
    out.append('}')
    for ctx, lines in overrides.items():
        if ctx.startswith('@media'):
            out += ['', ctx + ' {', '  :root {'] + ['  ' + l for l in lines] + ['  }', '}']
        else:
            out += ['', ctx + ' {'] + lines + ['}']
    css_path.parent.mkdir(parents=True, exist_ok=True)
    css_path.write_text('\n'.join(out) + '\n', encoding='utf-8')
    print(f'✓ {css_path}：{count} 個變數（碎片 {len(frags)} 個），覆寫情境 {list(overrides)}')


if __name__ == '__main__':
    main()
