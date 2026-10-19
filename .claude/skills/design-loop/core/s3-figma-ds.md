# S3 · Figma 設計系統（Guideline Frame board）

目標：在 Figma 還原一份和 HTML Guideline 章節一一對應的手冊，並在裡面建好 Variables、樣式、元件母版。之後的設計稿只能用這裡的東西組。

**REQUIRED：** figma-use ＋ figma-generate-library。API 用法以它們為準；本文件只寫它們沒有的專案慣例。
**必讀：** `references/css-to-figma.md`、`references/integer-rules.md`、`references/figma-gotchas.md`、`references/figma-instance-gotchas.md`。
`{FP}` ＝ `manifest.figma_prefix`。

## 0. 開工前

- `use_figma` 唯讀盤點：pages、collections、styles、components。已經有東西就沿用命名。
- **已經有 Figma DS 的專案**：先跑本站「驗收」當起點，缺什麼補什麼。既有變數沒設 codeSyntax 時，先在 `manifest.token_map` 寫命名規則讓 token_diff 能比，再排時間補 codeSyntax。
- v1 範圍寫進 `_design-loop/FIGMA_DS_SPEC.md`：token 清單（來自 tokens.json）、元件清單（來自 components.css 與手冊元件章），分 atoms／molecules／organisms。
- 請使用者決定：設計系統與設計稿放同一檔，或 DS 獨立發佈成 Library。預設同一檔。
- **字型 MCP 讀得到嗎**：`listAvailableFontsAsync` 只列 Figma 雲端字型，讀不到使用者本機字型（設計師畫面上看得到不代表 MCP 讀得到）。手冊指定的字型不在清單 → 開工前請使用者把字型上傳給 Figma，上傳後重查到齊才建文字樣式，結果寫 `manifest.decisions`。實測 0.3.0（APP 案系統中文字型）。

## 1. Variables

Web 三個 collection（APP 見 `platforms/app.md`）：

| Collection | Modes | 內容 | scopes |
|---|---|---|---|
| `{FP} · 1 Primitives` | Value | ref 色板、間距階梯、圓角 | 全部 `[]` |
| `{FP} · 2 Semantic` | Light（`options.dark` 加 Dark） | surface／text／border／accent／status／glass、字體家族 | 依用途 |
| `{FP} · 3 Responsive` | 依 `manifest.modes.Responsive` | `type/<token>/size｜line-height`、`layout/*`、`comp/*` | 依用途 |

- Semantic 一律 alias 到 Primitives，不重複寫值。
- **每個變數設 `codeSyntax.WEB = var(--{prefix}-...)`**，這是 token_diff 對應 CSS 的依據。交接框架在 Figma 有對應欄位（iOS／ANDROID）才另外設；Flutter 沒有，只設 WEB。
- 行高變數存**整數 px**；字距**不做變數**（文字樣式用 PERCENT）。
- 不隨斷點變的 comp 值（按鈕高、圖示尺寸）也放 Responsive，每個 mode 填同值，之後要分斷點不必搬家。
- 建完：`figma_export_variables.js` 分批匯出存 `_design-loop/measure/figma_vars_*.json` → `token_diff.py`，不一致 0 才往下。

## 2. 樣式

- 文字樣式 `{FP}/<角色>`（Display、H2…Caption、Button、Nav），元件專用 `{FP}/Comp/<名>`；字級、行高綁變數，字體綁 `font/*`。
- 字重照 `manifest.font_weight_map`，先 `listAvailableFontsAsync` 確認字型真的有那個 style（css-to-figma）。
- 效果樣式 `{FP}/Elevation N`、`{FP}/Blur SM｜MD｜LG`；漸層遮罩做 paint style `{FP}/Scrim/*`。
- 樣式 description 寫：對應 CSS token、Figma 換算差（「Figma 行高取整數 px，網頁維持比例」「背景模糊＝CSS blur×2」）。

## 3. Guideline Frame board

