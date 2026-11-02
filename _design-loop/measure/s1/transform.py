# S2 對齊：CSS 寫死值 → token。先依 decl.json（原始行號）處理文字角色，再做全檔值替換
import json, re, sys, pathlib, collections
S = pathlib.Path('/tmp/claude-0/-home-user/871fea12-86cb-582f-84c1-ad6b48a1cb04/scratchpad/s1')
CSS = pathlib.Path('/home/user/chengloong/site/css')
D = json.load(open(S / 'decl.json'))
report = collections.defaultdict(list)

def mode(m):
    if not m: return 'D'
    if 'keyframes' in m: return None
    if m == '@media (max-width: 640px)': return 'M'
    if m in ('@media (max-width: 1100px) and (min-width: 641px)', '@media (min-width: 641px) and (max-width: 1100px)'): return 'T'
    if m == '@media (max-width: 1100px)': return 'TM'
    return 'X'

# ---------- 文字角色對照：(檔名, selector 完全相同, 模式) → 角色／'del'／'keep' ----------
ROLE = {}
def r(f, sel, md, role): ROLE[(f, sel, md)] = role
D_ = 'D'
for f, sel, role in [
  ('base.css', '.cl-btn', 'btn'), ('base.css', '.cl-btn--sm', 'btn-sm'), ('base.css', '.cl-loader__label', 'body'),
  ('01-hero.css', '.cl-hero__nav-link', 'nav'), ('01-hero.css', '.cl-hero__tip-body', 'body'), ('01-hero.css', '.cl-menu__link', 'title-l'),
  ('02-about.css', '.cl-about__eyebrow', 'eyebrow'), ('02-about.css', '.cl-about__title', 'h2'), ('02-about.css', '.cl-about__lead', 'body-l'),
  ('02-about.css', '.cl-about__card-title', 'title'), ('02-about.css', '.cl-about__card-desc', 'body'), ('02-about.css', '.cl-about__pill', 'title'),
  ('02-about.css', '.cl-about__cycle-sub', 'body-l'),
  ('03-paper.css', '.cl-paper__eyebrow', 'eyebrow'), ('03-paper.css', '.cl-paper__title', 'h2'), ('03-paper.css', '.cl-paper__lead', 'body-l'),
  ('03-paper.css', '.cl-paper__no-label', 'num-label'), ('03-paper.css', '.cl-paper__no-num', 'num-xl'), ('03-paper.css', '.cl-paper__step-title', 'h3'),
  ('03-paper.css', '.cl-paper__desc', 'body-l'), ('03-paper.css', '.cl-paper__note-text', 'body'),
  ('04-process.css', '.cl-process__eyebrow', 'eyebrow'), ('04-process.css', '.cl-process__title', 'h2'), ('04-process.css', '.cl-process__card-title', 'h3'),
  ('04-process.css', '.cl-process__card-desc', 'body'), ('04-process.css', '.cl-process__tab', 'tab'), ('04-process.css', '.cl-process__step-label', 'title-l'),
  ('04-process.css', '.cl-process__step-num', 'num-m'), ('04-process.css', '.cl-process__step-title', 'title'), ('04-process.css', '.cl-process__tip-body', 'body'),
  ('04-process.css', '.cl-process__step-desc, .cl-process__step-list', 'body'), ('04-process.css', '.cl-process__prep-title', 'title'),
  ('04-process.css', '.cl-process__prep-sub', 'body-l'), ('04-process.css', '.cl-process__prep-desc', 'body'), ('04-process.css', '.cl-process__prep-line-name', 'body-l'),
  ('04-process.css', '.cl-process__prep-way', 'body'), ('04-process.css', '.cl-process__prep-note', 'body'), ('04-process.css', '.cl-process__paper-btn', 'tab'),
  ('04-process.css', '.cl-process__route-num', 'num-s'), ('04-process.css', '.cl-process__route-desc', 'body'),
  ('05-green.css', '.cl-green__eyebrow', 'eyebrow'), ('05-green.css', '.cl-green__title', 'h2'), ('05-green.css', '.cl-green__lead', 'body-l'),
  ('05-green.css', '.cl-green__en', 'num-l'), ('05-green.css', '.cl-green__name', 'h2'), ('05-green.css', '.cl-green__desc', 'body-l'),
  ('05-green.css', '.cl-green__info-head', 'body-l'), ('05-green.css', '.cl-green__info-body', 'body'), ('05-green.css', '.cl-green__pill', 'body-l'),
  ('05-green.css', '.cl-green__tile-desc', 'body'),
  ('07-faq.css', '.cl-faq__eyebrow', 'eyebrow'), ('07-faq.css', '.cl-faq__title', 'h2'), ('07-faq.css', '.cl-faq__tab', 'tab'),
  ('07-faq.css', '.cl-faq__num', 'num-xs'), ('07-faq.css', '.cl-faq__question', 'body-l'), ('07-faq.css', '.cl-faq__answer', 'body'),
  ('08-cta.css', '.cl-cta__title', 'h2'), ('08-cta.css', '.cl-cta__desc', 'body'),
  ('09-footer.css', '.cl-footer__brand', 'body-l'), ('09-footer.css', '.cl-footer__sub', 'body'), ('09-footer.css', '.cl-footer__copy', 'micro'),
  ('09-footer.css', '.cl-footer__label', 'body-l'), ('09-footer.css', '.cl-footer__value', 'body'), ('09-footer.css', '.cl-footer__slogan', 'display'),
  ('10-terms.css', '.cl-terms__eyebrow', 'overline'), ('10-terms.css', '.cl-terms__title', 'h1'), ('10-terms.css', '.cl-terms__h', 'h4'),
  ('10-terms.css', '.cl-terms__p', 'body-long'),
]: r(f, sel, 'D', role)
# 斷點規則：預設「刪掉，交給 token 的 mode」；例外如下
OVR = {
  ('04-process.css', '.cl-process__card-title', 'T'): 'title-l',
  ('04-process.css', '.cl-process__paper-btn', 'TM'): 'tab-s',
  ('04-process.css', '.cl-process__route-hint', 'TM'): 'body',
  ('base.css', '.cl-btn--sm-s', 'M'): 'btn-sm',
  ('08-cta.css', '.cl-cta__actions .cl-btn', 'M'): 'btn-sm',
  ('01-hero.css', '.cl-hero__cta', 'M'): 'btn-sm',
  ('01-hero.css', '.cl-hero__tag', 'M'): 'micro',
  ('01-hero.css', '.cl-hero__tag-tip-body', 'M'): 'body',   # 決策 4：13 → 14
  ('02-about.css', '.cl-about__cycle-mode-btn', 'M'): 'body',
  ('02-about.css', '.cl-about__cycle.is-h .cl-about__cycle-hint', 'M'): 'caption',
  ('07-faq.css', '.cl-faq__tab--tall', 'M'): 'del',
  ('09-footer.css', '.cl-footer__slogan', 'T'): 'keep',   # 平板流動字級
  ('05-green.css', '.cl-green__en', 'X'): 'keep',
}
TPROPS = {'font-size': 'fs', 'line-height': 'lh', 'letter-spacing': 'ls'}
FW = {'400': 'regular', '500': 'medium', '600': 'semibold', '700': 'bold'}
by_file_line = collections.defaultdict(list)   # (file, line) → [(prop, newval or None)]
for d in D:
    md = mode(d['media'])
    if md is None: continue
    f, sel, p = d['file'], d['sel'], d['prop']
    if p == 'font-weight' and d['val'] in FW:
        by_file_line[(f, d['line'])].append((p, d['val'], f'var(--cl-fw-{FW[d["val"]]})')); continue
    if p not in TPROPS: continue
    act = None
    if md == 'D' and (f, sel, 'D') in ROLE: act = ROLE[(f, sel, 'D')]
    elif (f, sel, md) in OVR: act = OVR[(f, sel, md)]
    elif md != 'D' and (f, sel, 'D') in ROLE: act = 'del'
    if act is None or act == 'keep':
        if not re.search(r'var\(|calc|clamp|max\(|min\(|cqw|em$|^normal$|^[0-9.]+$|^0$', d['val']):
            report['type-raw'].append(f"{f}:{d['line']} [{md}] {sel} {p}: {d['val']}")
        continue
    if act == 'del':
        by_file_line[(f, d['line'])].append((p, d['val'], None)); continue
    k = TPROPS[p]
    if act == 'btn' and k == 'lh': continue
    if act == 'display' and k == 'lh': continue
    by_file_line[(f, d['line'])].append((p, d['val'], f'var(--cl-{act}-{k})'))

