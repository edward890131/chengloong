# 整數規則

**要求**：元件母版與設計稿不可有小數：寬高、x／y、padding、gap、min／max、圓角、字級、px 行高、px 字距。
**例外**：寫在 `manifest.integer_policy.exceptions`。預設只有 `{FP}/Icon/*` 內部向量，以及 icon 內寬高 ≤8 的 RECTANGLE 小方點（保留 SVG 精度；圖示框與擺放位置仍要整數；`figma_audit.js` 的 `exceptRectDots`，0.3.0）。

事後整數化很貴：實測 77 個元件從 1008 筆修到 0 筆，花掉一整輪。規則在 S3 建母版時就照做。

## 預防

1. **行高**：Figma 四捨五入到整數 px（變數與文字樣式都是），網頁維持比例，差 ≤0.5px。四捨五入後造成容器置中出 .5 時，可以再調 ±1 讓組合變偶數（例：行高 16.8 取 18 而不是 17，讓 8＋18＋8＝34），調整寫進樣式 description。
2. **字距**：一律 PERCENT，不用 px。
3. **奇偶置中的 .5**：容器高和內容高奇偶不同就會出 .5。修法依序：
   ① 文字框設 min-height（多 1px，字形位置不變）
   ② 1px 內距
   ③ min-width
   instance 改文字後奇偶可能又變，要重掃。
   常見情境（實測 0.3.0，APP 案）：
   - 置中外框包錯層：「FILL＋右 padding 1px」只包在要置中的那一層，不要加在放了 FILL 按鈕的父層（按鈕會 335→334）。
   - 全寬按鈕 label 是 HUG＋LEFT 時奇偶置中出 .5 → 頁面把 label 覆寫 FILL＋CENTER。
   - 兩個 FILL 兄弟按鈕不等寬（Outline 的框線算進版面，變 142／140）→ 嚴格等寬用固定寬，或關 `strokesIncludedInLayout`（css-to-figma）。
   - 隱藏子層報小數：父層改 padding 後不重算 → 暫時顯示再隱藏（figma-gotchas「隱藏節點」）。
4. **鎖比例圖框**：instance 內的比例框不能 resize，高度＝寬度 ÷ 比例，所以寬度要取倍數：16:9 → 16、3:2 → 3、4:3 → 4、8:9 → 8。用 `ratio_widths.py ratio` 找最近的合法寬度。
   欄寬不是倍數時（手機單欄 354）每張卡有 0.5–1.7px 取整差（4:3×354→266、16:9 只能 352、3:2 只能 353），單欄堆疊到第 4–5 張就超過 4px，還可能被頁尾其他差抵銷成頁高 0 差 → 驗收逐段比 y，不只比頁高；不調 gap 硬湊（實測 0.4.0，Web 案手機稿 5 頁 ±4.6–6.8）。
5. **網格餘數**：容器寬除不盡（1360 分 3 欄、gap 24 → 437.33）。擇一寫進 `manifest.integer_policy.grid_remainder`，全專案一致：
   - `last`：前面欄取整，餘數給最後一欄（例：72×7＋76）
   - `padding`：欄寬取整，餘數用列尾內距吸收（表格列實測可行；instance 內不能改欄寬時用這個）
   - `viewport`：選一個能整除的設計稿容器寬
   **狀態**：Web 實測專案還沒選定。第一個選定並驗過的專案，把結果升級回這裡。`ratio_widths.py grid` 會把三種算給你看。
6. **`resize()` 會把 FILL／HUG 改成 FIXED**：母版調尺寸後把 sizing 設回來，改完重量受影響頁高（實測：Figure 圖框被改成 FIXED，整個區塊塌 177px）。instance 的鎖比例框 resize 後寬高都 FIXED → 立刻 `layoutSizingVertical="HUG"`（實測 0.4.0，Web 案 Figure 352、Card 353）。
7. **Figma 取整後和網頁的差**（例：992 vs 992.3、40 vs 39.2）寫在元件 description，不去追。

## 驗收

- `figma_audit.js` 掃母版（S3）、設計稿（S4）、異動範圍（S5）→ `decimals.count` 0。
- 例外逐條列在 manifest；audit 輸出的 `exceptedVectors` 數量寫進紀錄。
