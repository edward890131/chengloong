#!/usr/bin/env python3
"""S7 R2 全頁文字位置自動比對：網站 ↔ Figma 設計稿（0.4.0）

用法：
  python3 r2_text_match.py <web.json> <figma.json> [--tol 4] [--key-len 12] [--max-dy 60]
      [--web-shift 起:迄:位移|drop ...] [--web-max-y Y] [--check-x] [--json 輸出.json]

輸入（兩邊格式相同）：
  {"texts": [[文字, x, y, 行數], ...]}
  ▸ web.json   由 r2_texts_web.cjs 產：y＝第一行「行框頂」（Range rect 頂 −（line-height − rect 高）／2）
  ▸ figma.json 由 r2_texts_figma.js 在 use_figma 產：y＝文字框頂（Figma 文字框＝行框）
  兩邊都以頁面 frame 左上角為原點。

配對：文字去空白、轉大寫後取前 key-len 字當 key；同 key 的候選取 |dy|＋0.2|dx| 最小的一個，
      |dy| 超過 max-dy 視為配不到。重複文字（「查看更多」）靠位置就近配對。
判定：|dy| > tol、行數不同 → 列出；--check-x 時 |dx| > tol 也列。

調整：
  --web-shift 844:1679:drop     網站 y 在 [844,1679) 的文字丟掉（例：捲動舞台的捲動距離，設計稿只畫第一屏）
  --web-shift 1679:99999:-960   網站 y ≥ 1679 的文字 y 減 960，對回設計稿座標
  --web-max-y 3511              網站 y 超過這個值不比（例：設計稿沒畫的頁尾）

常見誤報（用並排截圖排除，寫進發現表，不修）：
  ▸ 標籤、混字級欄標：網站是行框、Figma 是文字框，字級混排時兩者頂端不同
  ▸ 捲過的 scroll-spy 列：網站量到的狀態不是第一狀態（量之前重新載入、不捲動）
  ▸ min-height 的標題框：行數被算成 2
  ▸ Figma 分段的文字（「0N」「/」「05」拆成三個 TEXT）配不到是正常的
  ▸ 接近滿寬的長句：兩邊字寬不同造成斷行差（capture-gotchas「字寬」）
結束碼：有列出的問題 → 1；沒有 → 0
"""
import argparse
import json
import re
import sys

WS = re.compile(r'\s+')


def key(text, n):
    return WS.sub('', str(text)).upper()[:n]


def load(path, n):
    d = json.load(open(path, encoding='utf-8'))
    rows = d['texts'] if isinstance(d, dict) else d
    out = []
    for r in rows:
        t, x, y, lines = r[0], float(r[1]), float(r[2]), int(r[3])
        k = key(t, n)
        if k:
            out.append({'k': k, 'text': str(t)[:16], 'x': x, 'y': y, 'lines': lines, 'used': False})
    return out


def parse_shift(s):
    a, b, c = s.split(':')
    return float(a), float(b), (None if c == 'drop' else float(c))


def main():
    ap = argparse.ArgumentParser(description='S7 R2 全頁文字位置比對')
    ap.add_argument('web')
    ap.add_argument('figma')
    ap.add_argument('--tol', type=float, default=4)
    ap.add_argument('--key-len', type=int, default=12)
    ap.add_argument('--max-dy', type=float, default=60)
    ap.add_argument('--web-shift', action='append', default=[])
    ap.add_argument('--web-max-y', type=float)
    ap.add_argument('--check-x', action='store_true')
    ap.add_argument('--json')
    a = ap.parse_args()

    shifts = [parse_shift(s) for s in a.web_shift]
    W = []
    for w in load(a.web, a.key_len):
        if a.web_max_y is not None and w['y'] >= a.web_max_y:
            continue
        drop = False
        for lo, hi, d in shifts:
            if lo <= w['y'] < hi:
                if d is None:
                    drop = True
                else:
                    w['y'] += d
                break
        if not drop:
            W.append(w)
    F = sorted(load(a.figma, a.key_len), key=lambda e: (e['y'], e['x']))

    issues, unF, dys = [], [], []
    for e in F:
        c = [w for w in W if w['k'] == e['k'] and not w['used']]
        if not c:
            unF.append(e)
            continue
        w = min(c, key=lambda w: abs(w['y'] - e['y']) + abs(w['x'] - e['x']) * 0.2)
        if abs(w['y'] - e['y']) > a.max_dy:
            unF.append(e)
            continue
        w['used'] = True
        dy, dx = e['y'] - w['y'], e['x'] - w['x']
        dys.append(abs(dy))
        msg = []
        if abs(dy) > a.tol:
            msg.append(f'dy {dy:+.1f}')
        if a.check_x and abs(dx) > a.tol:
            msg.append(f'dx {dx:+.1f}')
        if e['lines'] != w['lines']:
            msg.append(f'行數 F{e["lines"]}／W{w["lines"]}')
        if msg:
            issues.append({'figma_y': e['y'], 'web_y': round(w['y'], 1), 'text': w['text'], 'issue': '，'.join(msg)})
    unW = [w for w in W if not w['used']]

    matched = len(F) - len(unF)
    print(f'網站文字 {len(W)}｜Figma 文字 {len(F)}｜配對 {matched}｜|dy| 最大 {max(dys) if dys else 0:.1f}｜問題 {len(issues)}')
    for i in issues:
        print(f'  ! Figma y {i["figma_y"]:>7.0f}  {i["text"]:<16} {i["issue"]}')
    if unF:
        print(f'  Figma 配不到 {len(unF)}：' + '｜'.join(f'{e["text"]}@{e["x"]:.0f},{e["y"]:.0f}' for e in unF[:40]))
    if unW:
        print(f'  網站配不到 {len(unW)}：' + '｜'.join(f'{w["text"]}@{w["x"]:.0f},{w["y"]:.0f}' for w in unW[:40]))
    if a.json:
        json.dump({'matched': matched, 'issues': issues,
                   'figma_unmatched': [{k: e[k] for k in ('text', 'x', 'y')} for e in unF],
                   'web_unmatched': [{k: w[k] for k in ('text', 'x', 'y')} for w in unW]},
                  open(a.json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    sys.exit(1 if issues else 0)


if __name__ == '__main__':
    main()
