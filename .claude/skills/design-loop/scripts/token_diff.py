#!/usr/bin/env python3
"""tokens.css ↔ Figma Variables ↔ tokens.json 比對（S1、S3 驗收，S5 驗證）

用法：
  python3 token_diff.py --css tokens.css --figma _design-loop/measure/figma_vars_*.json \\
      --manifest _design-loop/manifest.json [--json tokens.json] [--out _design-loop/measure/token_diff.md]

▸ --figma：figma_export_variables.js 每批回傳存成的檔（可多個）
▸ 變數 ↔ CSS 名稱：先看 codeSyntax.WEB；沒設時用 manifest.token_map 規則（既有專案補建用），例：
    "token_map": [{"collection": "Primitives", "figma": "color/(.+)", "css": "--xx-ref-\\\\1"},
                  {"figma": "type/(.+)/size", "css": "--xx-fs-\\\\1"}, {"figma": "(.+)", "css": "--xx-\\\\1"}]
  規則由上往下，第一條 fullmatch 的生效；結果裡的 / 會換成 -
▸ mode ↔ CSS 情境：manifest.modes（key 是 collection 名稱的一部分就算對到；mode 名稱相同或以它開頭就算對到，
  例 "Desktop ≥1101" 對 "Desktop"）；沒寫在 manifest.modes 的 collection，第一個 mode 對 :root
▸ manifest.token_diff_ignore：刻意不一致的 CSS 變數名或 Figma 變數名（例：token 是 min-height 下限、Figma 畫渲染尺寸），
  列在報告的「略過」，不算失敗
▸ tokens.json：比對 $value（:root）與 $extensions.designLoop.modes 各 mode
▸ DTCG 複合型（$type 可寫在 token 或上層 group）：
    fontFamily 陣列 ↔ CSS 字體清單（逐個比，引號與大小寫不計）
    shadow 物件或陣列 ↔ box-shadow（逐層比 offsetX offsetY blur spread color inset；CSS 省略 spread 視為 0）
    cubicBezier 陣列 ↔ cubic-bezier()（差 ≤0.001；CSS 關鍵字 ease／linear／ease-in／ease-out／ease-in-out 也認得）
  其他複合型（typography、border、transition、gradient…）或欄位不完整、Figma 端數值／顏色變數對到複合值
  → 列在「略過（複合型）」，不算失敗。不需要再把這類變數寫進 token_diff_ignore
▸ 比對規則：色 RGB 差 ≤1、alpha 差 ≤0.01；數字差 ≤0.01；CSS 比例行高或 em 對 Figma px 列為「單位不同」（人工看，不算失敗）
▸ 結束碼：有不一致、CSS 缺變數、tokens.json 與 CSS 不一致、或（沒有 token_map 時）變數沒設 codeSyntax → 1；全部通過 → 0
  （略過、單位不同、略過（複合型）不影響結束碼）
"""
import argparse
import json
import re
import sys
from pathlib import Path


# ---------- CSS ----------
def norm(s):
    return re.sub(r'\s+', '', s)


def parse_css(text):
    """回傳 {情境: {變數名: 原始值}}；情境＝外層區塊標頭（去空白）用空格串起來，例 '@media(max-width:1100px) :root'"""
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    stack, buf, out = [], '', {}

    def flush(b):
        m = re.match(r'^\s*(--[\w-]+)\s*:\s*(.+?)\s*$', b, flags=re.S)
        if m and stack:
            out.setdefault(' '.join(stack), {})[m.group(1)] = m.group(2)

    for ch in text:
        if ch == '{':
            stack.append(norm(buf))
            buf = ''
        elif ch == '}':
            flush(buf)
            buf = ''
            if stack:
                stack.pop()
        elif ch == ';':
            flush(buf)
            buf = ''
        else:
            buf += ch
    return out


def media_bound(ctx):
    m = re.search(r'\((max|min)-width:(\d+(?:\.\d+)?)px\)', ctx)
    return (m.group(1), float(m.group(2))) if m else None


