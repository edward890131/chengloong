#!/usr/bin/env python3
"""手冊組裝：parts/*.html 依檔名排序串成單一 HTML（S1、S5）

用法：python3 build_guideline.py --src <parts 資料夾> --out <輸出 index.html>
▸ 檔名前綴數字決定順序；第一個要是 00_*.html（head），最後一個要是 99_*.html（foot）
▸ 輸出檔是組裝結果，不手改；要改就改 parts 再跑一次
"""
import argparse
from pathlib import Path


def main():
    ap = argparse.ArgumentParser(description='組裝設計手冊')
    ap.add_argument('--src', required=True, help='parts 資料夾')
    ap.add_argument('--out', required=True, help='輸出的 index.html')
    a = ap.parse_args()

    parts = sorted(Path(a.src).glob('*.html'))
    if not parts or parts[0].name[:2] != '00' or parts[-1].name[:2] != '99':
        raise SystemExit('✕ parts 資料夾需要 00_*.html（head）與 99_*.html（foot）')
    html = '\n'.join(p.read_text(encoding='utf-8').rstrip('\n') for p in parts) + '\n'
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print(f'✓ {out}：{len(parts)} 個章節檔、{len(html):,} 字元')
    for p in parts:
        print('  ·', p.name)


if __name__ == '__main__':
    main()