# ---------- 顏色 ----------
def canon(v):
    v = v.strip().lower().replace(' ', '')
    m = re.fullmatch(r'#([0-9a-f]{3})', v)
    if m: v = '#' + ''.join(c * 2 for c in m.group(1))
    m = re.fullmatch(r'rgba?\((\d+),(\d+),(\d+)(?:,([0-9.]+))?\)', v)
    if m:
        r_, g_, b_ = (int(x) for x in m.group(1, 2, 3)); al = float(m.group(4)) if m.group(4) else 1
        v = '#%02x%02x%02x' % (r_, g_, b_) + ('' if al == 1 else '@%g' % al)
    return v
OLD = {'var(--cl-green-500)': '#14a558', 'var(--cl-green-600)': '#138248', 'var(--cl-green-700)': '#15663c', 'var(--cl-green-400)': '#1fc36c',
       'var(--cl-ink-900)': '#111111', 'var(--cl-ink-800)': '#1f1f1f', 'var(--cl-ink-800-80)': '#1f1f1f@0.8', 'var(--cl-ink-800-60)': '#1f1f1f@0.6',
       'var(--cl-ink-800-10)': '#1f1f1f@0.1', 'var(--cl-white)': '#ffffff'}
TEXT = {'#111111': 'text-strong', '#000000': 'text-strong', '#1f1f1f': 'text', '#1f1f1f@0.8': 'text-soft', '#1f1f1f@0.6': 'text-secondary',
        '#989898': 'text-tertiary', '#ffffff': 'text-inverse', '#ffffff@0.8': 'text-inverse-soft', '#ffffff@0.6': 'text-inverse-muted',
        '#14a558': 'text-accent', '#15663c': 'text-accent-strong', '#1fc36c': 'text-accent-light', '#138248': 'surface-brand'}
