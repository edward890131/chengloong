# 產生 site/tokens/tokens.json（DTCG）。tokens.css 由 design-loop tokens_build.py 產出
import json, pathlib
OUT = pathlib.Path('/home/user/chengloong/site/tokens/tokens.json')
P = 'cl'
def tok(v, t, desc, css=None, modes=None):
    d = {'$value': v, '$type': t, '$description': desc}
    ext = {}
    if css: ext['css'] = css
    if modes: ext['modes'] = modes
    if ext: d['$extensions'] = {'designLoop': ext}
    return d
ref = {'color': {}}
RC = ref['color']
for k, v, d in [('green-300', '#85f0b7', '亮綠（綠點標記點）'), ('green-400', '#1fc36c', '淺綠'), ('green-500', '#14a558', '品牌主綠'),
                ('green-600', '#138248', '深綠（CTA、數據區）'), ('green-700', '#15663c', '最深綠（hover）'),
                ('neutral-0', '#ffffff', '白'), ('neutral-50', '#f9f9f9', '極淺灰'), ('neutral-100', '#f6f6f6', '淺灰底'),
                ('neutral-400', '#989898', '中灰'), ('neutral-600', '#5c5c5c', '深中灰'), ('neutral-700', '#444444', '深灰（原 #444／#454545 合併）'),
                ('neutral-800', '#1f1f1f', '主文字黑'), ('neutral-900', '#111111', '最深黑（原 #000 併入）')]:
    RC[k] = tok(v, 'color', d, f'--{P}-ref-{k}')
def a(base, al): return {'colorSpace': 'srgb', 'hex': base, 'alpha': al}
def rgba(hexv, al):
    h = hexv.lstrip('#'); r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return f'rgba({r}, {g}, {b}, {al})'
sys_ = {'color': {}}
SC = sys_['color']
def s(k, v, d): SC[k] = tok(v, 'color', d, f'--{P}-{k}')
# text
s('text-strong', '{ref.color.neutral-900}', '最強文字（標題、深色字）')
s('text', '{ref.color.neutral-800}', '主要文字')
s('text-soft', rgba('#1f1f1f', .8), '次強文字（80%）')
s('text-secondary', rgba('#1f1f1f', .6), '次要文字、說明（60%）')
s('text-tertiary', '{ref.color.neutral-400}', '第三層文字（淡化、停用、序號）')
s('text-inverse', '{ref.color.neutral-0}', '深底上的文字')
s('text-inverse-soft', rgba('#ffffff', .8), '深底上的次要文字（80%）')
s('text-inverse-muted', rgba('#ffffff', .6), '深底上的淡文字（60%）')
s('text-accent', '{ref.color.green-500}', '強調文字（品牌綠）')
s('text-accent-strong', '{ref.color.green-700}', '深綠文字')
s('text-accent-light', '{ref.color.green-400}', '淺綠文字（深底上）')
# surface
s('surface', '{ref.color.neutral-0}', '基本底色（白）')
s('surface-muted', '{ref.color.neutral-100}', '淺灰底（卡片、膠囊、面板）')
s('surface-subtle', '{ref.color.neutral-50}', '極淺灰底')
s('surface-inverse', '{ref.color.neutral-900}', '深色底')
s('surface-inverse-soft', '{ref.color.neutral-800}', '次深色底')
s('surface-neutral-strong', '{ref.color.neutral-700}', '深灰底（按鈕 hover 圓、灰色卡）')
s('surface-neutral', '{ref.color.neutral-600}', '中灰底')
s('surface-neutral-soft', '{ref.color.neutral-400}', '灰底（文件預覽底）')
s('surface-accent', '{ref.color.green-500}', '品牌綠底（主按鈕）')
s('surface-accent-strong', '{ref.color.green-700}', '深綠底（hover）')
s('surface-accent-light', '{ref.color.green-400}', '淺綠底')
s('surface-accent-pale', '{ref.color.green-300}', '亮綠點')
s('surface-brand', '{ref.color.green-600}', '品牌深綠區塊底（CTA、數據）')
# border / fill / overlay
s('border', rgba('#1f1f1f', .1), '一般分隔線、外框（10%）')
s('border-strong', '{ref.color.neutral-900}', '強調外框')
s('border-inverse', rgba('#ffffff', .2), '深底上的線（20%）')
s('fill-soft', rgba('#1f1f1f', .1), '淺色疊加填色（10%，原 8%／10% 合併）')
s('fill', rgba('#1f1f1f', .2), '疊加填色（20%）')
s('fill-accent', rgba('#15663c', .6), '深綠半透明底（綠點資訊泡泡）')
for n in (10, 20, 40, 56, 72):
    s(f'scrim-{n}', rgba('#111111', n / 100), f'深色遮罩 {n}%（圖片上的暗化、深色膠囊）')
