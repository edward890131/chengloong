# Figma MCP 實測踩坑：讀取、建構、腳本（補 figma-use 沒寫的）

figma-use 的規則（return、字型載入、setCurrentPageAsync、0–1 色值、分頁並行）照它做，這裡不重複。未標版本的是 0.1.0 實測。
**instance、變體、覆寫與結構性操作**（resize／clone／swap／切變體／resetOverrides 會重設什麼）在 `figma-instance-gotchas.md`（0.4.0 拆出）。

## 讀取來源（S0）

| 症狀 | 原因 | 對策 | 證據 |
|---|---|---|---|
| `get_metadata` 只看到一個 page | 不帶 nodeId 只回第一個 page | 先用 `use_figma` 讀 `figma.root.children` 列全部 page，再逐 page 帶 nodeId | APP 案 14 個 page 只回 1 個；實測 0.3.0 |
| 位置比對大量假超標 | metadata 把 Group 記成 `<frame name="Group …">`，但 Group 子層座標相對 Group 的上一層，累加會算兩次 | metadata 沒有型別可讀：`scripts/s0_compare.py` 用結構判斷（子層外框聯集等於自身外框即視為 Group，不累加自身位移），對不上時才退回名稱判斷 | APP 案兩頁 98 條假超標；實測 0.3.0 |
| 翻轉／旋轉節點差一個節點高 | metadata 的 x／y 是變形前原點 | 位置表超標但 HTML 看起來對時，改用同框位像素比對確認 | APP 案翻轉 icon；實測 0.3.0 |

## 四條原則（各併多條實測，0.3.0）

- **隱藏節點讀不到、也不重算。** 症狀：照 `get_design_context` 還原多出效果（隱藏 effect 照樣輸出）；批次綁色漏掉隱藏變體的子層；`findAll` 找不到巢狀 instance 內文字；父層改 padding 後隱藏子層位置不重算、audit 報小數；BOOLEAN 關掉的巢狀 instance 不在外層 instance 的 `children`；本地結構 clone 成母版時，隱藏文字層保留原本的 FIXED 寬高。對策：還原前用 `use_figma` 唯讀確認 effect 可見性；批次綁定、搜尋、位置計算、改巢狀 instance 前暫時顯示（BOOLEAN 暫開、改完關回，覆寫會保留）或設 `figma.skipInvisibleInstanceChildren = false`；建母版後逐層檢查 sizing，隱藏層也要；做完讀回。證據：APP 案 Button 96 個 icon 只綁到 8 個；Web 案 Filter Bar 隱藏籤、Area Detail 母版 246→404。實測 0.3.0／0.4.0。
- **綁上變數不等於畫面正確，綁完一定截圖。** 症狀與對策：① 文字或向量綁了變數、截圖是黑／深灰 → `setBoundVariableForPaint` 傳入的基底色被拿去渲染（刻度寫錯或變數是 alias），基底色填追到最終值的解析色；② `figma.union` 後子圖層 fill 沒綁 → 先 flatten 成單一 VECTOR 再綁（icon 內的小 RECTANGLE 方點 `figma_audit.js` 已列為例外，不必為了小數 flatten）；③ swap icon 後顏色不對（向量顏色覆寫會帶到新 icon，換入的 icon 保留自身綁定、不跟按鈕前景色）→ swap 前 `resetOverrides()`（對巢狀 icon 可清 strokes 覆寫且不解除父層 INSTANCE_SWAP），swap 後覆寫前景色。證據：APP 案 Status bar、Chip 11 變體、Loading 點陣。實測。
- **SVG 進出都要清理。** 匯出：`download_assets`（SVG／PNG）會連 section 底色一起輸出 → 改用 `use_figma` 唯讀 `node.exportAsync({format:'SVG_STRING'})`。匯入：`createNodeFromSvg` 會把 `<defs>` 內 clipPath rect 變成可見白色矩形、`<g transform=scale()>` 與事後 `rescale()` 不換算線寬與 dashPattern → 匯入前去掉 defs，先把 scale 乘進 path 與 stroke-width。證據：APP 案掃描光點像素差 13.88%→0.39%、三批 icon。實測。
- **腳本會整批回滾，寫成可重跑的小段。** 中途 throw 或 socket 中斷，前段已改的也還原 → 先唯讀確認現況，用 idempotent 小腳本整段重做。arrow callback 內寫 `await` 整段 SyntaxError（用 `for…of`）；迴圈內 await 覆寫巢狀向量色可能首次沒生效（讀回）。屬性有順序：`textAutoResize` → `textTruncation` → `maxLines`（設 `textTruncation='ENDING'` 會把 maxLines 重設成 1；對 instance 子圖層設 `textAutoResize` 會清掉 maxLines／truncation → 動過任一個都回讀另外兩個）；`isExposedInstance` 要在 instance 放進元件後才能設；absolute 子層等父層尺寸定了再設 y；`combineAsVariants` 前先 `setCurrentPageAsync` 到母版所在 page。切變體後 id 與文字會變，見 figma-instance-gotchas。先讀再改：挑別人母版變體前讀 `componentPropertyDefinitions`；text style id 依名稱從 `getLocalTextStylesAsync()` 查（id 結尾有逗號，手打的不報錯也不套用）。複製章節 frame 會把 demo 內母版複製成新元件，立刻清掉。證據：APP 案 Text field、Product card、變體組修改；Web 案卡片標題掉成 1 行（頁高少 25–216）、輪播卡標題 maxLines 被清、Footer 變體化失敗無殘留。實測 0.3.0／0.4.0。

## 版面與工作方式

- absolute 的 Header 疊在 KV 上：Header 放最後一個子層，或父層 `itemReverseZIndex = true`。卡片同列等高沒有自動做法：列高設為最高卡，卡片／body 覆寫 FILL 把底部推下去。Grid 列內 FILL/FILL 的卡片，母版改動觸發重排時高度可能塌掉 → 改母版前後都量頁高。
- 圖片：`use_figma` 不支援 createImageAsync；從擷取稿複製 `imageHash`，或用 `upload_assets`。
- 沒有子層的 auto-layout frame 不照 padding hug → 色條、尺規寬度直接 `setBoundVariable('width', var)`（不受變數 scope 限制）；`SPACE_BETWEEN` 下 `itemSpacing` 不作用（WRAP 時換行判斷也不計它，和 CSS column-gap 不同）→ 間距做成子層或子群組的內距（css-to-figma「flex-wrap」列）。APP 案間距章、輸入框；Web 案標題列 104→178；實測 0.3.0／0.4.0。
- `use_figma` 回傳超過約 20KB 會被截斷 → 精簡格式、分批（`figma_export_variables.js` 的做法），或只回傳計數＋前 N 筆。一次只做一小段；回傳所有 node id；做完 `node.screenshot()`。
- instance 常被改名（`XX/Icon/Caret Down` 放進元件後叫 `caret`）→ 依母版判斷時用 `getMainComponentAsync()`，不看圖層名稱。
- 刪除變數前先查 page 上有沒有直接綁定（可能全部經由樣式），查完再刪並記錄 id。
- 多 agent 分工的所有權、派工與母版異動通報見 `core/parallel.md`。