SURF = {'#ffffff': 'surface', '#f6f6f6': 'surface-muted', '#f9f9f9': 'surface-subtle', '#111111': 'surface-inverse', '#000000': 'surface-inverse',
        '#1f1f1f': 'surface-inverse-soft', '#444444': 'surface-neutral-strong', '#454545': 'surface-neutral-strong', '#5c5c5c': 'surface-neutral',
        '#989898': 'surface-neutral-soft', '#14a558': 'surface-accent', '#15663c': 'surface-accent-strong', '#1fc36c': 'surface-accent-light',
        '#85f0b7': 'surface-accent-pale', '#138248': 'surface-brand',
        '#1f1f1f@0.08': 'fill-soft', '#1f1f1f@0.1': 'fill-soft', '#1f1f1f@0.2': 'fill',
        '#000000@0.08': 'scrim-10', '#000000@0.12': 'scrim-10', '#000000@0.24': 'scrim-20', '#000000@0.36': 'scrim-40', '#000000@0.48': 'scrim-56',
        '#000000@0.56': 'scrim-56', '#111111@0.2': 'scrim-20', '#111111@0.32': 'scrim-40', '#111111@0.4': 'scrim-40', '#111111@0.72': 'scrim-72',
        '#ffffff@0.2': 'veil-20', '#ffffff@0.24': 'veil-20', '#ffffff@0.32': 'veil-40', '#ffffff@0.4': 'veil-40', '#ffffff@0.6': 'veil-60', '#ffffff@0.8': 'veil-80',
        '#15663c@0.6': None,
        '#deffdf': 'c-points-bg-1', '#e8feee': 'c-points-bg-2', '#e4ffeb': 'c-points-bg-3', '#e7feec': 'c-points-patch-top', '#e0ffe2': 'c-points-patch-bottom',
        '#e6e9e7': 'c-skeleton-base', '#e9ebea': 'c-skeleton-alt', '#f8faf9': 'c-skeleton-hi', '#e3dbd5': 'c-laptop-bg'}