for n in (20, 40, 60, 80):
    s(f'veil-{n}', rgba('#ffffff', n / 100), f'白色疊加 {n}%（毛玻璃按鈕、深底上的線）')
s('shadow-color', rgba('#000000', .14), '陰影色')
# 字型
font = {
  'family-sans': tok(['Noto Sans TC', 'sans-serif'], 'fontFamily', '內文字型', f'--{P}-font-sans'),
  'family-num': tok(['Montserrat', 'Noto Sans TC', 'sans-serif'], 'fontFamily', '數字、英文 eyebrow 字型', f'--{P}-font-num'),
  'weight-regular': tok(400, 'fontWeight', '一般', f'--{P}-fw-regular'),
  'weight-medium': tok(500, 'fontWeight', '中', f'--{P}-fw-medium'),
  'weight-semibold': tok(600, 'fontWeight', '半粗', f'--{P}-fw-semibold'),
  'weight-bold': tok(700, 'fontWeight', '粗', f'--{P}-fw-bold'),
}
# 文字角色：fs/lh px、ls em；T/M 覆寫
# 文字：類別／尺寸／字重（比照前案 Pikki）。字級、行高、字距按「類別／尺寸」設 token，字重寫在 text style 名稱
#   (類別, 尺寸, 說明, fs, lh, ls(em), 平板, 手機, 字重清單, 字型)
ROLES = [
 ('display', 'xxl', 'Footer 標語（平板為流動字級）', 86, None, .006, None, (75, None), ['Bold'], 'num'),
 ('display', 'xl', '紙張流程大數字', 64, 77, .03, (48, 58), (36, 43), ['Bold'], 'num'),
 ('display', 'l', '綠點英文大字', 48, 58, .04, None, (28, 34), ['Bold'], 'num'),
 ('display', 'm', '流程步驟數字', 40, 48, .05, None, (24, 29), ['Bold'], 'num'),
 ('display', 's', '紙張流程數字旁標籤', 32, 38, .03, (28, 34), (24, 29), ['Bold'], 'num'),
 ('display', 'xs', '路線圖編號', 24, 29, .04, (20, 24), (20, 24), ['Bold'], 'num'),
 ('display', 'xxs', 'FAQ 題號', 20, 24, .1, None, None, ['Bold'], 'num'),
 ('title', 'xxl', '頁面標題（條款頁）', 40, 56, .025, None, (28, 40), ['Bold'], 'sans'),
 ('title', 'xl', '區塊標題', 32, 45, .03, (28, 39), (24, 34), ['Bold'], 'sans'),
 ('title', 'l', '卡片大標', 24, 34, .025, None, (20, 28), ['Bold'], 'sans'),
 ('title', 'm', '條款小節標題', 22, 32, .025, None, (18, 28), ['Bold'], 'sans'),
 ('title', 's', '選單連結、步驟標', 20, 28, .02, None, (18, 25), ['Bold'], 'sans'),
 ('title', 'xs', '卡片標題、膠囊標', 18, 25, .03, None, None, ['Bold'], 'sans'),
 ('paragraph', 'l', '長文內文（條款）', 16, 28, .02, None, (15, 26), ['Regular', 'Bold'], 'sans'),
 ('paragraph', 'm', '導言、內文大', 16, 22, .02, None, None, ['Regular', 'SemiBold', 'Bold'], 'sans'),
 ('paragraph', 's', '內文、說明', 14, 20, .02, None, None, ['Regular', 'Medium', 'Bold'], 'sans'),
 ('label', 'l', '頁籤', 18, 26, .02, None, (16, 23), ['Bold'], 'sans'),
 ('label', 'm', '小頁籤、頂部導覽', 16, 23, .02, None, None, ['Medium', 'Bold'], 'sans'),
 ('label', 's', '提示、註記', 13, 18, .03, None, None, ['Medium'], 'sans'),
 ('label', 'xs', '版權、標籤', 12, 18, .02, None, None, ['Regular', 'Bold'], 'sans'),
 ('button', 'l', '按鈕', 18, None, 0, None, None, ['SemiBold'], 'sans'),
 ('button', 's', '小按鈕', 14, 21, 0, None, None, ['SemiBold'], 'sans'),
 ('overline', 'm', '英文頁首標（條款頁）', 16, 20, .1, None, (14, 20), ['SemiBold'], 'num'),
 ('overline', 's', '英文小標（eyebrow）', 12, 15, .08, None, None, ['SemiBold'], 'num'),
]
CLASSES = {
 ('button','l'): '.cl-btn', ('button','s'): '.cl-btn--sm／.cl-btn--sm-s／.cl-hero__cta（手機）',
 ('display','xxl'): '.cl-footer__slogan', ('display','xl'): '.cl-paper__no-num', ('display','l'): '.cl-green__en',
 ('display','m'): '.cl-process__step-num', ('display','s'): '.cl-paper__no-label', ('display','xs'): '.cl-process__route-num', ('display','xxs'): '.cl-faq__num',
 ('title','xxl'): '.cl-terms__title', ('title','xl'): '.cl-about__title／.cl-paper__title／.cl-process__title／.cl-green__title／.cl-green__name／.cl-faq__title／.cl-cta__title',
 ('title','l'): '.cl-paper__step-title／.cl-process__card-title', ('title','m'): '.cl-terms__h', ('title','s'): '.cl-menu__link／.cl-process__step-label／.cl-process__card-title（平板）',
 ('title','xs'): '.cl-about__card-title／.cl-about__pill／.cl-process__step-title／.cl-process__prep-title',
 ('paragraph','l'): '.cl-terms__p', ('paragraph','m'): '.cl-about__lead／.cl-paper__lead／.cl-paper__desc／.cl-green__lead／.cl-green__desc／.cl-faq__question／.cl-footer__label 等',
 ('paragraph','s'): '.cl-about__card-desc／.cl-process__*-desc／.cl-faq__answer／.cl-cta__desc／.cl-footer__value 等',
 ('label','l'): '.cl-process__tab／.cl-process__paper-btn／.cl-faq__tab', ('label','m'): '.cl-hero__nav-link／.cl-process__paper-btn（平板、手機）',
 ('label','s'): '.cl-about__cycle-hint（手機）', ('label','xs'): '.cl-footer__copy／.cl-hero__tag（手機）',
 ('overline','m'): '.cl-terms__eyebrow', ('overline','s'): '.cl-about__eyebrow／.cl-paper__eyebrow／.cl-process__eyebrow／.cl-green__eyebrow／.cl-faq__eyebrow',
}
WEIGHT = {'Regular': 'regular', 'Medium': 'medium', 'SemiBold': 'semibold', 'Bold': 'bold'}
typo = {}
styles = {}
for cat, size, desc, fs, lh, ls, T, M, weights, fam in ROLES:
    fm = {}; lm = {}
    if T: fm['Tablet'] = f'{T[0]}px'; T[1] and lm.__setitem__('Tablet', f'{T[1]}px')
    if M: fm['Mobile'] = f'{M[0]}px'; M[1] and lm.__setitem__('Mobile', f'{M[1]}px')
    C, Z = cat.capitalize(), size.upper()
    g = {
      'size': tok(f'{fs}px', 'dimension', f'{C}/{Z}：{desc}，字級', f'--{P}-{cat}-{size}-fs', fm or None),
      'line': tok(f'{lh}px' if lh else 'normal', 'dimension', f'{C}/{Z}：{desc}，行高', f'--{P}-{cat}-{size}-lh', lm or None),
      'track': tok(f'{ls}em', 'dimension', f'{C}/{Z}：{desc}，字距', f'--{P}-{cat}-{size}-ls'),
    }
    typo.setdefault(cat, {})[size] = g
    for w in weights:
        styles.setdefault(C, {}).setdefault(Z, {})[w] = {
          '$type': 'typography',
          '$description': f'{desc}。CSS {CLASSES.get((cat, size), "")}',
          '$value': {'fontFamily': '{sys.font.family-%s}' % fam, 'fontWeight': '{sys.font.weight-%s}' % WEIGHT[w],
                     'fontSize': '{sys.type.%s.%s.size}' % (cat, size), 'lineHeight': '{sys.type.%s.%s.line}' % (cat, size),
                     'letterSpacing': '{sys.type.%s.%s.track}' % (cat, size)}}
