# S0 契約：首頁 Figma key page → HTML

主控：主 session。段落負責人照這份做；要改契約或 base 的東西寫進回報，不要自己改。

## 來源（只讀）

- Figma fileKey：`KbEu6upVzRV4mMQBRHS5Kc`（來源與之後的設計系統同一檔，**現有所有 page 一律只讀，不准寫入**）
- 來源 section：`1695:19584`「1005 前台 UI 調整」，在 page `1382:4916` 回饋調整
- 電腦版 `1695:20082` 首頁_v2_L（1440 寬）；手機版 `1695:19587` 首頁_v2_S（375 寬）
- 不要用 page「Final- 電腦版／Final- 手機版」，使用者已決定以回饋調整 section 為準

## 段落與負責人

| 檔名前綴 | 段落 | 電腦版 node | 手機版 node | 負責人 |
|---|---|---|---|---|
| 01 | 首屏（含 header） | 1695:20083 | 1695:19588 | A |
| 02 | 什麼是水銷？ | 1695:20117 | 1695:19642 | B |
| 03 | 從機密文件到日常用紙 | 1695:20245 | 1695:19747 | B |
| 04 | 服務流程 | 1695:20303 | 1695:19816 | C |
| 05 | 綠點存摺與憑證 | 1695:20313 | 1695:19826 | D |
| 06 | 串場 | 1695:20376 | 1695:19897 | D |
| 07 | faq | 1695:20379 | 1695:19900 | E |
| 08 | cta | 1695:20404 | 1695:19927 | E |
| 09 | footer | 1695:29473（footer/l） | 1695:29472（footer/s） | E |

section 1695:19584 裡、主畫面右側的節點是各段落的**替代版本與互動狀態**（例：服務流程B 四種、詳細服務流程_B、cover_img 四張、串場、cta 各兩三種）。用 `get_metadata` 1695:19584 找自己段落附近的那些節點。

## 檔案所有權（每個檔只有一個負責人）

負責人 X 的段落 NN 只寫：
- `site/src/sections/NN-<slug>.html`
- `site/css/sections/NN-<slug>.css`
- `site/js/sections/NN-<slug>.js`（有互動才建）
- `site/assets/NN-<slug>/`（該段落素材）
- `_design-loop/evidence/s0/NN-<slug>/`（截圖、比對、REPORT.md）

主控獨佔、只讀：`site/css/base.css`、`site/js/base.js`、`site/src/_head.html`、`site/src/_foot.html`、`site/build.py`、`site/assets/common/`、`_design-loop/` 內除了自己 evidence 資料夾以外的所有檔。

組好的 `site/index.html`、`site/draft.css`、`site/main.js` 由 `python3 site/build.py` 產生，**不准直接改**；誰都可以跑 build（結果只取決於 partial）。

## 寫法規則

1. **一份 HTML 同時符合 1440 與 375**：電腦版是預設樣式，手機版寫在 `@media (max-width: 640px)`。768 平板之後才定案，現在只要求 641–1439 之間**不出現水平捲軸、不重疊破版**（流動縮放即可）。
2. **段落根元素**：`<section class="cl-<slug>" data-figma="<電腦版 node>" data-figma-s="<手機版 node>">`。內部主要節點（標題、卡片、圖片、按鈕）也加 `data-figma`（電腦版 id），對得到手機版 id 時加 `data-figma-s`。
3. **class 命名**：一律 `cl-` 前綴，BEM 風格（`cl-hero__title`、`cl-hero__metric--tree`）。不准用別人的段落前綴寫樣式。
4. **值照稿寫**：顏色、字級、行高、字距、間距、圓角直接用 Figma 的值。base.css 已有的變數（`--cl-green-500` 等）值相同就用變數；稿上的不一致（同層級兩種字級、差 1–2px、近似色）**照稿做**，記進 REPORT.md 的「audit-source」清單（frame、節點 id、值、疑似應該是）。
5. **字型**：`var(--cl-font-sans)`（Noto Sans TC）、數字用 `var(--cl-font-num)`（Montserrat）。字重照稿：Regular 400、Medium 500、SemiBold 600、Bold 700。Figma 行高 `normal` 照抄 `line-height: normal`；中英混排整組文字差約 3px 時改成寫死 px（skill：css-to-figma「Figma 行高 normal」）。
6. **共用元件（base.css，直接用，不要另寫）**：
   - 主按鈕 `.cl-btn` + 顏色 `--green｜--black｜--white｜--white20`，小尺寸加 `--sm`。結構：
     `<a class="cl-btn cl-btn--green" href="#"><span class="cl-btn__circle"></span><span>免費預約水銷</span><img class="cl-btn__arrow" src="assets/common/icon-arrow-w.svg" alt=""></a>`
     白底按鈕箭頭用 `assets/common/icon-arrow-dark.svg`；`--sm` 用 `icon-arrow-w-20.svg`。
   - 綠色弧線 `.cl-curve`：inline SVG，path 的 `d` 取自 `site/assets/common/curve-pattern.svg`，path 加 `pathLength="1"`；位置與旋轉照各段落 Figma 的 curve_ani_* 容器寫在自己段落 CSS。
   - 共用元件在你段落看起來和 base 不一樣（尺寸、顏色）→ 不要改 base，回報主控；頁面暫時用自己段落的 modifier 覆寫並註明。
