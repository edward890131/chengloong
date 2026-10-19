# S4 · 用 instance 重建設計稿

目標：每張 HTML 頁面在所屬的功能 page（`core/figma-pages.md`；舊格式專案是單一 `設計稿` page）都有一張「全部用元件 instance ＋ 變數」組成的設計稿，像素對得上擷取稿。擷取稿只是參考，不是設計稿。

**必讀：** `references/integer-rules.md`、`references/figma-gotchas.md`、`references/figma-instance-gotchas.md`。

## 規則

1. **容器**：每頁一個 frame，vertical auto-layout、寬固定＝viewport 寬、高 hug、底色綁 `surface/*`；先 `placeholder = true`，完成改 false。命名 `<畫面代碼> <頁名>`（舊格式 `NN <頁名>`），id 寫 `registry.pages[].design_node`；該功能還沒有 page 就先建並寫進 `manifest.figma.pages.design`。
2. **只用 instance**：Header、Footer、卡片、清單列、按鈕、篩選列一律 instance，不 detach；文字用 component property 覆寫。只有版面容器（區塊外框、網格）自己建 auto-layout，padding／gap 綁變數。
3. **網格**：用 auto-layout GRID（欄 FLEX、gap 綁 `layout/gutter`），不寫死欄寬；除不盡照 `manifest.integer_policy.grid_remainder`。
4. **內容**：文案與資料取自 HTML 用的資料來源；**欄位只放頁面上真的有的**，不自行補欄位。
5. **圖片**：從擷取稿複製 `imageHash`（`use_figma` 不能用 createImageAsync），不留空白框；需要新圖用 `upload_assets`。
6. **有狀態的區塊**（捲動釘住、輪播、展開）畫第一個狀態，frame 名稱或旁註寫明。
7. **對位**：每完成一個區塊，和擷取稿同一段截圖比對字級、間距、欄寬、圖片比例、顏色、斷行。差 >4px 或樣式不同就修；修不了寫進差異紀錄。
8. **畫面 chrome 與疊層**（APP 與固定 header／footer 的頁；實測 0.3.0）：整個畫面置中的樣板頁，Status bar／Home indicator 這類 chrome 設 ABSOLUTE、frame 主軸 CENTER，內容才和 HTML 1:1（body 夾在 chrome 之間置中會偏 11px）。長頁 frame 由 FIXED 改 AUTO 前先量內容高，用 AUTO＋minHeight（figma-instance-gotchas「結構性操作」）。ABSOLUTE 子層的疊層只看 children 順序：有遮罩或 dialog 的頁，Status bar／Home indicator 放最後兩個子層（`appendChild` 後重設 x／y），否則 chrome 會被遮罩染色。
9. **母版不夠用**：頁面 agent 不改母版。用最小的 instance 覆寫暫代，寫 `DS_GAPS.md`（元件、問題、暫代做法、建議修法、影響頁面）。

## 流程

1. 每頁列「區塊順序 → 元件」表，寫 `_design-loop/REBUILD_PLAN.md`，同時填 `registry.pages[].components`。
2. 頁面分給 agent（版型特殊的一組、列表類一組、內容頁一組）；各自只動自己的 frame。重建期間母版有異動要照 `core/parallel.md`「母版異動通報」。
3. 全部頁面完成 → DS 負責人處理 DS_GAPS（改母版，instance 跟著更新）→ 回頭把暫代做法換成乾淨 instance（步驟見 figma-instance-gotchas「換成乾淨 instance」；母版補上的效果和頁面暫代覆寫會疊加，改完母版立刻清頁面覆寫再量）。
4. 改母版前記錄所有頁高；改完重量，頁高變了要找出原因（常見：resize 把 FILL 變 FIXED、比例框高度變化、Grid 列塌掉）。
5. `figma_audit.js` 逐一掃這批動到的功能 page（舊格式：`設計稿` page），小數照 integer-rules 處理；回補過的頁面看 `overrideDrift`、`rootSizingDrift`、`staleOverrides`。

## 驗收

- 每頁 `placeholder = false`，`registry.pages[].height.design` 已填，和擷取稿頁高的差都有原因。
- 逐區段比 y 位置，不只比頁高：頁高 0 差可能是正負抵銷（實測 0.4.0，Web 案手機稿比例卡 ±5、Footer −7）。
- `figma_audit.js`：`decimals` 0（登記例外除外）、`unboundPaints` 0、`unstyledText` 0；`localText`（instance 外的散字）每一筆都是刻意的。
- `DS_GAPS.md` 每條 ✓ 已修，或使用者同意延後。
- 每頁每區段對位截圖存 `_design-loop/evidence/s4/`。

## 過站

首次建置：`manifest.stage` 改 `S5`（進入常駐同步），之後固定不變；新頁走 S6 循環。
