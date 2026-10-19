# S7 · 五視角復盤

每一批設計稿（S4 或 S6 產出）完成後跑五輪。**每輪一個固定視角、順序固定**；每輪「查 → 修 → 記」完成才進下一輪。

**範圍**：這一批完成的頁面。批次裡有區塊還在走 S6（新元件還沒進母版），整批等 S6 完成才開始，不拿本地暫代圖層復盤。

| 輪 | 視角 | 怎麼查 | 通過條件 |
|---|---|---|---|
| R1 | 規範合規 | 新增 CSS 的寫死值 grep（「新增」＝和 S6 §0 記下的 commit 或備份比；新頁自己的 CSS 檔整支都算新增；grep 式同 S1）；`figma_audit.js` 的 `unboundPaints`／`unstyledText`；頁面用到的區塊層 class 都在 registry | 全部 0 |
| R2 | 像素對位 | 全頁文字位置自動比（`r2_texts_web.cjs`＋`r2_texts_figma.js`→`r2_text_match.py`），再對列出的問題看 HTML 與 Figma 同 viewport 逐區段截圖並排 | 位置差 ≤4px、斷行一致、圖片比例一致 |
| R3 | 結構與整數 | `figma_audit.js` 的 `decimals`／`localText`／`overrideDrift`／`rootSizingDrift`／`staleOverrides`；instance 覆寫數量；FILL／FIXED 是否符合意圖；頁高 | 小數 0；每個本地文字與覆寫都說得出理由（寫在發現表） |
| R4 | 視覺層級與品質 | **由沒參與製作的 agent 做**：和 `manifest.benchmarks` 並排；量字級層級有沒有斷層（例：72 直接跳 20，缺區塊標題層）、RWD 字級標準（標題 Mobile 值大於 Desktop、閱讀型文字手機 <14px → 列「高」；s1「RWD 字級標準」）、區塊節奏是否用 section token、密度、`manifest.forbidden` 禁用項 | 差距清單（高／中／低）的「高」全部修掉 |
| R5 | 邊界 | 標題改成 2 倍長、資料 0 筆／1 筆／大量、Dark mode（有開的話）、觸控區、對比度（影像上的文字用 `contrast_on_image.py`）。HTML 測 `manifest.viewports` 每一個；Figma 只測有設計稿 frame 的 viewport | 不破版、不裁字、對比合格 |

## 規則

- **沒找到問題不能只寫「無」**：寫查了哪些項目、用什麼方法、證據檔路徑。每一條發現都寫依據（手冊章節或 benchmark），這就是「比對 Guideline」。
- **沒通過**：修完同一輪重查，直到通過；同一輪第 3 次還沒過，停下來回報使用者。
- 嚴重度：高＝本輪一定修；中＝本輪修得完就修，修不完寫進待辦並回報；低＝記錄。
- 任何一輪改了 Figma，就重跑 R1 與 R3 的機器檢查（便宜的回歸）。
- R4 審查 agent 只拿：截圖、benchmarks、手冊、forbidden 清單；不給製作過程，避免替自己的決定辯護。benchmarks 或 forbidden 是空的：先請使用者補；補不了就用手冊「設計原則」章＋已上線頁面當基準，並在紀錄註明。
- **HTML 和 Figma 對不上時，先判斷哪一邊是新的意圖，再決定修哪一邊**（R2、R3 都適用）：不一致可能是 Figma 做錯，也可能是設計師直接改了正式稿。SYNC_LOG 解釋不了的不一致，列給設計師確認後才修；確認是刻意改的，照 S5 同步回 HTML（`core/figma-pages.md` §5「設計師直接改了正式稿」）。不要直接把 Figma 改回 HTML。
- 修改碰到三邊任何一邊 → 同時照 S5 記錄。
- 復盤中需要新 token／元件 → 走 S6 判斷樹，不在復盤中偷加。
- 證據存 `_design-loop/evidence/s7/<日期>/R<n>/`。
- S7 不改 `manifest.stage`。

## 各輪判定細則（實測 0.3.0 APP 案；0.4.0 Web 案補）

- **R2 全頁文字自動比（0.4.0）**：兩邊都取文字去空白、轉大寫的前 12 字配對，網站取行框頂、Figma 取文字框頂，列出 dy＞4 與行數不同；**一律加 `--check-x`**（下一條「逐區段比 x」的要求，預設不比 x）；網站量測用設計稿同寬 viewport（手機加 `--mobile`），不捲動。**圖片位置與比例還沒自動化**（Web 案原始腳本有，尚未移植），仍照並排截圖逐區段看。誤報用並排截圖排除，不修：標籤／混字級欄標（行框 vs 文字框）、捲過的 scroll-spy 列、min-height 標題框（行數算成 2）；Figma 拆段的文字配不到是正常的。Web 案 9 頁一次跑完，逐區段截圖只看列出的點。
- **R2 逐區段比 x 片段**：只比文字行右緣會漏掉矮元件列（例：32px 高的工具列）的水平位移；每個區段比每一個子元素的 x 起訖。
- **R2 斷行不一致先分原因**：接近滿寬或貼齊內容寬的文字、夾半形空格的數字，兩邊字寬不同（方向依字型，capture-gotchas「字寬」），這類不算重建錯誤 → 改短文案、母版文字框改 FILL，或在發現表註明；其他斷行差照常修。
- **R3 掃覆寫漂移**：頁面回補（換 icon、resetOverrides）後，巢狀 auto-layout 的對齊、間距、padding 可能被寫成和母版不同的覆寫值，像素比對只看區塊位置抓不到。跑 `figma_audit.js` 的 `overrideDrift`，每一筆都要說得出理由。另兩類畫面看不出來的（0.4.0，Web 案手動找到）：clone／resize 過的 instance 根層停在 FIXED、母版是 HUG／FILL（`rootSizingDrift`）；切變體後巢狀圖示殘留和母版同值的 strokes 覆寫，母版改色時不跟（`staleOverrides`，對該巢狀 instance `resetOverrides()`）。
- **R4 高嚴重度先讀回**：只看截圖容易誤判（照片背景上的白字被判成深字）。高嚴重度進修正前，以 HTML computed style 或 Figma 母版變體讀回確認。字級、行高類的發現要附「用哪個選擇器量到」：全頁掃描會掃到 `display:none` 的後備節點與同名不同角色的元素（Web 案推翻兩條：量到的是無 JS 後備清單）。
- **R5 對比取樣**：取樣點落在文字節點的 Range rect 上，不用元素左上角加偏移（會取到旁邊的圖形）。影像上的文字（0.4.0 修正）：同畫面截兩次，一次把該文字設 `color: transparent`，`contrast_on_image.py` 相減得到字的像素，字取中位亮度、底色取無字那張的 95 百分位（最壞）；無字的底沒有抗鋸齒污染，所以可以用最壞分位。0.3.0「底色用中位數」只在無法拍無字那張時退回使用，並註明會高估。token 標稱對比是對純色底算的，不能代表影像上的實際值（Web 案標稱 4.65，實際 1.97–2.80）。
- **R5 重疊與觸控**：重疊用 `getClientRects()` 逐行比，不用外接框（inline 連結跨行會誤報）；不可點的元素（唯讀 tag 類）排除在觸控區檢查外。有效點擊區＝元素框與 `::before` 外擴後的聯集，只在 inset 為負時才算外擴（`::before` 也可能是 1px 底線；Web 案第一版每頁誤報 24 筆）。

## REVIEW_LOG 格式

見 `templates/project/REVIEW_LOG.md`（開案時已複製到專案）。