def contexts_for(spec, css):
    """mode 對應的 CSS 情境，依優先順序排列（lookup 找不到會再退回 :root）。
    max-width／min-width 斷點照 CSS 疊加：≤640 也吃 ≤1100 的值，越接近本斷點的優先。spec 可以是字串或清單。"""
    out = []
    for sp in (spec if isinstance(spec, list) else [spec]):
        s = norm(sp)
        if s == ':root':
            continue
        bound = media_bound(s)
        if bound:
            kind, n = bound
            cands = []
            for c in css:
                cb = media_bound(c)
                if cb and cb[0] == kind and (cb[1] >= n if kind == 'max' else cb[1] <= n):
                    cands.append((abs(cb[1] - n), c))
            out += [c for _, c in sorted(cands)]
        else:
            out += [c for c in css if s in c]
    return out


def lookup(name, spec, css, depth=0):
    for ctx in contexts_for(spec, css) + [':root']:
        if name in css.get(ctx, {}):
            return resolve_vars(css[ctx][name], spec, css, depth)
    return None


def resolve_vars(raw, spec, css, depth):
    if depth > 10:
        return raw

    def rep(m):
        v = lookup(m.group(1), spec, css, depth + 1)
        if v is not None:
            return v
        return (m.group(2) or '').strip() or m.group(0)

    return re.sub(r'var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)', rep, raw)


# ---------- 值 ----------
def parse_color(v):
    v = v.strip().lower()
    m = re.fullmatch(r'#([0-9a-f]{3,8})', v)
    if m:
        h = m.group(1)
        if len(h) in (3, 4):
            h = ''.join(c * 2 for c in h)
        if len(h) not in (6, 8):
            return None
        r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return (r, g, b, round(a, 3))
    m = re.fullmatch(r'rgba?\(([^)]*)\)', v)
    if m:
        parts = [p for p in re.split(r'[\s,/]+', m.group(1).strip()) if p]
        if len(parts) < 3:
            return None

        def ch(p):
            return float(p[:-1]) * 2.55 if p.endswith('%') else float(p)

        a = 1.0
        if len(parts) > 3:
            a = float(parts[3][:-1]) / 100 if parts[3].endswith('%') else float(parts[3])
        return (ch(parts[0]), ch(parts[1]), ch(parts[2]), round(a, 3))
    if v == 'transparent':
        return (0, 0, 0, 0.0)
    return None


def parse_value(v):
    if v is None:
        return ('str', '')
    v = str(v).strip()
    c = parse_color(v)
    if c:
        return ('color', c)
    m = re.fullmatch(r'(-?\d*\.?\d+)(px)?', v)
    if m:
        return ('px' if m.group(2) else 'num', float(m.group(1)))
    m = re.fullmatch(r'(-?\d*\.?\d+)(em|rem|%|ms|s)', v)
    if m:
        return (m.group(2), float(m.group(1)))
    return ('str', v)


def figma_value(val):
    if isinstance(val, dict) and 'r' in val:
        return ('color', (val['r'] * 255, val['g'] * 255, val['b'] * 255, round(val.get('a', 1), 3)))
    if isinstance(val, (int, float)) and not isinstance(val, bool):
        return ('num', float(val))
    if isinstance(val, str) and parse_color(val):
        return ('color', parse_color(val))
    return ('str', '' if val is None else str(val))


def same_color(a, b):
    return max(abs(x - y) for x, y in zip(a[:3], b[:3])) <= 1.0 and abs(a[3] - b[3]) <= 0.01


def compare(css_v, fig_v):
    ck, cv = css_v
    fk, fv = fig_v
    if fk == 'color':
        return 'ok' if ck == 'color' and same_color(cv, fv) else 'mismatch'
    if fk == 'num':
        if ck in ('px', 'num'):
            if abs(cv - fv) <= 0.01:
                return 'ok'
            if ck == 'num' and cv < 4 <= fv:
                return 'unit'
            return 'mismatch'
        if ck in ('em', 'rem', '%'):
            return 'unit'
        return 'mismatch'
    first = str(cv).split(',')[0].strip().strip('"\'') if ck == 'str' else str(cv)
    return 'ok' if first == fv.strip() else 'mismatch'


