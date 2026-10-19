# S2 · 頁面對齊 Guideline ＋ 擷取對位稿

目標：HTML 頁面改成真的吃 Guideline；再把對齊後的頁面擷取進 Figma，當 S4 重建的像素基準。

## 對齊

1. 改前備份 HTML 資料夾（專案既有備份位置，或 `_design-loop/backup/<日期>_before_s2/`）。
2. 頁面載入 `tokens.css`＋`components.css`；舊 CSS 的寫死值改用 token。沒載 tokens.css 的檔案寫 `var(--{prefix}-token, 原值)` 當備援。
3. audit.md 的決策逐條套用，套完在該列標 ✓。
4. 允許例外在 CSS 當行註解：`/* 例外：audit B3，nav 1280 */`。

## 驗證

- 寫死值掃描（同 S1 的 grep，排除 tokens.css 與有「例外」註解的行）＝0。
- 每頁 × 每個 viewport 改前改後截圖；每一處差異都要對得回某條決策，對不回去就是改壞。
- console 0 error；每個 viewport 沒有水平溢出。
- `?static` 真的停住：停動畫的全域規則（`[data-static] *{animation:none;transition:none}` 這類）要放在頁面一定會載入的 base CSS。暫定樣式（draft.css）被 components.css 取代時這條最容易遺失，擷取就會拍到動畫中間格。實測 0.3.0（APP 案）。

## 擷取對位稿

照 `references/capture-gotchas.md` 做（多頁可同時擷取；APP 流程見 `platforms/app.md` S2）。

1. Figma 檔照 `core/figma-pages.md` 建 page 結構：先建 `Guideline`（S3）、`HTML 擷取` 與分隔線；功能 page（正式稿）在 S4 產出該功能第一張稿時再建。page id 寫進 `manifest.figma.pages`。
2. 每頁擷取前跑 `capture_prep.js`，再用 `generate_figma_design` 擷取到 `HTML 擷取` page 的功能 Section，命名 `<畫面代碼> <頁名> · HTML 擷取（<寬>，<日期>）`（舊格式專案沒有代碼就用 `<頁名> · …`）。
3. 擷取稿 node id 寫 `registry.pages[].capture_node`，頁高寫 `registry.pages[].height.capture`。
4. 擷取稿只當對位參考和圖片 hash 來源，不在上面改設計。

## 過站

首次建置：`manifest.stage` 改 `S3`。S6 循環中跑這站不改 stage。
