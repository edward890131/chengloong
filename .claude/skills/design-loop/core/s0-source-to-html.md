# S0 · 來源統一成 HTML

目標：不管起點是什麼，都變成「量得到、截得到、擷取得進 Figma」的 HTML，而且和來源對得上。

## 判斷起點（寫進 `manifest.source`）

| 起點 | 做法 | 下一步 |
|---|---|---|
| A 既有網站（有原始碼） | 不重做；盤點頁面與 viewport，確認有 static 模式 | 驗收 |
| B Figma key page | 還原成 HTML（下方流程） | 驗收 |
| C 既有 APP 或只有截圖 | 依截圖還原成 HTML，尺寸以裝置邏輯像素為準 | 驗收 |
| D 只有 wireframe／PRD | 不在本站處理 | 用 beta-directions 產第一版 HTML，選定後回 A |

## B：Figma key page → HTML

1. 來源檔 key 寫 `manifest.figma.source_file_key`，**只讀不寫**（設計系統與設計稿之後放 `figma.file_key` 的檔）。列出 key page 的 frame（先讀 `references/figma-gotchas.md`「讀取來源」：`get_metadata` 只回第一個 page、Group 座標與旋轉節點的陷阱），每個寫進 `registry.pages[]`（`name`、`source_node`；APP 見平台文件）。
   - **來源與設計系統同一檔**（`source_file_key`＝`file_key`，客戶只給一個檔時常見）：唯讀改成以 page 為界。在 `manifest.figma.same_file_note` 寫明「來源 page 只讀；寫入只限 Guideline page 與之後新建的擷取／功能（正式稿）page」，每個寫入腳本開頭先確認目標 page 不是來源 page；使用者要求的例外（例：只改名）逐筆記在同一欄。建議做法，待驗（0.3.0，APP 案一案）。
2. 每個 frame：`get_design_context`（結構、樣式、變數名；隱藏的 effect 也會輸出，見 figma-gotchas「隱藏節點」）＋`get_screenshot`（不會放大超過原尺寸，比對統一用 1x，見 capture-gotchas）。
3. 素材取原檔，圖示保留 SVG，不要重畫。section 內的節點用 `download_assets` 會連底色一起輸出，改用 `use_figma` 唯讀 `exportAsync`（figma-gotchas「SVG 進出都要清理」）。
4. 檔案裡有 Variables 就沿用變數名當暫定 CSS custom property；沒有就先寫值。暫定樣式集中在一支 `draft.css`，不要散在每頁，S1 再收斂。
5. 設計稿的不一致（同層級兩種字級、差 1–2px 的間距、近似色）**照稿做**，逐條記進 `_design-loop/audit-source.md`（frame、節點、值、疑似應該是）。S1 決策後才統一。
6. 每頁支援 `manifest.static_param`（預設 `?static`）：關掉進場動畫、捲動 scrub、自動輪播，停在第一個狀態。
7. APP 另依 `platforms/app.md` 的 HTML 規格（固定裝置寬、system chrome、`data-platform`／`data-theme`）。

## 驗收（每頁 × `manifest.viewports` 每一個）

- 同尺寸截圖和來源並排：主要元素位置差 ≤4px、斷行一致、無缺圖缺字、顏色一致。
- 整組文字一致上移或下移約 3px：先查來源行高是不是 `normal`（中英混排被瀏覽器 fallback 後行高變了），照 css-to-figma「Figma 行高 normal」寫死 px。實測 0.3.0。
- 超過就修到符合，或寫明原因（例：來源稿本身不一致，已記 audit-source.md）。「差不多」不算。
- `extract_computed.js` 在每個 viewport 跑一次，存 `_design-loop/measure/<頁>_<寬>.json`，S1 盤點用。
- 截圖存 `_design-loop/evidence/s0/`。

## 過站

`registry.pages[]` 每頁有 `html` 與來源，並有畫面代碼 `code`、`feature`（依功能分組提案、使用者確認；`core/figma-pages.md` §2）；`manifest.stage` 改 `S1`。