space = {}
for n in (2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 52, 56, 64, 80, 96, 120):
    space[str(n)] = tok(f'{n}px', 'dimension', f'間距 {n}', f'--{P}-space-{n}')
radius = {k: tok(v, 'dimension', d, f'--{P}-radius-{k}') for k, v, d in [
    ('xs', '4px', '小元件'), ('sm', '8px', '小卡、提示'), ('md', '12px', '卡片'), ('lg', '16px', '大卡片'),
    ('xl', '20px', '面板'), ('2xl', '32px', '大面板'), ('full', '999px', '膠囊、圓形')]}
blur = {k: tok(v, 'dimension', d, f'--{P}-blur-{k}') for k, v, d in [
    ('sm', '12px', '毛玻璃（弱）'), ('md', '32px', '毛玻璃（中）'), ('lg', '52px', '毛玻璃（強）')]}
shadow = {
  'shadow-1': tok({'color': '{sys.color.shadow-color}', 'offsetX': '0px', 'offsetY': '2px', 'blur': '12px', 'spread': '0px'}, 'shadow', '浮起一層（白圈、牌卡）', f'--{P}-shadow-1'),
  'focus-ring': tok({'color': '{ref.color.neutral-0}', 'offsetX': '0px', 'offsetY': '0px', 'blur': '0px', 'spread': '3px', 'inset': True}, 'shadow', '深底元件的鍵盤焦點框', f'--{P}-focus-ring'),
}
layout = {
  'page-max': tok('1440px', 'dimension', '頁面最大寬', f'--{P}-page-max'),
  'header-h': tok('62px', 'dimension', '固定 header 高（錨點預留）', f'--{P}-header-h'),
  'content-max': tok('1280px', 'dimension', '段落內容最大寬（版心）；實際寬＝min(1280, 100% − 2×gutter)，hero、串場、footer 除外', f'--{P}-content-max'),
  'head-max': tok('640px', 'dimension', '段落標題組最大寬', f'--{P}-head-max'),
  'content-narrow': tok('880px', 'dimension', '窄版內容最大寬（FAQ）', f'--{P}-content-narrow'),
}
# RWD 間距（桌機／平板／手機）：有規律的用途才做；不一致的列在 audit 等使用者判斷
for k, d, t, m, desc in [
    ('gutter', 80, 40, 16, '頁面左右邊距（流程、CTA、條款）'),
    ('section-pad-top', 40, 40, 40, '區塊上內距'),
    ('section-pad-bottom', 120, 120, 64, '區塊下內距（紙張、綠點、FAQ、CTA）'),
    ('section-gap', 64, 64, 48, '區塊標題組 → 內容'),
    ('head-gap', 32, 32, 24, '標題組內（標題 ↔ 導言）'),
    ('heading-gap', 12, 12, 8, 'eyebrow ↔ 標題'),
    ('panel-gap', 12, 12, 8, '灰底面板內距與卡片間距'),
    ('tab-gap', 16, 16, 12, '頁籤之間'),
    ('tab-pad-y', 16, 16, 8, '頁籤上下內距'),
    ('tab-pad-x', 24, 24, 16, '頁籤左右內距'),
]:
    md = {}
    if t != d: md['Tablet'] = f'{t}px'
    if m != d: md['Mobile'] = f'{m}px'
    layout[k] = tok(f'{d}px', 'dimension', desc, f'--{P}-{k}', md or None)
comp = {'color': {k: tok(v, 'color', d, f'--{P}-c-{k}') for k, v, d in [
    ('points-bg-1', '#deffdf', '綠點卡漸層 1'), ('points-bg-2', '#e8feee', '綠點卡漸層 2'), ('points-bg-3', '#e4ffeb', '綠點卡漸層 3'),
    ('points-patch-top', '#e7feec', '綠點卡色塊（上）'), ('points-patch-bottom', '#e0ffe2', '綠點卡色塊（下）'),
    ('skeleton-base', '#e6e9e7', '載入骨架底'), ('skeleton-alt', '#e9ebea', '載入骨架底（圖）'), ('skeleton-hi', '#f8faf9', '載入骨架亮帶'),
    ('laptop-bg', '#e3dbd5', '流程插圖筆電底')]}}
doc = {'ref': ref, 'sys': {**sys_, 'font': font, 'type': typo, 'textStyle': styles, 'space': space, 'textStyle': styles, 'radius': radius, 'blur': blur, 'shadow': shadow, 'layout': layout}, 'comp': comp}
OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')
print('ok', sum(1 for _ in json.dumps(doc).split('"$value"')) - 1, 'tokens')
