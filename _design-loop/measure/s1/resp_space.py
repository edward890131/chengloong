# 有規律的間距 → RWD 語意 token。只動清單內 selector 的指定邊；值完全照現況（D／T／M 三組都要吻合才換）
import json, re, sys, pathlib, collections
S = pathlib.Path(sys.argv[1]); CSS = pathlib.Path('/home/user/chengloong/site/css')
D = json.load(open(S / 'decl5.json'))
TOK = {  # token: (D, T, M)
 'section-pad-top': (40, 40, 40), 'section-pad-bottom': (120, 120, 64), 'section-gap': (64, 64, 48),
 'head-gap': (32, 32, 24), 'heading-gap': (12, 12, 8), 'panel-gap': (12, 12, 8),
 'tab-gap': (16, 16, 12), 'tab-pad-y': (16, 16, 8), 'tab-pad-x': (24, 24, 16), 'gutter': (80, 40, 16),
}
# (selector, 屬性, 邊) → token；邊：t r b l，gap 用 'g'
USE = {}
def u(sel, prop, sides, tok):
    for s in sides: USE[(sel, prop, s)] = tok
for s in ['.cl-about', '.cl-paper', '.cl-process', '.cl-green', '.cl-faq']: u(s, 'padding', 't', 'section-pad-top')
for s in ['.cl-paper', '.cl-green', '.cl-faq', '.cl-cta']: u(s, 'padding', 'b', 'section-pad-bottom')
for s in ['.cl-about', '.cl-paper', '.cl-faq']: u(s, 'gap', 'g', 'section-gap')
u('.cl-green__body', 'margin', 't', 'section-gap'); u('.cl-process__body', 'margin-top', 'g', 'section-gap')
for s in ['.cl-about__head', '.cl-paper__head', '.cl-green__head']: u(s, 'gap', 'g', 'head-gap')
for s in ['.cl-about__heading', '.cl-paper__heading', '.cl-process__head', '.cl-green__heading', '.cl-faq__head']: u(s, 'gap', 'g', 'heading-gap')
for s in ['.cl-about__panel', '.cl-process__booking', '.cl-process__prepare', '.cl-green__card']: u(s, 'padding', 'trbl', 'panel-gap')
for s in ['.cl-about__cards', '.cl-paper__grid', '.cl-process__booking', '.cl-process__steps', '.cl-process__prepare', '.cl-process__prep-pair', '.cl-green__card', '.cl-green__side']: u(s, 'gap', 'g', 'panel-gap')
for s in ['.cl-process__tabs', '.cl-faq__tabs']: u(s, 'gap', 'g', 'tab-gap')
for s in ['.cl-process__tab', '.cl-faq__tab']: u(s, 'padding', 'tb', 'tab-pad-y'); u(s, 'padding', 'rl', 'tab-pad-x')
for s in ['.cl-process', '.cl-cta', '.cl-terms']: u(s, 'padding', 'rl', 'gutter')
for s in ['.cl-process', '.cl-cta', '.cl-terms']: USE[(s, 'padding-left', 'g')] = USE[(s, 'padding-right', 'g')] = 'gutter'
for s in ['.cl-faq']: pass
def mode(m):
    if not m: return 'D'
    if m == '@media (max-width: 640px)': return 'M'
    if m in ('@media (max-width: 1100px) and (min-width: 641px)', '@media (min-width: 641px) and (max-width: 1100px)'): return 'T'
    if m == '@media (max-width: 1100px)': return 'TM'
    return None
def sides(prop, val):
    parts = val.split()
    if prop in ('padding', 'margin'):
        if len(parts) == 1: parts *= 4
        elif len(parts) == 2: parts = [parts[0], parts[1], parts[0], parts[1]]
        elif len(parts) == 3: parts = [parts[0], parts[1], parts[2], parts[1]]
        return dict(zip('trbl', parts))
    return {'g': val}
def num(v):
    m = re.fullmatch(r'var\(--cl-space-(\d+)\)', v)
    if m: return int(m.group(1))
    if v == '0': return 0
    m = re.fullmatch(r'(\d+)px', v)
    return int(m.group(1)) if m else None
def compose(prop, sd):
    if prop not in ('padding', 'margin'): return sd['g']
    t, r, b, l = sd['t'], sd['r'], sd['b'], sd['l']
    if r == l:
        if t == b: return t if t == r else f'{t} {r}'
        return f'{t} {r} {b}'
    return f'{t} {r} {b} {l}'
# 收集每個 (selector, prop) 在各模式的值（含行號）
G = collections.defaultdict(dict)
for d in D:
    md = mode(d['media'])
    if md and (d['sel'], d['prop']) in {(k[0], k[1]) for k in USE}:
        G[(d['sel'], d['prop'])][md] = d
# padding-left/right 拆寫的情況：也收
edits = collections.defaultdict(list); report = []
for (sel, prop), byM in G.items():
    if 'D' not in byM: report.append(f'略過（沒有桌機值）{sel} {prop}'); continue
    sd = {m: sides(prop, d['val']) for m, d in byM.items()}
    eff = {'D': sd['D']}
    eff['T'] = {**sd['D'], **sd.get('TM', {}), **sd.get('T', {})} if True else None
    eff['M'] = {**sd['D'], **sd.get('TM', {}), **sd.get('M', {})}
    new = {m: dict(v) for m, v in sd.items()}
    for side in sd['D']:
        tok = USE.get((sel, prop, side))
        if not tok: continue
        trip = tuple(num(eff[m][side]) for m in 'DTM')
        if trip != TOK[tok]:
            report.append(f'不吻合 {sel} {prop}[{side}] 現況 {trip} ≠ {tok} {TOK[tok]}'); continue
        for m in new:
            if side in new[m]: new[m][side] = f'var(--cl-{tok})'
    for m, d in byM.items():
        nv = compose(prop, new[m])
        if m != 'D':
            base = {**new['D'], **({k: v for k, v in new.get('TM', {}).items()} if m == 'M' else {})}
            if compose(prop, {**base, **new[m]}) == compose(prop, base) and all(new[m][k] == base[k] for k in new[m]):
                nv = None   # 覆寫已和 token 結果相同 → 刪
        if nv != d['val']: edits[(d['file'], d['line'])].append((prop, d['val'], nv))
for f in [CSS / 'base.css'] + sorted((CSS / 'sections').glob('*.css')):
    lines = f.read_text().split('\n')
    for (fn, ln), es in edits.items():
        if fn != f.name: continue
        s = lines[ln - 1]
        for prop, old, new in es:
            pat = r'(?<![\w-])' + re.escape(prop) + r'\s*:\s*' + re.escape(old) + r'\s*;?'
            s2 = re.sub(pat, '' if new is None else f'{prop}: {new};', s, count=1)
            if s2 == s: report.append(f'沒換到 {fn}:{ln} {prop}: {old}')
            s = s2
        lines[ln - 1] = s
    out = [l for l in lines if not (l.strip() == '' and l != '')]
    txt = '\n'.join(out)
    txt = re.sub(r'\n\s*[^{}\n]+\{\s*\}', '', txt)   # 刪掉變空的規則
    f.write_text(txt)
print(sum(len(v) for v in edits.values()), 'edits'); print('\n'.join(report))