def same_value(a, b):
    pa, pb = parse_value(a), parse_value(b)
    if pa[0] == pb[0] == 'color':
        return same_color(pa[1], pb[1])
    if pa[0] in ('px', 'num') and pb[0] in ('px', 'num'):
        return abs(pa[1] - pb[1]) <= 0.01 and (pa[0] == pb[0] or 0 in (pa[1], pb[1]))
    return pa == pb


# ---------- Figma 匯出 ----------
def load_figma(paths):
    """合併多批匯出；支援精簡格式（c／v）與舊的 variables 格式"""
    out = {}
    for p in paths:
        data = json.loads(Path(p).read_text(encoding='utf-8'))
        if 'v' in data:
            cols = data['c']
            for name, ci, typ, web, vals in data['v']:
                col = cols[ci]
                out[(col['n'], name)] = {'name': name, 'collection': col['n'], 'type': typ, 'web': web,
                                         'values': dict(zip(col['m'], vals))}
        else:
            for v in data.get('variables', []):
                out[(v['collection'], v['name'])] = v
    return list(out.values())


def css_name_for(v, rules):
    m = re.search(r'--[\w-]+', v.get('web') or '')
    if m:
        return m.group(0), 'codeSyntax'
    for r in rules:
        if r.get('collection') and r['collection'].lower() not in v['collection'].lower():
            continue
        if re.fullmatch(r['figma'], v['name']):
            return re.sub(r['figma'], r['css'], v['name']).replace('/', '-'), 'token_map'
    return None, None


def mode_spec(cfg, mode, index):
    if cfg is None:
        return ':root' if index == 0 else None
    for x in cfg:
        if mode == x['mode'] or mode.startswith(x['mode']):
            return x['css']
    return None


def find_spec(modes_cfg, mode):
    for modes in modes_cfg.values():
        spec = mode_spec(modes, mode, -1)
        if spec:
            return spec
    return None


# ---------- tokens.json ----------
def walk_dtcg(node, path=(), inherited=None):
    """產出 (path, node, 有效 $type)；$type 可從上層 group 繼承"""
    if isinstance(node, dict):
        typ = node.get('$type', inherited)
        if '$value' in node:
            yield path, node, typ
        for k, v in node.items():
            if not k.startswith('$'):
                yield from walk_dtcg(v, path + (k,), typ)


class Composite:
    """複合型 token 解析後的值：kind＝fontFamily／shadow／cubicBezier；css＝格式化後的 CSS 字串"""

    def __init__(self, kind, css):
        self.kind, self.css = kind, css

    def __str__(self):
        return self.css


class Skip(Exception):
    """無法比對的複合型，訊息是原因"""


def alias_node(val, root):
    m = re.fullmatch(r'\{([^}]+)\}', val.strip()) if isinstance(val, str) else None
    if not m:
        return None
    node = root
    for p in m.group(1).split('.'):
        node = node.get(p) if isinstance(node, dict) else None
    return node if isinstance(node, dict) else {}


def guess_type(val):
    if isinstance(val, list):
        if val and all(isinstance(x, str) for x in val):
            return 'fontFamily'
        if len(val) == 4 and all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in val):
            return 'cubicBezier'
        if val and all(isinstance(x, dict) and 'offsetX' in x for x in val):
            return 'shadow'
    if isinstance(val, dict) and 'offsetX' in val:
        return 'shadow'
    return None


def scalar(val, root, depth):
    """單一欄位（顏色、尺寸、數字）→ CSS 字串；解不出來回傳 None"""
    node = alias_node(val, root)
    if node is not None:
        return scalar(node.get('$value'), root, depth + 1) if depth < 10 else None
    if isinstance(val, str):
        return val
    if isinstance(val, bool):
        return None
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, dict):
        if 'value' in val and 'unit' in val:
            return f"{val['value']}{val['unit']}"
        if 'hex' in val:  # DTCG 顏色物件
            a = val.get('alpha', 1)
            return val['hex'] if a in (1, None) else f"{val['hex']}{round(a * 255):02x}"
        if val.get('colorSpace') == 'srgb' and 'components' in val:
            r, g, b = (round(c * 255) for c in val['components'])
            return f"rgba({r}, {g}, {b}, {val.get('alpha', 1)})"
    return None


