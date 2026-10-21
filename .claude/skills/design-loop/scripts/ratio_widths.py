#!/usr/bin/env python3
"""網格欄寬餘數與鎖比例寬度（references/integer-rules.md §4、§5）

用法：
  python3 ratio_widths.py grid --container 1360 --cols 3 --gap 24 [--ratio 3:2]
      三種餘數做法（last／padding／viewport）各算一次；加 --ratio 同時算圖框高
  python3 ratio_widths.py ratio --ratio 16:9 --near 437 [--span 24]
      鎖比例圖框：最接近 near、高度是整數的寬度
  python3 ratio_widths.py container --cols 3 --gap 24 --near 1360 [--ratio 3:2] [--span 40]
      找能整除（且圖框高是整數）的容器寬
"""
import argparse
import math
from fractions import Fraction


def parse_ratio(s):
    a, b = (int(x) for x in s.split(':'))
    return a, b


def height(w, r):
    return Fraction(w * r[1], r[0])


def fmt_h(w, r):
    h = height(w, r)
    return str(h.numerator) if h.denominator == 1 else f'{float(h):.2f}（小數）'


def cmd_grid(a):
    inner = a.container - a.gap * (a.cols - 1)
    raw = inner / a.cols
    print(f'容器 {a.container}、{a.cols} 欄、gap {a.gap} → 每欄 {raw:.2f}')
    if raw.is_integer():
        print('✓ 整除，不需要處理餘數')
        widths = {'equal': [int(raw)] * a.cols}
    else:
        base = inner // a.cols
        last = inner - base * (a.cols - 1)
        rem = inner - base * a.cols
        widths = {'last': [base] * (a.cols - 1) + [last], 'padding': [base] * a.cols}
        print(f'▸ last：前 {a.cols - 1} 欄 {base}，最後一欄 {last}')
        print(f'▸ padding：每欄 {base}，列尾內距吸收 {rem}')
        print('▸ viewport：用 container 子指令找能整除的容器寬')
    if a.ratio:
        r = parse_ratio(a.ratio)
        for k, ws in widths.items():
            print(f'  {k}｜{a.ratio} 圖框高：' + '、'.join(f'寬 {w} → {fmt_h(w, r)}' for w in sorted(set(ws))))


def cmd_ratio(a):
    r = parse_ratio(a.ratio)
    step = r[0] // math.gcd(*r)
    lo = max(step, (a.near - a.span) // step * step)
    cands = sorted(range(lo, a.near + a.span + 1, step), key=lambda w: abs(w - a.near))[:6]
    print(f'{a.ratio}：寬度要是 {step} 的倍數，高度才是整數')
    for w in cands:
        print(f'  寬 {w} → 高 {fmt_h(w, r)}（差 {w - a.near:+d}）')


def cmd_container(a):
    r = parse_ratio(a.ratio) if a.ratio else None
    hits = []
    for c in range(a.near - a.span, a.near + a.span + 1):
        inner = c - a.gap * (a.cols - 1)
        if inner <= 0 or inner % a.cols:
            continue
        w = inner // a.cols
        if r and height(w, r).denominator != 1:
            continue
        hits.append((abs(c - a.near), c, w))
    if not hits:
        print(f'±{a.span} 內找不到，放大 --span')
        return
    cond = f'、{a.ratio} 圖框高是整數' if r else ''
    print(f'{a.cols} 欄、gap {a.gap}：容器寬能整除{cond}（依接近 {a.near} 排序）')
    for _, c, w in sorted(hits)[:8]:
        extra = f'，圖框高 {fmt_h(w, r)}' if r else ''
        print(f'  容器 {c} → 每欄 {w}{extra}（差 {c - a.near:+d}）')


def main():
    ap = argparse.ArgumentParser(description='網格餘數與鎖比例寬度')
    sub = ap.add_subparsers(dest='cmd', required=True)
    g = sub.add_parser('grid')
    g.add_argument('--container', type=int, required=True)
    g.add_argument('--cols', type=int, required=True)
    g.add_argument('--gap', type=int, default=0)
    g.add_argument('--ratio')
    r = sub.add_parser('ratio')
    r.add_argument('--ratio', required=True)
    r.add_argument('--near', type=int, required=True)
    r.add_argument('--span', type=int, default=24)
    c = sub.add_parser('container')
    c.add_argument('--cols', type=int, required=True)
    c.add_argument('--gap', type=int, default=0)
    c.add_argument('--near', type=int, required=True)
    c.add_argument('--ratio')
    c.add_argument('--span', type=int, default=40)
    a = ap.parse_args()
    {'grid': cmd_grid, 'ratio': cmd_ratio, 'container': cmd_container}[a.cmd](a)


if __name__ == '__main__':
    main()
