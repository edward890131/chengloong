#!/usr/bin/env python3
"""S7 R4／R5 影像上的文字對比：兩張截圖相減量（0.4.0）

用法：
  python3 contrast_on_image.py <normal.png> <notext.png> [--box x,y,w,h] [--threshold 40] [--pad 4] [--min 4.5]

截圖怎麼拍（同一頁、同一 viewport、同一捲動位置、deviceScaleFactor 1、影片暫停在同一幀）：
  normal.png   正常畫面
  notext.png   只把要量的文字設 `color: transparent`（text-shadow 一併拿掉），其他不動
  --box        只量這一塊（文字元素的 getBoundingClientRect）；不給就整張

算法：
  ▸ 字的像素＝兩張差異（RGB 最大通道差）> threshold 的像素；字的亮度取這些像素在 normal 的中位數
  ▸ 底色取 notext 在「字的外框 ± pad」範圍：文字比底亮 → 取 95 百分位（最亮的底＝最壞情況）；
    文字比底暗 → 取 5 百分位。notext 沒有字，抗鋸齒不會污染分位數
  ▸ 另列「典型」（底色中位數）供對照；判定看最壞
為什麼不用 token 標稱值：token 對比是對純色底算的，疊在影片或照片亮部時實際可能只有一半
（Web 案：標稱 4.65，實際 1.97–2.80）
結束碼：最壞對比 < min → 1；否則 0
"""
import argparse
import sys

import numpy as np
from PIL import Image


def lum(rgb):
    c = rgb.astype(np.float64) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def ratio(a, b):
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def main():
    ap = argparse.ArgumentParser(description='影像上的文字對比（兩張截圖相減）')
    ap.add_argument('normal')
    ap.add_argument('notext')
    ap.add_argument('--box')
    ap.add_argument('--threshold', type=float, default=40)
    ap.add_argument('--pad', type=int, default=4)
    ap.add_argument('--min', type=float, default=4.5)
    a = ap.parse_args()

    n = np.asarray(Image.open(a.normal).convert('RGB'))
    t = np.asarray(Image.open(a.notext).convert('RGB'))
    if n.shape != t.shape:
        sys.exit(f'兩張尺寸不同：{n.shape[1]}×{n.shape[0]} vs {t.shape[1]}×{t.shape[0]}（要同 viewport、同 DPR）')
    ox = oy = 0
    if a.box:
        x, y, w, h = [int(round(float(v))) for v in a.box.split(',')]
        ox, oy = max(0, x), max(0, y)
        n, t = n[oy:y + h, ox:x + w], t[oy:y + h, ox:x + w]

    diff = np.abs(n.astype(np.int16) - t.astype(np.int16)).max(axis=2)
    mask = diff > a.threshold
    cnt = int(mask.sum())
    if cnt < 10:
        sys.exit(f'差異像素只有 {cnt}：確認 notext 真的只拿掉了文字，或調低 --threshold')

    ys, xs = np.nonzero(mask)
    y0, y1 = max(0, ys.min() - a.pad), min(mask.shape[0], ys.max() + a.pad + 1)
    x0, x1 = max(0, xs.min() - a.pad), min(mask.shape[1], xs.max() + a.pad + 1)
    text_l = float(np.median(lum(n)[mask]))
    bg = lum(t[y0:y1, x0:x1]).ravel()
    bg_med = float(np.median(bg))
    lighter = text_l > bg_med
    bg_worst = float(np.percentile(bg, 95 if lighter else 5))
    worst, typical = ratio(text_l, bg_worst), ratio(text_l, bg_med)

    print(f'字的像素 {cnt}｜範圍 x {x0 + ox}–{x1 + ox}、y {y0 + oy}–{y1 + oy}｜文字比底{"亮" if lighter else "暗"}')
    print(f'文字亮度（中位）{text_l:.4f}｜底色中位 {bg_med:.4f}｜底色{"95" if lighter else "5"} 百分位 {bg_worst:.4f}')
    print(f'對比：典型 {typical:.2f}｜最壞 {worst:.2f}｜門檻 {a.min}｜{"PASS" if worst >= a.min else "FAIL"}')
    sys.exit(0 if worst >= a.min else 1)


if __name__ == '__main__':
    main()
