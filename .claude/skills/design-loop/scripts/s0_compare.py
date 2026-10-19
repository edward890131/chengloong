#!/usr/bin/env python3
"""S0 驗收比對：位置（HTML [data-figma] ↔ Figma get_metadata）＋像素（並排＋差異圖）

用法：
  python3 s0_compare.py <figma-meta.xml> <frame_id> <輸出前綴> [--tol 4] [--diff-threshold 40]

需要：
  <前綴>_html.png、<前綴>_rects.json   （s0_shoot.cjs 產）
  <前綴>_figma.png                      （Figma get_screenshot，1x；沒有就只比位置）
  <figma-meta.xml>                      （get_metadata 的回傳存檔，要包含 frame_id 那個 frame）
輸出：
  <前綴>_compare.png   Figma｜HTML｜差異（差越大越亮）
  <前綴>_pos.md        每個 data-figma 節點的位置差
  stdout               摘要：位置超標數、metadata 缺的節點、像素差異比例、Group 判定數

判定：位置 |dx|、|dy| ≤ tol 為 PASS；尺寸差只標記不判 FAIL（文字框寬度 HTML 與 Figma 定義不同）
結束碼：位置超標或 metadata 缺節點 → 1；全部通過 → 0

Group 座標雙算（references/figma-gotchas）：
  get_metadata 把 Figma Group（以及 Boolean operation）記成一般節點，但它的子節點座標相對「Group 的上一層」，
  照一般 frame 累加位移會算兩次。本工具用結構判斷：節點有子層、自身 x／y 不是 0、且子層外框聯集的四邊
  等於自身 x、y、x+寬、y+高（Group 的外框就是子層聯集）→ 當成 Group，子層不累加它的位移。
  標籤直接是 <group> 時一律當 Group。
限制：
  ▸ Group 內有旋轉子層（metadata 記變形前原點）或隱藏子層時聯集會對不上；此時退回名稱判斷
    （名稱以 Group 開頭、且子層最小 x／y 等於自身 x／y），名稱被改掉就判斷不到，stdout 會列出名稱判斷的筆數
  ▸ Group 自身 x、y 都是 0 時兩種算法結果相同，不需判斷
  ▸ 旋轉節點本身的位置也是變形前原點，差值超標時先看是不是旋轉節點
"""
import argparse
import json
import re
import sys
from pathlib import Path

TAG = re.compile(r'<(/?)([a-z-]+)((?:\s+[a-z-]+="[^"]*")*)\s*(/?)>', re.S)
ATTR = re.compile(r'([a-z-]+)="([^"]*)"', re.S)
EDGE_TOL = 0.05


def parse_tree(xml):
    root = {'tag': '#root', 'a': {}, 'kids': []}
    stack = [root]
    for m in TAG.finditer(xml):
        close, tag, attrs, selfclose = m.groups()
        if close:
            if len(stack) > 1:
                stack.pop()
            continue
        node = {'tag': tag, 'a': dict(ATTR.findall(attrs)), 'kids': []}
        stack[-1]['kids'].append(node)
        if not selfclose:
            stack.append(node)
    return root


def box(n):
    a = n['a']
    return float(a.get('x', 0)), float(a.get('y', 0)), float(a.get('width', 0)), float(a.get('height', 0))


def group_kind(n):
    """回傳 'tag'／'structure'／'name'（是 Group，依據）或 None（一般節點）"""
    if n['tag'] == 'group':
        return 'tag'
    if not n['kids'] or n['tag'] in ('canvas', '#root'):
        return None
    x, y, w, h = box(n)
    if abs(x) <= EDGE_TOL and abs(y) <= EDGE_TOL:
        return None
    ks = [box(k) for k in n['kids']]
    left, top = min(k[0] for k in ks), min(k[1] for k in ks)
    right, bottom = max(k[0] + k[2] for k in ks), max(k[1] + k[3] for k in ks)
    near = lambda p, q: abs(p - q) <= EDGE_TOL
    if near(left, x) and near(top, y) and near(right, x + w) and near(bottom, y + h):
        return 'structure'
    if n['a'].get('name', '').startswith('Group') and near(left, x) and near(top, y):
        return 'name'
    return None