BORD = {'#1f1f1f@0.1': 'border', '#111111': 'border-strong', '#ffffff@0.2': 'border-inverse', '#ffffff': 'surface', '#f6f6f6': 'surface-muted'}
COLRE = re.compile(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|var\(--cl-(?:green-[0-9]+|ink-[0-9-]+|white)\)')
def map_color(prop, raw, where):
    if raw in OLD: c = OLD[raw]
    else: c = canon(raw)
    if c.endswith('@0'): return 'transparent'
    if prop == 'color' or prop.endswith('-color') and prop.startswith(('text', 'caret')):
        t = TEXT.get(c) or SURF.get(c)
    elif prop.startswith('border') or prop.startswith('outline'):
        t = BORD.get(c) or SURF.get(c)
    elif prop in ('box-shadow',):
        t = 'shadow-color' if c == '#000000@0.14' else ('surface' if c == '#ffffff' else None)
    else:
        t = SURF.get(c) or TEXT.get(c)
    if not t:
        report['color-unmapped'].append(f'{where} {prop}: {raw} ({c})'); return raw
    return f'var(--cl-{t})'

# ---------- 間距、圓角、模糊 ----------
SPACE = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 52, 56, 64, 80, 96, 120}
SNAP = {8.5: None, 13: 12, 13.474: 12, 10.947: 12, 21: 20, 26: 24, 66.4: 64, 128.5: 128, 140.64: 140, 28.36: 28, 40.64: 40, 0.842: 1, -0.3: 0}
SP_PROPS = re.compile(r'^(padding|margin|gap|row-gap|column-gap)(-[a-z-]+)?$')
def map_space(val, where):
    def rep(m):
        n = float(m.group(1)); neg = n < 0; a_ = abs(n)
        if n in SNAP and SNAP[n] is not None: a_ = abs(SNAP[n]); neg = SNAP[n] < 0
        if a_ in (0, 1): return ('-' if neg and a_ else '') + ('%gpx' % a_ if a_ else '0')
        if a_ in SPACE:
            v = f'var(--cl-space-{int(a_)})'
            return f'calc(-1 * {v})' if neg else v
        report['space-raw'].append(f'{where} {m.group(0)}')
        return ('-' if neg else '') + '%gpx' % a_
    return re.sub(r'(?<![\w.-])(-?[0-9]*\.?[0-9]+)px', rep, val)
RAD = {4: 'xs', 8: 'sm', 12: 'md', 14: 'md', 16: 'lg', 20: 'xl', 32: '2xl', 100: 'full', 999: 'full'}
def map_radius(val, where):
    def rep(m):
        n = float(m.group(1))
        if n in RAD: return f'var(--cl-radius-{RAD[n]})'
        if n in (0, 1): return m.group(0)
        report['radius-raw'].append(f'{where} {m.group(0)}'); return m.group(0)
    return re.sub(r'(?<![\w.-])([0-9]*\.?[0-9]+)px', rep, val)
BLUR = {12: 'sm', 32: 'md', 42: 'lg', 52: 'lg'}
def map_blur(val, where):
    return re.sub(r'blur\(([0-9.]+)px\)', lambda m: f"blur(var(--cl-blur-{BLUR[float(m.group(1))]}))" if float(m.group(1)) in BLUR else m.group(0), val)

DECL = re.compile(r'(?P<pre>(?:^|[;{\s]))(?P<prop>-?[a-z-]+)\s*:\s*(?P<val>[^;{}]+?)\s*(?=;|}|$)')
def process(fname, text):
    lines = text.split('\n')
    # 1) 文字（依原始行號）
    for i, ln in enumerate(lines, 1):
        for prop, old, new in by_file_line.get((fname, i), []):
            pat = re.compile(r'(\s*)' + re.escape(prop) + r'\s*:\s*' + re.escape(old) + r'\s*;?')
            if new is None:
                ln2 = pat.sub('', ln, count=1)
            else:
                ln2 = re.sub(re.escape(prop) + r'\s*:\s*' + re.escape(old), f'{prop}: {new}', ln, count=1)
            if ln2 == ln: report['type-miss'].append(f'{fname}:{i} {prop}: {old}')
            ln = ln2
        lines[i - 1] = ln
    # 2) 值替換
    out = []
    in_kf = False
    for i, ln in enumerate(lines, 1):
        where = f'{fname}:{i}'
        if '@keyframes' in ln: in_kf = True
        def drep(m):
            prop, val = m.group('prop'), m.group('val')
            if prop.startswith('--'): return m.group(0)
            nv = val
            nv = COLRE.sub(lambda c: map_color(prop, c.group(0), where), nv)
            if SP_PROPS.match(prop) and 'calc(var(--cl-tabfill' not in nv: nv = map_space(nv, where)
            if 'radius' in prop: nv = map_radius(nv, where)
            if 'filter' in prop: nv = map_blur(nv, where)
            return m.group('pre') + prop + ': ' + nv if nv != val else m.group(0)
        if not ln.lstrip().startswith(('/*', '*')):
            ln = DECL.sub(drep, ln)
        out.append(ln)
    # 空掉的行（只剩空白）刪除；空規則 `x { }` 也刪
    res = '\n'.join(l for l in out if not (l.strip() == '' and l != ''))
    return res
for f in [CSS / 'base.css'] + sorted((CSS / 'sections').glob('*.css')):
    t = f.read_text()
    f.write_text(process(f.name, t))
for k, v in report.items():
    print(f'== {k} ({len(v)})'); [print('  ' + x) for x in v]