def resolve_dtcg(val, root, typ=None, depth=0):
    """回傳 CSS 字串、Composite（複合型）；不能比的複合型丟 Skip；alias 斷掉回傳 None"""
    node = alias_node(val, root)
    if node is not None:
        if depth >= 10 or '$value' not in node:
            return None
        return resolve_dtcg(node['$value'], root, typ or node.get('$type'), depth + 1)
    kind = typ if typ in ('fontFamily', 'shadow', 'cubicBezier') else guess_type(val)
    if kind == 'fontFamily' and isinstance(val, list):
        return Composite(kind, ', '.join(f'"{f}"' if ' ' in f else f for f in val))
    if kind == 'cubicBezier' and isinstance(val, list):
        if len(val) != 4:
            raise Skip('cubicBezier 不是 4 個數')
        return Composite(kind, 'cubic-bezier(' + ', '.join(str(x) for x in val) + ')')
    if kind == 'shadow' and isinstance(val, (list, dict)):
        layers = []
        for s in (val if isinstance(val, list) else [val]):
            if not isinstance(s, dict):
                raise Skip('shadow 層不是物件')
            parts = [scalar(s.get(k), root, depth) for k in ('offsetX', 'offsetY', 'blur', 'spread', 'color')]
            if None in parts:
                raise Skip('shadow 欄位不完整或 alias 解不開')
            layers.append(('inset ' if s.get('inset') else '') + ' '.join(parts))
        return Composite(kind, ', '.join(layers))
    simple_obj = isinstance(val, dict) and (('value' in val and 'unit' in val) or 'hex' in val or 'components' in val)
    if isinstance(val, (list, dict)) and not simple_obj:
        raise Skip(f'複合型 {typ or "（未標 $type）"} 沒有對應的 CSS 單值')
    return scalar(val, root, depth)


# ---------- 複合型比對 ----------
BEZIER_KEYWORDS = {'linear': (0, 0, 1, 1), 'ease': (0.25, 0.1, 0.25, 1), 'ease-in': (0.42, 0, 1, 1),
                   'ease-out': (0, 0, 0.58, 1), 'ease-in-out': (0.42, 0, 0.58, 1)}


def split_top(s, sep):
    """依 sep 切字串，括號內的不切"""
    out, buf, depth = [], '', 0
    for ch in s:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if depth == 0 and (ch == sep or (sep == ' ' and ch.isspace())):
            if buf.strip():
                out.append(buf.strip())
            buf = ''
        else:
            buf += ch
    if buf.strip():
        out.append(buf.strip())
    return out


def shadow_layers(s):
    layers = []
    for layer in split_top(s, ','):
        toks = split_top(layer, ' ')
        inset = 'inset' in toks
        color = next((t for t in toks if parse_color(t)), None)
        lens = [t for t in toks if t != 'inset' and t != color]
        if len(lens) == 2:
            lens += ['0']
        if len(lens) == 3:
            lens += ['0']
        layers.append((inset, lens, color or 'currentcolor'))
    return layers


def bezier(s):
    s = s.strip().lower()
    if s in BEZIER_KEYWORDS:
        return BEZIER_KEYWORDS[s]
    m = re.fullmatch(r'cubic-bezier\(([^)]*)\)', s)
    if not m:
        return None
    try:
        return tuple(float(x) for x in m.group(1).split(','))
    except ValueError:
        return None


