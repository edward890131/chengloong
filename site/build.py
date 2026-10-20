#!/usr/bin/env python3
"""S0 HTML build：把各段落 partial 組成單頁。

用法：python3 site/build.py
  site/src/_head.html + site/src/sections/*.html（依檔名排序）+ site/src/_foot.html → site/index.html
  site/css/base.css + site/css/sections/*.css（依檔名排序）→ site/draft.css
  site/js/base.js + site/js/sections/*.js（依檔名排序）→ site/main.js
組好的 index.html／draft.css／main.js 不要直接改，改 partial 再 build。
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def cat(first, folder, last=None, sep='\n'):
    parts = [first.read_text()] if first.exists() else []
    parts += [p.read_text() for p in sorted(folder.glob('*' + (first.suffix or '.html')))]
    if last and last.exists():
        parts.append(last.read_text())
    return sep.join(parts)


def main():
    src = ROOT / 'src'
    (ROOT / 'index.html').write_text(cat(src / '_head.html', src / 'sections', src / '_foot.html'))
    (ROOT / 'draft.css').write_text(cat(ROOT / 'css' / 'base.css', ROOT / 'css' / 'sections'))
    (ROOT / 'main.js').write_text(cat(ROOT / 'js' / 'base.js', ROOT / 'js' / 'sections'))
    print('built site/index.html, site/draft.css, site/main.js')


if __name__ == '__main__':
    main()
