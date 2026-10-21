"""水銷循環 Lottie 修正：段 1 不再預先畫好一半、也不在退場期間自己長，改成和其他段一樣依序進退場。
做法：段 1 前半（A：path 13.98→100）從空白開始畫，時間由 0–31 拉長到 0–76（速度和原本一致）；
其後各段的進場關鍵影格順延 45 影格；段 1 後半（B）與箭頭遮罩拿掉退場期間的「預先生長」；
箭頭遮罩退場終點對齊進場終點，最後全空，和第 0 影格接得上。"""
import json, sys
src, dst = sys.argv[1], sys.argv[2]
d = json.load(open(src))
SHIFT = 45          # 段 1 前半多出來的影格
A_END_OLD, A_END_NEW = 31, 76
DRAW_END = 160      # 原本進場結束約在 156

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

def val(kf): return kf['s'][0]
def setv(kf, v): kf['s'] = [v]

def shift_draw(kfs):
    """進場段（0<t<=DRAW_END）順延；t=0 與退場段不動"""
    for kf in kfs:
        if 0 < kf['t'] <= DRAW_END: kf['t'] += SHIFT

def remap_head(kfs, v_from_old, v_from_new):
    """0–31 的段落：時間拉長到 0–76，數值起點從 v_from_old 改成 v_from_new（終點不變）"""
    end_v = None
    for kf in kfs:
        if kf['t'] == A_END_OLD: end_v = val(kf)
    for kf in kfs:
        t = kf['t']
        if t <= A_END_OLD:
            kf['t'] = round(t * A_END_NEW / A_END_OLD, 3)
            v = val(kf)
            setv(kf, v_from_new + (v - v_from_old) * (end_v - v_from_new) / (end_v - v_from_old))
        elif t <= DRAW_END:
            kf['t'] = t + SHIFT

def cut_after(kfs, t_keep, final_v, last_t):
    """拿掉 t_keep 之後的關鍵影格，改成停在 final_v 直到 last_t"""
    kept = [kf for kf in kfs if kf['t'] <= t_keep]
    last = dict(kept[-1]); last.pop('i', None); last.pop('o', None)
    hold = {'t': kept[-1]['t'] + 1, 's': [final_v]}
    tail = {'t': last_t, 's': [final_v]}
    # 前一格補緩動控制（沿用前一段的），避免最後一段變成 hold
    kfs[:] = kept + [hold, tail]

by = {l['nm']: l for l in d['layers']}
last_t = d['op']

# 段 1：A（第一個 trim，path 13.98→100）、B（第二個 trim，path 0→13.98）
a, b = trims(by['段1_機密文件→水銷處理'])
A_S = val(a['s']['k'][0])                     # 13.985…（A 的起點）
remap_head(a['e']['k'], val(a['e']['k'][0]), A_S)   # 第 0 影格 A 為空，從 13.98 畫到 100
shift_draw(b['e']['k'])
cut_after(b['e']['k'], 155 + SHIFT, A_S, last_t)    # B 畫到 13.98 就停，不在退場期間自己長
# 段 2–4：進場順延
for nm in ('段2_再生紙品製造→交會', '段3_綠點存摺→綠色採購', '段4_永續共好→交會'):
    (t,) = trims(by[nm])
    shift_draw(t['e']['k'])
# 箭頭遮罩：進場起點改成空（s=e），頭段同 A 拉長；退場不再預先生長；退場終點對齊進場終點
(m,) = trims(by['箭頭遮罩'])
M_S0 = val(m['s']['k'][0])
remap_head(m['e']['k'], val(m['e']['k'][0]), M_S0)
e_end = max(val(kf) for kf in m['e']['k'] if kf['t'] <= 156 + SHIFT)
cut_after(m['e']['k'], 156 + SHIFT, e_end, last_t)
s_end_old = val(m['s']['k'][-1])
for kf in m['s']['k']:
    setv(kf, M_S0 + (val(kf) - M_S0) * (e_end - M_S0) / (s_end_old - M_S0))

json.dump(d, open(dst, 'w'), ensure_ascii=False, separators=(',', ':'))
print('A start', A_S, 'mask', M_S0, '->', e_end)