7. **素材**：`get_design_context` 回傳的 `https://www.figma.com/api/mcp/asset/...` 一律 `curl -sfL` 下載到 `site/assets/NN-<slug>/`，取有意義的檔名；**HTML 不准留 Figma 暫時網址**。SVG 保留原檔不要重畫、不要改 path。圖片照稿的裁切（object-fit／定位）。和 common 重複的素材直接用 common 的。
8. **隱藏圖層**（`hidden="true"`）不做。
9. **互動與動畫**：
   - 先跑 `get_motion_context`（recursive）看段落有沒有動畫；有就照它給的 keyframes 寫，並確保 `?static`（html 會加 `.is-static`）時停在**設計稿畫面的狀態**。
   - 替代版本／狀態（頁籤、手風琴、hover、輪播、tooltip）：結構一看就懂的（頁籤切換、FAQ 展開、tooltip）就做成可互動，預設狀態＝主畫面；看不懂用途的不要猜，列在 REPORT「待使用者補互動」。使用者說之後會補每段的互動機制。
   - JS 只寫在自己的 `site/js/sections/NN-<slug>.js`，用 IIFE、只抓自己段落根元素底下的節點。
10. 不使用 emoji。註解繁體中文。

## 驗收（每段 × 1440、375）

1. `python3 site/build.py`，用 Playwright（全域安裝：`require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')`，瀏覽器已裝好，不要 `playwright install`）開 `http://localhost:<port>/index.html?static`。伺服器：`python3 -m http.server <port> --directory site`，**port 用 8100 + 你的編號**（A=8101, B=8102, C=8103, D=8104, E=8105），不要用別人的。
2. viewport 寬 1440（手機 375，`isMobile: true, hasTouch: true`），`deviceScaleFactor: 1`。截自己段落根元素（element screenshot；段落比一屏高就把 viewport 高設成大於段落高）。
3. 同一段落用 Figma `get_screenshot`（nodeId＝段落 node，`enableBase64Response: true`，maxDimension 取原尺寸的長邊，最多回 1x）取來源圖。**注意：www.figma.com 已放行，可以 curl 下載 image_url。**
4. 並排比對（PIL：Figma｜HTML｜差異），存 `_design-loop/evidence/s0/NN-<slug>/<寬>_compare.png`。標準：主要元素位置差 ≤4px、斷行一致、無缺圖缺字、顏色一致。超過就修，或寫明原因（例：來源稿本身不一致）。「差不多」不算。
5. 用 Read 看比對圖確認，不是只看數字。

## 回報（寫 `_design-loop/evidence/s0/NN-<slug>/REPORT.md`，回覆訊息也附摘要）

- 完成的段落、1440／375 驗收結果（位置最大差、像素差異比例、未解決項與原因）
- 下載的素材數量
- 新增 class 數量與清單
- audit-source（設計稿不一致清單）
- 共用元件／base 需求（給主控）
- 替代版本／狀態：做了哪些互動、哪些待使用者補
- LESSONS（skill 沒寫到的坑）
