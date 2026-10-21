"""水銷循環 Lottie 重建時間軸（客戶 R2 第二次修正）
原檔各段、箭頭遮罩各有獨立時間軸，段 1 有預先畫好的半段、箭頭遮罩領先或殘留。
改成一條「蛇」：頭 H(t)、尾 T(t) 沿整條 ∞ 依序走（A → 段2 → 段3 → 段4 → B），
每段 trim 與箭頭遮罩都由 H、T 換算，保證線段與箭頭同步進退、頭尾同一個起點同一方向。
起點（客戶指定）：交會點下方的箭頭底下＝段 1 路徑的 0%，往左下走，順序 B → A → 段2 → 段3 → 段4，回到交會點。
  進場：影格 0–DRAW 頭走完全長；停留到 EXIT0；退場 EXIT0–816 尾走完全長；第 0 與第 816 影格都全空，循環接得上。
用法：python3 rebuild_lottie.py 原檔.json 輸出.json"""
import json, math, sys

src, dst = sys.argv[1], sys.argv[2]
d = json.load(open(src))
OP = d['op']                 # 816
DRAW, EXIT0 = 180, 636       # 進場結束、退場開始

# 路徑長（lotlen.py 量得）：段1 整條 536.3，A＝13.985%→100%、B＝0→13.985%
SEG1, A_START = 536.3, 13.985233741163084
LEN = {'A': SEG1 * (100 - A_START) / 100, 'seg2': 334.0, 'seg3': 803.3, 'seg4': 604.0, 'B': SEG1 * A_START / 100}
ORDER = ['B', 'A', 'seg2', 'seg3', 'seg4']
TOTAL = sum(LEN.values())
start = {}
acc = 0
for k in ORDER:
    start[k] = acc; acc += LEN[k]

# 箭頭遮罩：路徑 4613.1（約兩圈），停留時 s＝1.322、e＝52.113 → 一圈對應 50.791%
MASK_S0, MASK_FULL = 1.3223337817305085, 52.113200929049775

def ease(x):                 # easeInOutSine
    return -(math.cos(math.pi * x) - 1) / 2

def head(t):
    return TOTAL * ease(min(1, t / DRAW))

def tail(t):
    return 0 if t <= EXIT0 else TOTAL * ease(min(1, (t - EXIT0) / (OP - EXIT0)))

def frac(seg, x):
    return max(0.0, min(1.0, (x - start[seg]) / LEN[seg]))

def seg_val(seg, x):
    f = frac(seg, x)
    if seg == 'A': return A_START + (100 - A_START) * f
    if seg == 'B': return A_START * f
    return 100 * f

# 箭頭遮罩原本以 A 起點對應 MASK_S0（停留時 s→e 正好一圈＝50.791%）。起點改到 B 起點（早 LEN['B']）後，
# 對應值 −0.35%（遮罩路徑比線段晚約 8px 開始）：用第一圈、負值夾到 0。
# 不可改用第二圈：遮罩路徑不足兩圈，第二圈的結尾會蓋到交會點下方箭頭，退場時那顆箭頭殘留到最後
MASK_K = (MASK_FULL - MASK_S0) / TOTAL          # 每 px 對應的遮罩 %
MASK_B0 = MASK_S0 - MASK_K * LEN['B']

def mask_val(x):
    return max(0.0, MASK_B0 + MASK_K * x)

def track(fn):
    """逐影格線性關鍵影格；數值不變的連續影格合併，最後一格不帶緩動"""
    vals = [round(fn(t), 5) for t in range(OP + 1)]
    kfs = []
    for t, v in enumerate(vals):
        if 0 < t < OP and vals[t - 1] == v == vals[t + 1]:
            continue
        kfs.append({'t': t, 's': [v], 'i': {'x': [1], 'y': [1]}, 'o': {'x': [0], 'y': [0]}})
    kfs[-1].pop('i'); kfs[-1].pop('o')
    return {'a': 1, 'k': kfs}

def trims(layer):
    out = []
    def walk(o):
        if isinstance(o, dict):
            if o.get('ty') == 'tm': out.append(o)
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    walk(layer.get('shapes', []))
    return out

by = {l['nm']: l for l in d['layers']}
segs = {
    'A': trims(by['段1_機密文件→水銷處理'])[0],
    'B': trims(by['段1_機密文件→水銷處理'])[1],
    'seg2': trims(by['段2_再生紙品製造→交會'])[0],
    'seg3': trims(by['段3_綠點存摺→綠色採購'])[0],
    'seg4': trims(by['段4_永續共好→交會'])[0],
}
for k, tm in segs.items():
    tm['s'] = track(lambda t, k=k: seg_val(k, tail(t)))
    tm['e'] = track(lambda t, k=k: seg_val(k, head(t)))
(mask,) = trims(by['箭頭遮罩'])
mask['s'] = track(lambda t: mask_val(tail(t)))
mask['e'] = track(lambda t: mask_val(head(t)))

json.dump(d, open(dst, 'w'), ensure_ascii=False, separators=(',', ':'))
print('total', round(TOTAL, 1), {k: round(v, 1) for k, v in start.items()}, 'mask', round(MASK_B0, 3), '->', round(mask_val(TOTAL), 3))
