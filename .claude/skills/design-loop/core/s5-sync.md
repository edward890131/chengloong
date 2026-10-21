# S5 · 三邊同步（常駐）

任何一邊變了，三邊都要跟上：**HTML 頁面 ↔ HTML Guideline（含 tokens）↔ Figma（Variables、母版、設計稿）**。

觸發：
- `SYNC_PENDING.md` 有未勾選項目（hook 比對監看檔案 mtime，Edit／Write／Bash／腳本寫的都記）。
- 使用者說「改完了／同步」，或提到在 Figma、用其他工具先改過（Figma 端的改動 hook 抓不到，照使用者描述建立項目）。
- S6 新增了元件或 token。
- 設計師下指令要把調整區的副本套回正式稿（例：「A-01 調整好了，套回去」）：照 `core/figma-pages.md` §5 用 `adjust_diff.js` 比對差異後，用本站流程寫回並同步。
- 發現設計師直接改了正式稿：照 `core/figma-pages.md` §5「設計師直接改了正式稿」先確認，確認後當 Figma 端異動處理。

**寫入任何正式稿之前**，先對要寫的畫面跑 R2 文字比對；有 SYNC_LOG 解釋不了的不一致＝有人直接改過 Figma，先確認再寫，不要蓋掉（figma-pages §5）。

## 1. 分類異動

| 類型 | 判斷 | 例 | 至少要動 |
|---|---|---|---|
| T token 值 | 改的是 `--x-*` 本身的值，所有引用處都會變 | `--x-space-6` 24→28 | tokens.json、tokens.css、Figma 變數、手冊色票／規格表 |
| C 元件樣式或結構 | 改 components.css 裡元件引用哪個 token，或元件結構 | 卡片內距改用 `--x-space-7` | components.css、手冊元件章、Figma 母版、受影響設計稿 |
| V 新元件或新變體 | 新 class 或新 modifier | 卡片「只有圖片」 | C 類全部＋registry；照 S3 §4 規則建（REQUIRED figma-generate-library），不需要重新擷取 |
| P 頁面版面或內容 | 頁面區塊順序、文案、版型 | 區塊換位置 | HTML、S2 重新擷取該頁、S4 更新該頁設計稿；樣板改變時加手冊樣板章 |
| G 規範文字 | 用法說明 | Do／Don't 補充 | 手冊 parts、Figma 規格文字 |

一次異動可以同時屬於多類（例：C＋V），各類要動的都要做。

## 2. 先定真相

- **使用者親手改的那一邊就是新的意圖**，其他邊跟上；只確認範圍（例：全站都改？每個 mode 都是這個值？）。不要把使用者的改動改回去。
- **AI 主動想改全站既有 token 的值**（不是使用者要求的）→ 先問使用者。
- 沒有人指定時：**量測以渲染結果為準**（Playwright 讀 `getComputedStyle` 與 `getBoundingClientRect`，Figma 母版一律畫渲染尺寸），**意圖以 tokens.json 為準**。
- 量測和 token 不一致（例：token 寫 48、實際渲染 50）：先查 box model（border-box、border、padding、line-height），把原因和選項列給使用者：
  - token 改成實際值 → 三邊一起改
  - token 維持下限（min-height）並在手冊註明 → 在 `manifest.token_diff_ignore` 登記該 CSS 變數並寫理由，token_diff 才不會一直報
  決定前不要自己挑一邊。

## 3. 影響分析（用 registry，不要憑印象）

1. 找受影響的 class：
   - C／V 類：異動的 class 本身。
   - T 類：`grep -rn -- '--x-token' <components.css> <頁面 CSS>` 找出引用這個 token 的 class。
2. class → `registry.components[]` 找 Figma 母版。
3. 母版 → `registry.pages[].components` 找出用到的設計稿。
4. `use_figma` 在用到的功能 page（舊格式：設計稿 page）查 `INSTANCE[mainComponent=<id>]`，列出**有覆寫**被異動屬性的 instance（覆寫不會跟著母版更新）。母版是 COMPONENT_SET 時，對每個變體的 id 各查一次。
5. 影響清單先寫進這次 SYNC_LOG 草稿，再動手。

## 4. 修改順序

**HTML／CSS 先動（預設）**
1. 原始碼：tokens.json → tokens.css → components.css／頁面 CSS／JS。
2. 手冊：改 `guideline-src/parts/` → `build_guideline.py`（組好的 index.html 不手改）。
3. Figma：Variables／樣式 → 母版 → 設計稿 instance（清掉過時覆寫）→ Figma 手冊規格文字。
4. 部署（如有），驗專屬部署網址。

**Figma 先動**（使用者在 Figma 改了母版、加了變體）
1. `use_figma` 讀出異動的實際值與綁定；對不到既有 token 的值列給使用者確認規格。
2. 照 S3 §4 驗母版（命名、綁定、整數、description），更新 registry。
3. 回頭實作 HTML：components.css（新 modifier）→ 手冊元件章示範 → build。
4. 驗證時用手冊示範的渲染結果對 Figma 母版，量測規則同上。
5. 有頁面用到才更新 HTML 頁與設計稿。

## 5. Figma 端必查

- **改母版前**記下受影響頁面頁高；改完重量。
- `resize()` 之後原本 FILL／HUG 會變 FIXED，要設回來。
- 單一元件改成 variant set、或複製變體：屬性 `#` 後綴會變、子層綁定可能掉 → 更新 registry.properties，確認既有 instance 覆寫還在。
- 新增屬性要向下相容：不改既有 key、屬性名、預設值。
- 新增鎖比例圖框：寬度照 integer-rules §4 取倍數。

## 6. 驗證

- `token_diff.py`：不一致 0。
- `figma_audit.js` 掃動到的母版與設計稿：0。
- 頁高回歸：不變，或變化都有原因寫進 SYNC_LOG。
- 異動處同 viewport 並排截圖，存 `_design-loop/evidence/s5/<日期>/`：HTML 手冊示範＋Figma Guideline 母版一定要有；有頁面用到時再加 HTML 頁＋Figma 設計稿。
- 驗證讀屬性值與實際尺寸，不讀 description。

## 7. 紀錄

- `SYNC_LOG.md` 加一筆（範本格式）。
- `SYNC_PENDING.md`：這次處理掉的項目（含同步過程中 hook 新記的檔案）打勾或刪除。
- 手冊版本號與更新紀錄同步。

## 過關

SYNC_PENDING 清空、驗證全過、SYNC_LOG 有這筆。只改了一邊或兩邊，不能說完成。