def figma_positions(xml, frame_id):
    out, groups, base = {}, {'tag': 0, 'structure': 0, 'name': 0}, None

    def visit(n, px, py, inside):
        nonlocal base
        x, y, w, h = box(n)
        ax, ay = px + x, py + y
        nid = n['a'].get('id')
        here = inside or nid == frame_id
        if nid == frame_id:
            base = (ax, ay)
        if here and nid:
            out[nid] = {'name': n['a'].get('name', '').replace('\n', ' ')[:30], 'ax': ax, 'ay': ay, 'w': w, 'h': h}
        kind = group_kind(n)
        if kind and here:
            groups[kind] += 1
        cx, cy = (px, py) if kind else (ax, ay)
        for k in n['kids']:
            visit(k, cx, cy, here)

    visit(parse_tree(xml), 0.0, 0.0, False)
    if base is None:
        raise SystemExit(f'找不到 frame {frame_id}')
    for v in out.values():
        v['x'], v['y'] = v['ax'] - base[0], v['ay'] - base[1]
    return out, groups


def pixel_board(prefix, threshold):
    from PIL import Image, ImageChops, ImageDraw, ImageOps

    fimg = Image.open(prefix + '_figma.png').convert('RGB')
    himg = Image.open(prefix + '_html.png').convert('RGB')
    w, h = min(fimg.width, himg.width), min(fimg.height, himg.height)
    fimg, himg = fimg.crop((0, 0, w, h)), himg.crop((0, 0, w, h))
    diff = ImageOps.grayscale(ImageChops.difference(fimg, himg))
    ratio = sum(diff.histogram()[threshold:]) / (w * h)
    boosted = diff.point(lambda v: min(255, v * 4))
    board = Image.new('RGB', (w * 3 + 40, h + 30), (40, 40, 40))
    for i, (img, lab) in enumerate([(fimg, 'Figma'), (himg, 'HTML'), (boosted.convert('RGB'), 'diff')]):
        board.paste(img, (i * (w + 20), 30))
        ImageDraw.Draw(board).text((i * (w + 20) + 6, 8), lab, fill=(230, 230, 230))
    board.save(prefix + '_compare.png')
    return ratio


def main():
    ap = argparse.ArgumentParser(description='S0 驗收：HTML 對 Figma 位置與像素比對')
    ap.add_argument('xml')
    ap.add_argument('frame')
    ap.add_argument('prefix')
    ap.add_argument('--tol', type=float, default=4)
    ap.add_argument('--diff-threshold', type=int, default=40, help='灰階差大於此值才算差異像素')
    a = ap.parse_args()

    fig, groups = figma_positions(Path(a.xml).read_text(encoding='utf-8'), a.frame)
    rects = json.loads(Path(a.prefix + '_rects.json').read_text(encoding='utf-8'))
    rows, fails, missing = [], 0, 0
    for r in rects:
        f = fig.get(r['id'])
        if not f:
            missing += 1
            rows.append(f"| {r['id']} | （metadata 無此節點） | | | | ✕ |")
            continue
        dx, dy, dw, dh = r['x'] - f['x'], r['y'] - f['y'], r['w'] - f['w'], r['h'] - f['h']
        ok = abs(dx) <= a.tol and abs(dy) <= a.tol
        fails += 0 if ok else 1
        size = '' if abs(dw) <= a.tol and abs(dh) <= a.tol else f'尺寸差 {dw:+.1f}×{dh:+.1f}'
        rows.append(f"| {r['id']} | {f['name']} | {f['x']:.1f},{f['y']:.1f} {f['w']:.1f}×{f['h']:.1f} | "
                    f"{r['x']:.1f},{r['y']:.1f} {r['w']:.1f}×{r['h']:.1f} | {dx:+.1f},{dy:+.1f} {size} | {'✓' if ok else '✕'} |")
    md = ['| node | 名稱 | Figma x,y w×h | HTML x,y w×h | 差 | 位置 |', '|---|---|---|---|---|---|'] + rows
    Path(a.prefix + '_pos.md').write_text('\n'.join(md) + '\n', encoding='utf-8')

    if Path(a.prefix + '_figma.png').exists() and Path(a.prefix + '_html.png').exists():
        pixel = f'像素差異（>{a.diff_threshold}）{pixel_board(a.prefix, a.diff_threshold):.2%}'
    else:
        pixel = '像素比對略過（缺 _figma.png 或 _html.png）'
    g = f"Group 判定 {sum(groups.values())}（結構 {groups['structure'] + groups['tag']}、名稱 {groups['name']}）"
    print(f'{Path(a.prefix).name}: 位置超標 {fails}／{len(rects)}，metadata 缺 {missing}，{pixel}，{g}')
    sys.exit(1 if fails or missing else 0)


if __name__ == '__main__':
    main()