- `Guideline` page 上，HTML 手冊每一章建一個 frame，編號與標題完全一致（例：`10.4 按鈕 Button`）。
- 每章用同一個 `DS/Section Header` 元件當標頭（Chapter／Title／Lead）。
- 基礎章（色彩、字級、間距、圓角、陰影）放色票、字樣、間距條；數值文字和 HTML 手冊一致。
- 章節 frame id 寫進 FIGMA_DS_SPEC 的對照表。

## 4. 元件母版

atoms → molecules → organisms，**一個做完驗完才做下一個**。

1. 放在對應章節 frame 內：標頭 → 示範區（母版本體）→ 規格說明文字。
2. 命名 `{FP}/<元件>`；變體屬性英文 key：`Variant`、`State`（Default／Hover／Focus／Pressed／Disabled；APP 沒有 Hover）、`Size`、`Theme`。
3. 一律 auto-layout；尺寸用 FILL／HUG，只有規格固定尺寸（圖示鈕、圖示）用 FIXED。可重複使用的列、卡片**不要**把寬度綁變數（instance 會無法 FILL）。內文與會換行的標題預設 FILL：auto-width 文字放進 FILL 欄不會換行，也不要讓文字框貼齊內容寬（兩邊字寬不同會多斷一行；實測 0.4.0，Web 案）。
4. 顏色綁 Semantic；padding、gap、圓角綁變數；不寫死 hex。
5. 文字套 `{FP}/*` 樣式再綁顏色；要替換的文字做 TEXT property。
6. 圖示：從 HTML 原始碼複製 inline SVG → `createNodeFromSvg` → flatten → resize 到網站實際顯示尺寸 → 線寬對齊網站 → 綁顏色 → 做成 `{FP}/Icon/<名>`。不可用線段重畫。
7. 可開關的部件用 BOOLEAN；可替換子元件用 INSTANCE_SWAP（不要一個圖示一個變體）。數量會變的部件（分頁籤、索引項）一開始就做到最大數量＋BOOLEAN，不要做死 3 個。
8. 文字截斷（line-clamp）、最大寬（max-width）設在**母版**，instance 改不動。
9. `description`：一句定義＋對應 CSS class（例：`篩選列下拉。.{prefix}-dropdown`），必要時加 Figma 取整差。
10. 每做完一個：`node.screenshot()` 自查（裁字、重疊、顏色）→ `figma_audit.js` 掃這個元件（`rootIds`）→ 寫 `registry.components[]`（css、guideline 章節、node_id、key、type、properties 完整 key 含 `#` 後綴、variantOptions）。

registry 以**區塊層 class** 為單位（`.x-card`）。BEM 子元素（`__`）是元件內部圖層，modifier（`--`）是變體，不各自登記。

## 5. 分工

- 官方建議 `use_figma` 寫入循序。多 agent 並行在 APP 案可行（建議做法，待驗），前提：每個 agent 只負責自己的元件批次或 frame；**同一個母版只有一個負責人**；其他人發現母版問題寫 `DS_GAPS.md`，不自己改。只有一個 agent 作業時，它就是母版負責人。
- agent 回報要附：node id、key、屬性完整 key、截圖、已知限制。
- 多人分章節建母版的分層、所有權與派工前置見 `core/parallel.md`。

## 驗收

- `figma_audit.js`（`componentsOnly: true`）掃 Guideline page：`decimals` 0（例外只限 `manifest.integer_policy.exceptions`）、`unboundPaints` 0、`unstyledText` 0（刻意不套樣式的，例如字標，寫進 manifest 例外並說明）。
- `token_diff.py`：不一致 0、Figma 有 CSS 沒有 0、未設 codeSyntax 0。
- `registry.json`：components.css 每個區塊層 class 都有 Figma 母版，或標 `web-only` 並寫理由。
- 每個元件 description 有 CSS class。
- 使用者看過 Guideline page 截圖。

## 過站

首次建置：`manifest.stage` 改 `S4`。S6 循環中跑這站不改 stage。
