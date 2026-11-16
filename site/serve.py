#!/usr/bin/env python3
"""本機預覽：python3 site/serve.py [port]（預設 8000）

跟 Vercel 的 cleanUrls 一樣，/terms 會讀 terms.html，所以不帶 .html 的連結在本機也點得開。
"""
import functools
import http.server
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.path.split('?', 1)[0].split('#', 1)[0]
        if path != '/' and not Path(path).suffix and (ROOT / (path.lstrip('/') + '.html')).is_file():
            self.path = path + '.html' + self.path[len(path):]
        return super().send_head()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print('http://localhost:%d' % port)
    http.server.ThreadingHTTPServer(('', port), functools.partial(Handler, directory=str(ROOT))).serve_forever()
