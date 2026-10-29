#!/usr/bin/env python3
"""S0 HTML build：把各段落 partial 組成單頁。

用法：python3 site/build.py
  site/src/_head.html + site/src/sections/*.html（依檔名排序）+ site/src/_foot.html → site/index.html
  site/css/base.css + site/css/sections/*.css（依檔名排序）→ site/draft.css
  site/js/base.js + site/js/sections/*.js（依檔名排序）→ site/main.js
組好的 index.html／draft.css／main.js 不要直接改，改 partial 再 build。
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def cat(first, folder, last=None, sep='\n'):
    parts = [first.read_text()] if first.exists() else []
    parts += [p.read_text() for p in sorted(folder.glob('*' + (first.suffix or '.html')))]
    if last and last.exists():
        parts.append(last.read_text())
    return sep.join(parts)


def preload_list(html, css):
    """進場載入清單：頁面裡用到的 assets（img src／srcset、data-lottie、CSS url()），照出現順序、去重，附檔案大小"""
    urls = []
    for m in re.finditer(r'(?:src|data-lottie)="(assets/[^"]+)"|srcset="([^"]+)"|url\([\'"]?(assets/[^)\'"]+)', html + css):
        if m.group(2):
            urls += [part.strip().split(' ')[0] for part in m.group(2).split(',')]
        else:
            urls.append(m.group(1) or m.group(3))
    seen, out = set(), []
    for u in urls:
        f = ROOT / u
        if u in seen or not u.startswith('assets/') or not f.is_file():
            continue
        seen.add(u)
        out.append([u, f.stat().st_size])
    return out


def bust(text):
    """assets 網址加上內容雜湊 ?v=xxxxxxxx（vercel.json 讓 /assets 快取 7 天；換圖不改檔名時，舊快取會讓正式站看起來沒更新）"""
    def rep(m):
        f = ROOT / m.group(1)
        if not f.is_file():
            return m.group(0)
        return '%s?v=%s' % (m.group(1), hashlib.sha1(f.read_bytes()).hexdigest()[:8])
    return re.sub(r'(assets/[^"\'()\s?,]+)', rep, text)


def main():
    src = ROOT / 'src'
    header = (src / '_header.html').read_text()
    html = cat(src / '_head.html', src / 'sections', src / '_foot.html').replace('<!--@header-->', header, 1)
    css = cat(ROOT / 'css' / 'base.css', ROOT / 'css' / 'sections')
    pre = [[bust(u), n] for u, n in preload_list(html, css)]
    html, css = bust(html), bust(css)
    html = html.replace('/*CL_PRELOAD*/[]', json.dumps(pre, separators=(',', ':')), 1)
    (ROOT / 'index.html').write_text(html)
    # 服務條款頁（R3）：共用 header／頁尾。header 的錨點改連回首頁（index.html#about），logo 回首頁，服務條款標成目前頁
    terms_header = header.replace('href="#top"', 'href="index.html"')
    terms_header = re.sub(r'href="#(about|process|green|faq)"', r'href="index.html#\1"', terms_header)
    terms_header = terms_header.replace('href="terms.html">服務條款', 'href="terms.html" aria-current="page">服務條款')
    terms_header = terms_header.replace('href="terms.html"><span>服務條款', 'href="terms.html" aria-current="page"><span>服務條款')
    footer = (src / 'sections' / '09-footer.html').read_text()
    terms = (src / 'pages' / 'terms.html').read_text()
    (ROOT / 'terms.html').write_text(bust(terms).replace('<!--@header-->', terms_header, 1).replace('<!--@footer-->', footer, 1))
    (ROOT / 'draft.css').write_text(css)
    # 頁面 JS 整包等進場載入完成才跑（_head 的 window.clWhenReady；沒有載入畫面時立刻跑）
    js = cat(ROOT / 'js' / 'base.js', ROOT / 'js' / 'sections')
    (ROOT / 'main.js').write_text('(window.clWhenReady || function (fn) { fn(); })(function () {\n' + js + '\n});\n')
    print('preload: %d files, %.1f MB' % (len(pre), sum(p[1] for p in pre) / 1048576))
    print('built site/index.html, site/terms.html, site/draft.css, site/main.js')


if __name__ == '__main__':
    main()