def same_composite(comp, css_val):
    if comp.kind == 'fontFamily':
        fam = lambda s: [f.strip().strip('"\'').lower() for f in s.split(',') if f.strip()]
        return fam(comp.css) == fam(css_val)
    if comp.kind == 'cubicBezier':
        a, b = bezier(comp.css), bezier(css_val)
        return a is not None and b is not None and len(a) == len(b) == 4 and all(abs(x - y) <= 0.001 for x, y in zip(a, b))
    if comp.kind == 'shadow':
        a, b = shadow_layers(comp.css), shadow_layers(css_val)
        if len(a) != len(b):
            return False
        for (ia, la, ca), (ib, lb, cb) in zip(a, b):
            if ia != ib or len(la) != len(lb) or not all(same_value(x, y) for x, y in zip(la, lb)):
                return False
            pa, pb = parse_color(ca), parse_color(cb)
            if not (pa and pb and same_color(pa, pb)) and ca.lower() != cb.lower():
                return False
        return True
    return False


def looks_composite(raw):
    """CSS 值是否為複合值（字體清單、多段長度的 shadow、cubic-bezier）"""
    if raw is None:
        return False
    s = raw.strip().lower()
    return s.startswith('cubic-bezier(') or s in BEZIER_KEYWORDS or len(split_top(s, ',')) > 1 \
        or len(split_top(s, ' ')) > 2


# ---------- 主程式 ----------
def table(head, rows):
    if not rows:
        return ['（無）', '']
    lines = ['| ' + ' | '.join(head) + ' |', '|' + '---|' * len(head)]
    lines += ['| ' + ' | '.join(str(c) for c in r) + ' |' for r in rows]
    return lines + ['']


