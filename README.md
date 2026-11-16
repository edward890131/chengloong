# 正隆 機密文件水銷服務 · 形象網站

純靜態網站（HTML／CSS／JS），沒有框架、沒有套件要安裝。網站在 `site/`，部署在 Vercel（從 `main` 自動部署）。

## 快速開始

```bash
git clone --depth 1 https://github.com/edward890131/chengloong.git   # repo 歷史較大，只抓最新版即可
cd chengloong
python3 site/build.py            # 組裝成品（Python 3，只用內建模組）
python3 site/serve.py           # 本機預覽 http://localhost:8000（和 Vercel 一樣支援 /terms 這種不帶 .html 的網址）
```

要用 http 伺服器開，直接雙擊 `index.html`（`file://`）部分圖示和動畫會載不到。站內連結一律不帶 `.html`（SEO 規格），一般的 `python3 -m http.server` 點服務條款會 404，請用 `serve.py`。

## ⚠️ 不要直接改的檔案（自動產生）

| 檔案 | 由什麼產生 | 要改請改 |
| --- | --- | --- |
| `site/index.html` | `site/build.py` | `site/src/_head.html`、`_header.html`、`sections/*.html`、`_foot.html` |
| `site/terms.html` | `site/build.py` | `site/src/pages/terms.html`（header／頁尾共用首頁的） |
| `site/draft.css` | `site/build.py` | `site/css/base.css`、`components.css`、`sections/*.css` |
| `site/main.js` | `site/build.py` | `site/js/base.js`、`sections/*.js` |
| `site/sitemap.xml`、`site/robots.txt` | `site/build.py` | `build.py` 最上方的 `SITE_URL`、`LASTMOD` |
| `site/css/tokens.css` | `site/tokens/tokens.json` | 見下方「Design token」 |

改完原始碼一定要跑 `python3 site/build.py`，再一起 commit 原始碼與成品。直接改成品，下次 build 就會被蓋掉。

`build.py` 也會幫 `assets/` 網址加上內容雜湊（`?v=xxxxxxxx`），換圖不改檔名時，正式站才不會吃到舊快取。

## 檔案結構

```
site/
  src/            HTML 原始碼：_head、_header、_foot、sections/01–09（依檔名順序組成首頁）、pages/terms.html
  css/            tokens.css（產生）、base.css、components.css、sections/01–10
  js/             base.js、sections/*.js（各段落互動：輪播、頁籤、FAQ、選單…）
  assets/         圖片、SVG、Lottie 動畫，依段落分資料夾
  vendor/         lottie_light.min.js（第三方，含授權檔）
  tokens/         tokens.json（顏色、字級、間距等設計數值的來源）
  preview/        設計審稿用工具，見「上線前要處理」
_design-loop/     設計流程紀錄（網站與 Figma 的對照表、同步紀錄），不會被部署
.claude/          Claude Code 設定與 design-loop skill，不會被部署
vercel.json       部署設定：只發布 site/
```

首頁段落：01 Hero · 02 關於 · 03 再生紙 · 04 服務流程 · 05 綠點存摺 · 06 跑馬燈 · 07 FAQ · 08 CTA · 09 頁尾。

class 前綴統一 `cl-`，BEM 命名（`.cl-段落__元素--狀態`）。HTML 上的 `data-figma` 屬性是對應 Figma 節點的 id，不影響畫面，可保留或移除。

## Design token

顏色、字級、間距、圓角等數值寫在 `site/tokens/tokens.json`，和 Figma 的 Variables 一一對應。`tokens.css` 由它轉出，CSS 裡請用變數（例如 `var(--cl-text)`），不要寫死色碼。

要改這些數值請先和設計確認，從 `tokens.json` 改，再重新產生：

```bash
python3 .claude/skills/design-loop/scripts/tokens_build.py --help
```

## 待串接

目前沒有任何 API 或表單送出，以下按鈕都是空連結（`href="#"`）：

| 按鈕 | 位置 |
| --- | --- |
| 企業登入 | `src/_header.html`（header 與手機選單各一） |
| 免費預約水銷 | `src/_header.html`（header 與手機選單各一）、`src/sections/01-hero.html` |
| 已有預約？查詢狀態、立即預約 | `src/sections/08-cta.html` |
| 頁尾 Logo | `src/sections/09-footer.html`（「回到頂部」已由 JS 處理，不用串） |

## 上線前要處理

1. **移除設計審稿工具**：右上角的 RWD 裝置切換與樣式檢查模式（`site/preview/`）只給設計看稿用。刪掉 `src/_head.html` 的 `preview.css` 那行與 `src/_foot.html` 的 `preview.js`、`inspect.js` 兩行，再 build。（網址加 `?static` 可暫時關閉這些工具。）
2. **正式網域**：改 `site/build.py` 最上方的 `SITE_URL` 再 build，canonical、og、JSON-LD、sitemap、robots.txt 會一起換。另外把 `vercel.json`（根目錄與 `site/` 各一份）裡 `X-Robots-Tag: noindex` 的 host 確認仍是測試網域，正式網域才會被收錄。

## SEO

依同事交付的「官網首頁 SEO 交付規格」（2026-10-28）實作：`<head>` 標籤、標題層級、圖片 alt、`sitemap.xml`、`robots.txt`、兩段 JSON-LD（Organization＋LocalBusiness、FAQPage）。

- **FAQ 改字要兩邊一起改**：`src/sections/07-faq.html` 與 `src/_head.html` 的 FAQPage JSON-LD。不一致時 `build.py` 會停下來報錯。
- **sitemap 的 lastmod**：頁面文字或數字有改時，更新 `build.py` 的 `LASTMOD`。
- **標題標籤**：`#`、Q 編號、說明泡泡都放在標題標籤外面；為了 SEO 改成標題的元素加了 `.cl-h`（字級字重沿用外層，畫面不變）。
- 上線後用 Google 複合式搜尋結果測試（https://search.google.com/test/rich-results ）驗證兩段 JSON-LD。

## 部署

Vercel 從 `main` 自動部署，`vercel.json` 設定只發布 `site/`（`.vercelignore` 另外排除原始碼與 `_design-loop/`）。`/assets` 快取 7 天、`/vendor` 快取 1 年。測試網域 `clc-doc-destruction.vercel.app` 回應 `X-Robots-Tag: noindex`，不被搜尋引擎收錄（Vercel 的 preview 網址本來就會自動加）。

## 設計檔

Figma：`92wzZHRzpnIdSNes9Ko7VV`（Guideline 頁有元件規格與狀態說明）。
網站與 Figma 的元件對照在 `_design-loop/registry.json`。
