# S1 · 萃取 Guideline

目標：把 HTML 的實際樣式整理成 Ant Design 形式的設計手冊，外加機器讀得懂的 tokens。這一站決定之後每一站的品質上限。

專案已經有手冊與 tokens：不重做，直接跑下方「驗收」，缺什麼補什麼（鐵律 3）。

## 產出（路徑寫進 `manifest.paths`）

| 檔案 | 內容 |
|---|---|
| `tokens.json` | W3C DTCG（`$value`／`$type`／`$description`），三層 `ref` → `sys` → `comp`。sys／comp 每個 token 加 `$extensions.designLoop.css`（CSS 變數名）。有多個 mode 時，`$value` 是預設 mode，其他 mode 寫 `$extensions.designLoop.modes`（例 `{"Tablet": "56px", "Dark": "{ref.color.forest.100}"}`，mode 名稱對 `manifest.modes`） |
| `tokens.css` | `--{prefix}-ref-*` → `--{prefix}-*`（開發唯一引用層）→ `--{prefix}-c-*`；viewport／主題覆寫集中在檔尾 |
| `components.css` | `.{prefix}-*` 元件 class，只引用 sys／comp token |
| `guideline-src/parts/NN_*.html` ＋ `build_guideline.py` | 手冊原始章節；輸出 `guideline/index.html`，組好的檔不手改 |
| `audit.md` | 現況盤點與統一決策紀錄 |

Figma 變數與 CSS 的對應以 Figma 的 `codeSyntax.WEB` 為準（S3 設定），tokens.json 不另外記 Figma 名稱，避免兩份真相。

章節骨架：`templates/guideline-outline.md`（00–16 章；APP 另補 `platforms/app.md` 列的章節）。

多個 agent 分章並行：先寫契約與檔案所有權，comp token 用碎片檔，照 `core/parallel.md`。

## 流程

1. **盤點：量，不要猜**
   - `extract_computed.js` 的結果：同一角色出現幾種值。
   - 靜態掃 CSS 寫死值：`grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(|[0-9.]+px' <css>`（排除 tokens.css）。
   - 對比度：透明色先和底色混色再算 WCAG 2.2。
   - 寫進 audit.md，每列：`# ｜現況（實測值）｜出處 file:line｜問題｜手冊標準｜嚴重度（高／中／低）`。
   - 來源是 Figma key page 時，`audit-source.md` 每一條都併進來。
2. **決策**
   - 同一層級多種值：選一個當標準，其他值標「降為 X」或「允許例外＋理由」。
   - 兩個選項都說得通（例：區塊標題 48 或 56）→ 列給使用者拍板，不要自己挑。
3. **token**
   - ref 放原始值，元件不直接用；sys 用角色命名（surface／text／border／accent／status），不用顏色名。
   - 字級 token 成組：`fs`／`lh`／`ls`；CSS 行高寫比例、字距寫 em（Figma 換算見 css-to-figma）。
   - 每個 mode 都要有值，對應 `manifest.modes`。
4. **元件章節**（Ant Design 格式，每個元件都要有）
   用途 → 何時用／不用 → 結構（組成部件）→ 變體與狀態 → 規格表（寫 token 名，不寫裸值）→ Do／Don't → 對應 class 與 HTML 範例。
5. **頁面樣板章節**：現有頁面拆成樣板（區塊順序 → 元件）、Wireframe 標註 → 元件對照、「遇到新區塊的判斷步驟」。S6 照這章延伸。
6. **AI 延展章節**：步驟、指令範本、自我檢查清單、回報格式（對應 S6、S7）。
7. **對標章節**：Web 對 Ant Design × Material 3；APP 對 Material 3 × Apple HIG。寫採用什麼、不採用什麼、為什麼。
8. build 手冊，每個 viewport 截圖檢查示範區。

## RWD 字級標準（使用者規範，0.4.0）

定字級 token 與各 mode 值時照做；和現況衝突的列進 audit.md 由使用者決策，不自己放寬。

- **標題：手機 ≤ 桌機。** 每個標題層級（H1–H6、KV 標、區塊標題）的 Mobile 值不可大於 Desktop 值。桌機標題可以放大做氛圍，手機以閱讀與版面為先。
- **閱讀型文字不縮：手機至少 14px，內文建議 16px。** 閱讀型＝內文、說明、列表、表單說明與錯誤訊息。
- 12–13px 只給非閱讀文字（標籤、註腳、時間戳、徽章），並在手冊寫明用途。
- 手冊 04 章每個文字角色列出各 viewport 的值，標示是「標題」或「閱讀型」。

## 撰寫規範（實測 0.3.0，APP 案）

- **components.css 的結構選擇器限定直接子層**：`:has(> .x-keyboard) > .x-home`，不寫後代選擇器。症狀：手冊或畫面內嵌預覽裡的子元件也觸發了外層規則（內嵌的鍵盤讓外層 home indicator 被改掉）。
- **手冊 demo 外框用內容寬，不用裝置寬**：畫面片段 demo 寫裝置寬（375）在 390 寬檢查手冊時會溢出；用內容寬（例：左右邊距 20 後的 335）。完整畫面才用裝置寬，並確認手冊最窄 viewport 不出水平捲軸。
- **比例型規格用渲染量測，不目測**：「約 20% 品牌色」這類插畫或圖形規格，把圖放大 8 倍渲染後算品牌色像素占線面像素的比例，寫成範圍（例：13–27%）。目測在不同人、不同縮放下判斷不一致。

## 驗收

- audit.md 高嚴重度 100% 有決策；中低嚴重度有決策或明寫延後。
- tokens.json 每個 sys／comp token 有 `$description` 與 `$extensions.designLoop.css`；`token_diff.py --json` 的「tokens.json ↔ CSS 不一致」為 0。
- 手冊 build 成功；示範元件吃的是 components.css，不是手冊自己另寫的樣式。
- APP：設計師沒畫的平台照 `platforms/app.md`「S1 額外驗收」過關。
- **使用者看過並同意手冊標準**（這一站結束一定要讓使用者過目）。
- 和使用者確認 `manifest.benchmarks`（業主認可的基準頁）與 `manifest.forbidden`（禁用做法），S6、S7 會用。

## 過站

手冊版本紀錄（16 章）記 v1.0；`manifest.paths` 填齊；`manifest.stage` 改 `S2`。