def main():
    ap = argparse.ArgumentParser(description='tokens.css ↔ Figma Variables ↔ tokens.json 比對')
    ap.add_argument('--css', required=True)
    ap.add_argument('--figma', nargs='+', default=[])
    ap.add_argument('--manifest')
    ap.add_argument('--json', dest='tokens_json')
    ap.add_argument('--out')
    a = ap.parse_args()
    if not a.figma and not a.tokens_json:
        ap.error('至少要給 --figma 或 --json')

    css = parse_css(Path(a.css).read_text(encoding='utf-8'))
    variables = load_figma(a.figma)
    manifest = json.loads(Path(a.manifest).read_text(encoding='utf-8')) if a.manifest else {}
    modes_cfg = manifest.get('modes', {})
    rules = manifest.get('token_map', [])
    ignore = set(manifest.get('token_diff_ignore', []))
    css_names = {n for d in css.values() for n in d}

    mismatch, missing, unit, unmapped, no_name, ignored, used = [], [], [], [], [], [], set()
    composite_skipped = []  # (來源, 名稱, CSS, 原因)
    via_syntax = via_map = checked = 0
    for v in variables:
        if v.get('type') == 'BOOLEAN':
            continue
        name, how = css_name_for(v, rules)
        if name in ignore or v['name'] in ignore:
            ignored.append((v['collection'], v['name'], name))
            used.add(name)
            continue
        if not v.get('web'):
            no_name.append((v['collection'], v['name'], name or '（規則也對不到）'))
        if not name:
            continue
        via_syntax += how == 'codeSyntax'
        via_map += how == 'token_map'
        used.add(name)
        if name not in css_names:
            missing.append((v['collection'], v['name'], name))
            continue
        cfg = next((modes for key, modes in modes_cfg.items() if key.lower() in v['collection'].lower()), None)
        for i, (mode, val) in enumerate(v.get('values', {}).items()):
            spec = mode_spec(cfg, mode, i)
            if spec is None:
                unmapped.append((v['collection'], v['name'], mode))
                continue
            raw = lookup(name, spec, css)
            fv = figma_value(val)
            if fv[0] != 'str' and parse_value(raw)[0] == 'str' and looks_composite(raw):
                composite_skipped.append(('Figma', f"{v['name']} @{mode}", name, f'Figma {v.get("type")} 變數對到 CSS 複合值'))
                continue
            checked += 1
            res = compare(parse_value(raw), fv)
            row = (v['name'], mode, name, raw, val)
            if res == 'mismatch':
                mismatch.append(row)
            elif res == 'unit':
                unit.append(row)

    json_bad, json_unlabeled, json_checked = [], 0, 0
    if a.tokens_json:
        root = json.loads(Path(a.tokens_json).read_text(encoding='utf-8'))
        for path, node, typ in walk_dtcg(root):
            ext = (node.get('$extensions') or {}).get('designLoop') or {}
            cname = ext.get('css')
            if not cname:
                if path and path[0] in ('sys', 'comp'):
                    json_unlabeled += 1
                continue
            if cname in ignore:
                continue
            checks = [(None, node['$value'])] + list((ext.get('modes') or {}).items())
            for mode, raw_val in checks:
                label = '.'.join(path) + (f' @{mode}' if mode else '')
                spec = ':root' if mode is None else find_spec(modes_cfg, mode)
                if spec is None:
                    json_bad.append((label, cname, raw_val, '（mode 沒寫在 manifest.modes）'))
                    continue
                try:
                    jv = resolve_dtcg(raw_val, root, typ)
                except Skip as e:
                    composite_skipped.append(('tokens.json', label, cname, str(e)))
                    continue
                cv = lookup(cname, spec, css)
                json_checked += 1
                if isinstance(jv, Composite):
                    ok = cv is not None and same_composite(jv, cv)
                else:
                    ok = jv is not None and cv is not None and same_value(jv, cv)
                if not ok:
                    json_bad.append((label, cname, jv, cv))

    root_only = sorted(n for n in css.get(':root', {}) if n not in used)
    no_syntax_fail = bool(no_name) and not rules
    lines = ['# token_diff', '']
    if a.figma:
        lines += [f'- Figma 變數：{len(variables)}（codeSyntax 對應 {via_syntax}、token_map 對應 {via_map}），比對 {checked} 個 mode 值',
                  f'- 不一致：**{len(mismatch)}**',
                  f'- Figma 有、CSS 沒有：**{len(missing)}**',
                  f'- 未設 codeSyntax.WEB：**{len(no_name)}**' + ('（有 token_map 暫代，S3 驗收仍要補）' if rules and no_name else ''),
                  f'- 單位不同（人工看）：{len(unit)}',
                  f'- mode 沒對應到 CSS 情境（補 manifest.modes）：{len(unmapped)}',
                  f'- 略過（token_diff_ignore）：{len(ignored)}',
                  f'- CSS 有、Figma 沒有（資訊）：{len(root_only)}']
    lines.append(f'- 略過（複合型，無法比對）：{len(composite_skipped)}')
    if a.tokens_json:
        lines += [f'- tokens.json 比對 {json_checked} 個值，與 CSS 不一致：**{len(json_bad)}**',
                  f'- tokens.json sys／comp 未標 $extensions.designLoop.css：{json_unlabeled}']
    lines.append('')
    if a.figma:
        lines += ['## 不一致', ''] + table(['變數', 'mode', 'CSS', 'CSS 值', 'Figma 值'], mismatch)
        lines += ['## Figma 有、CSS 沒有', ''] + table(['collection', '變數', 'CSS 名'], missing)
        lines += ['## 單位不同（人工看）', ''] + table(['變數', 'mode', 'CSS', 'CSS 值', 'Figma 值'], unit)
        lines += ['## mode 沒對應', ''] + table(['collection', '變數', 'mode'], unmapped)
        lines += ['## 略過', ''] + table(['collection', '變數', 'CSS 名'], ignored)
        lines += ['## 未設 codeSyntax.WEB', ''] + table(['collection', '變數', '推得的 CSS 名'], no_name)
    if a.tokens_json:
        lines += ['## tokens.json ↔ CSS 不一致', ''] + table(['token', 'CSS', 'json 值', 'CSS 值'], json_bad)
    lines += ['## 略過（複合型）', ''] + table(['來源', 'token／變數', 'CSS', '原因'], composite_skipped)
    if a.figma:
        lines += ['## CSS 有、Figma 沒有（資訊）', '', '、'.join(root_only) or '（無）', '']

    report = '\n'.join(lines)
    if a.out:
        Path(a.out).write_text(report, encoding='utf-8')
        print('\n'.join(l for l in lines if l.startswith('- ')))
        print(f'\n完整報告：{a.out}')
    else:
        print(report)
    sys.exit(1 if (mismatch or missing or json_bad or no_syntax_fail) else 0)


if __name__ == '__main__':
    main()
