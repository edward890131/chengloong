# HTML 擷取與瀏覽器量測踩坑

未標版本的是 0.1.0 實測。

## generate_figma_design 擷取流程

- 頁面裡呼叫 `captureForDesign` 後 promise **不會 resolve**：在 run_code 裡 await 會卡死，批次迴圈後面的頁永遠不跑。
  → 一頁開一個分頁：呼叫但不 await，回傳後用 `generate_figma_design` 帶 captureId 輪詢。
- 多頁同時擷取（實測 0.3.0）：目標檔已存在時可一次產多個 captureId、每頁一個分頁同時擷取（4–9 頁約 15 秒到 1 分鐘）。完成順序不等於 id 順序 → 用產出 frame 的原名 `Main Content (<HTML title>)` 對回頁面（每頁 `<title>` 要唯一）；輪詢偶爾回 502，再輪詢即可。證據：APP 案三批共 30 餘頁。
- 頁面要用 http 伺服（`python3 -m http.server`），`file://` 不支援；`nodeId` 帶 page id 可直接放進指定 page（實測 0.3.0，APP 案）。
- 網址加 `manifest.static_param`（`?static`），否則捲動進場的區塊會以透明狀態被擷取。
- 擷取前跑 `scripts/capture_prep.js`：捲到底觸發 lazy load、圖片改 eager、關掉會跑版的 CSS。
- 擷取後處理（實測 0.3.0）：600 字重可能被寫成「Semi Bold」（Figma 字型名是「Semibold」），`loadFontAsync` 不報錯，搬 frame（appendChild）時才報 unloaded font → 搬之前 `getStyledTextSegments(['fontName'])` 找出、`setRangeFontName` 改正。證據：APP 案三批共 122 段。

## 擷取不支援（擷取稿和 HTML 不同時以 HTML／元件為準）

| HTML 寫法 | 擷取結果 | 對策 | 狀態 |
|---|---|---|---|
| `background: linear-gradient(currentColor…)`＋`background-size: … 1px` 滑入底線 | 整塊實心填色 | capture_prep 處理 | 實測 |
| `text-decoration: underline`＋透明 `text-decoration-color` | 看得見的底線 | capture_prep 處理 | 實測 |
| `<select>` 的 background-image 箭頭 | 跑到左邊 | 換成 SVG 放右側，或事後在 Figma 修 | 實測 |
| logo 著色遮罩、`inset` box-shadow、背景影片、grain 平鋪圖 | 遮罩沒套上、陰影遺失、影格不同、雜訊方塊 | 重建以元件為準 | 實測 |
| WebGL canvas | 空白 | 用 Playwright 截圖當對位參考 | 實測 |
| CSS `mask`＋currentColor 畫的 icon、字標、密碼圓點 | 實心色塊（位置尺寸正確） | 擷取稿只當對位參考；要擷取也正確就改 inline SVG＋currentColor | 實測 0.3.0，APP 案 status bar |
| 多段 `linear-gradient`＋`background-size` 畫的角標（取景框四角） | 整片白色蓋住畫面（像素差 44–49%） | 擷取稿隱藏該層，重建照 HTML | 實測 0.3.0，APP 案相機頁 |
| absolute 選單、疊層 | 疊層順序畫錯（位置尺寸正確） | 重建以 HTML 疊層為準 | 實測 0.3.0，APP 案對話選單 |
| `<img>` 帶 opacity 的 disabled icon 按鈕 | 整個遺失 | 重建以 HTML 為準 | 實測 0.3.0 |
| `fit-content` 泡泡；有序清單「1.」；placeholder「…」 | 偶爾拉成滿寬靠左（不一定重現）；編號後間距變寬；畫成置中「⋯」 | 重建以 HTML 為準 | 實測 0.3.0，APP 案對話頁 |

## 量測與截圖（Playwright）

- Playwright MCP `browser_take_screenshot` 的 filename 只能放專案根目錄或 `.playwright-mcp/`，存完要搬走。
- `browser_run_code_unsafe` 裡沒有 `require`，但 `page.screenshot({path})` 可以寫到 scratchpad 絕對路徑，適合批次截圖。
- 回傳資料超過約 5 萬字元會被截斷：先存 `window.__dl`，分段取。
- 多個 agent 平行量測：Playwright MCP 只有一個瀏覽器，留給主 agent；其他 agent 在 scratchpad `npm i playwright` 自己開。
- 比對尺度統一 1x（實測 0.3.0／0.4.0）：`get_screenshot` 最多回 1x（`maxDimension` 大於節點原尺寸時不放大）→ Playwright 用 `deviceScaleFactor: 1`，已有的 DPR2 截圖縮回 1x 再比。證據：APP 案 375×812 frame 要求 1624 仍回 375×812；Web 案 S4 對位。
- 長頁不用 `fullPage`（實測 0.3.0／0.4.0）：sticky 會停在第一個視窗；Playwright `isMobile`＋`hasTouch` 下 fullPage 或超過一屏的 element／clip 截圖還會改變 vh 與 pointer 相關版面（Web 案 Footer 1895 截成 1636）。
  → APP 畫面：viewport 高設成頁高，畫面容器用 `overflow: clip`（`hidden` 會讓 sticky 失效）。
  → Web 手機：固定 viewport 分段截圖再拼接。拼前把 sticky 元素（篩選列、錨點列、sticky 欄）改 `position: relative`（不影響版面）；第一段之後隱藏 fixed nav 與 fixed 舞台層，否則每段疊一層。位置數值以 DOM 量測為準，截圖只當對照。
- 含 iframe 的長元素做 element screenshot 會拍成空白 → 捲到位後用視窗截圖（實測 0.3.0，手冊嵌原型畫面）。
- `mask-image: url(x.svg)` 在 `file://` 被 CORS 擋、icon 整個消失 → 改內嵌 data URI（`#` 編碼成 `%23`）或 inline SVG＋currentColor（實測 0.3.0）。

## 字寬：瀏覽器和 Figma 不一致，方向依字型（實測 0.3.0；0.4.0 修正方向）

- 症狀：接近滿寬或貼齊內容寬的文字，兩邊斷行不同，R2 斷行不一致；數字夾半形空格（例：電話號碼分段）差得更明顯。
- 原因：同一字型在瀏覽器與 Figma 的字寬不同，**方向不固定**。APP 案 macOS headless Chromium 的 PingFang TC 約 1.021em（12px 字＝12.252），Figma 1.0em → 瀏覽器寬；Web 案品牌字型反過來 Figma 較寬，貼齊內容寬的標題在 Figma 多斷一行。0.3.0 寫成固定「瀏覽器比 Figma 寬」，0.4.0 推翻。
- 對策：caption、說明、錯誤句寫短（手冊文案章寫上限）；母版文字框不要貼齊內容寬（CSS shrink-to-fit 的標題改 FILL、不設 max-width）；S7 R2 專查接近滿寬的文字（見 `core/s7-review.md`）。
- 證據：APP 案 25 字錯誤句，瀏覽器 318.6 大於可用 315，Figma 300 一行；Web 案主打卡標題 274 在 Figma 多一行。
