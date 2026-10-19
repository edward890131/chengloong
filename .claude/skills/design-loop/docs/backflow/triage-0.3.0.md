# LESSONS 回流分流表（design-loop 0.3.0 升級用）

2026-09-29。來源：APP 專案 `_design-loop/LESSONS.md` 共 88 條（#86–88 於寫入時補判）。

流程與判定定義見 `README.md`（四關：入口閘門 → 分流 → 去重泛化 → 標記回收）。


## 逐條分流

| # | 站 | 摘要 | 類型 | 判定 | 形態 | 去向 | 合併群組 |
|---|---|---|---|---|---|---|---|
| 1 | S0 | get_metadata 只列第一個 page | 機制 | 進 | gotcha | references/figma-gotchas 讀取 | G7 S0 對位 |
| 2 | S0 | 來源與 DS 同檔的唯讀守則 | 慣例 | 進 | 流程 | platforms/app.md S0＋core/s0 §B | G13 APP |
| 3 | 開案 | iOS／Android 不差異化分支 | 慣例 | 進 | 流程 | platforms/app.md 開案分支 | G13 APP |
| 4 | S0 | section 區分 key page／wireframe | 決策 | 留專案 | — | LESSONS 保留 | — |
| 5 | S0 | 行高 normal 混排差 3px | 機制 | 進 | 驗收 | core/s0 驗收＋css-to-figma 行高列 | G7 S0 對位 |
| 6 | S0 | maxDimension 不會放大 | 機制 | 進 | gotcha | references/capture-gotchas 量測 | G6 擷取 |
| 7 | S0 | s0_shoot／s0_compare 兩支工具 | 機制 | 進 | 腳本 | scripts/ 新增＋SKILL 腳本表 | G12 程式 |
| 8 | S0 | Group 座標會雙算 | 機制 | 進 | 腳本 | 寫進 s0_compare＋gotcha 一行 | G7／G12 |
| 9 | S0 | 旋轉節點 metadata 是變形前原點 | 機制 | 進 | gotcha | figma-gotchas 讀取 | G7 S0 對位 |
| 10 | S0 | download_assets 帶 section 底色 | 機制 | 進 | gotcha | figma-gotchas 素材匯出 | G4 SVG |
| 11 | S0 | 隱藏 effect 仍出現在 design context | 機制 | 進 | 合併 | 併入「隱藏節點」原則 | G2 隱藏節點 |
| 12 | S0 | stroke INSIDE 要扣 padding | 機制 | 進 | 對照表 | css-to-figma box-sizing 列 | G11 換算 |
| 13 | S1 | token_diff 不支援 DTCG 複合型 | 機制 | 進 | 程式 | scripts/token_diff.py | G12 程式 |
| 14 | S1 | mask 在 file:// 被 CORS 擋 | 機制 | 進 | gotcha | capture-gotchas 量測 | G6 擷取 |
| 15 | S2 | APP 擷取流程（實測可行） | 機制 | 進 | 流程 | platforms/app.md S2 拿掉待實測 | G13 APP |
| 16 | S2 | 擷取不支援 CSS mask | 機制 | 進 | 清單 | capture-gotchas 擷取不支援 | G6 擷取 |
| 17 | S3 | MCP 讀不到本機字型 | 機制 | 進 | 流程 | core/s3 §0 開工前檢查 | — |
| 18 | S3 | strokesIncludedInLayout 吃版面 | 機制 | 進 | 對照表 | css-to-figma＋integer-rules | G10／G11 |
| 19 | S3 | 母版 resize 後 instance 不跟 | 機制 | 進 | 合併 | 併入「結構性操作」表 | G1 結構性操作 |
| 20 | S3 | 空 auto-layout frame 不 hug | 機制 | 進 | gotcha | figma-gotchas 版面 | — |
| 21 | S3 | ↔ 在 Figma 變 emoji 圖示 | 決策 | 留專案 | — | 可選寫入手冊 ch13 例子 | — |
| 22 | S3 | opacity 綁變數是 0–100 刻度 | 機制 | 進 | 對照表 | css-to-figma | G3 綁色 |
| 23 | S3 | 文字 fill 渲染用基底色 | 機制 | 進 | 合併 | 併入「綁色與渲染」 | G3 綁色 |
| 24 | S4 | 腳本 throw 整批回滾 | 機制 | 進 | 合併 | 併入「腳本寫法」 | G5 腳本 |
| 25 | S4 | 置中 .5 外框要包對層 | 機制 | 進 | 整數規則 | integer-rules §3 | G10 整數 |
| 26 | S3 | 本案 236 變數分批匯出結果 | 決策 | 留專案 | — | 本案數據 | — |
| 27 | S2 | proto.js 依寬判斷 size mode | 決策 | 留專案 | — | 本案原型實作 | — |
| 28 | S1 | iframe 元素截圖空白 | 機制 | 進 | gotcha | capture-gotchas Playwright | G6 擷取 |
| 29 | S1 | S1 並行契約（檔案所有權） | 慣例 | 進 | 流程 | core/parallel.md 新檔 | G8 並行 |
| 30 | S0 | 長頁 sticky 不能 fullPage | 機制 | 進 | gotcha | capture-gotchas 量測 | G6 擷取 |
| 31 | S6 | subagent 不能寫報告檔 | 慣例 | 作廢 | — | 已證偽：改寫成「交付前先試寫一次，被擋才改回報訊息」 | G8 並行 |
| 32 | S2 | static 停動畫規則遺失 | 機制 | 進 | 驗收 | core/s2 對齊檢查項 | G6 擷取 |
| 33 | S2 | 漸層角標擷取成白塊 | 機制 | 進 | 清單 | capture-gotchas 擷取不支援 | G6 擷取 |
| 34 | S2 | 擷取把疊層順序畫錯 | 機制 | 進 | 清單 | capture-gotchas 擷取不支援 | G6 擷取 |
| 35 | S6 | :has 要限定直接子層 | 原則 | 進 | CSS 規則 | core/s1 CSS 規則備註 | — |
| 36 | S6 | 手冊 demo 外框寬度 | 原則 | 進 | 規範 | core/s1 手冊 demo | G14 手冊 |
| 37 | S6 | 偽元素底圈被堆疊情境蓋掉 | 決策 | 留專案 | — | 本案元件實作 | — |
| 38 | S6 | partial 串接順序決定權重 | 機制 | 進 | 流程 | core/parallel.md CSS 分檔 | G8 並行 |
| 39 | S6 | pre-line 會顯示原始碼換行 | 決策 | 留專案 | — | 本案元件實作 | — |
| 40 | S6 | HTML 與母版可並行 | 慣例 | 進 | 流程 | core/parallel.md 分層 | G8 並行 |
| 41 | S3 | 先設 AUTO 再 resize 會變 FIXED | 機制 | 進 | 合併 | 併入「結構性操作」表 | G1 結構性操作 |
| 42 | S3 | isExposedInstance 開放內層屬性 | 機制 | 進 | 對照表 | css-to-figma 元件組合 | G11 換算 |
| 43 | S3 | alias 基底色渲染成深灰 | 機制 | 進 | 合併 | 併入「綁色與渲染」 | G3 綁色 |
| 44 | S3 | createNodeFromSvg 的 defs 與 scale | 機制 | 進 | 合併 | 併入「SVG 匯入」 | G4 SVG |
| 45 | S3 | union 後 fill 未綁變數 | 機制 | 進 | 合併 | 併入「綁色與渲染」 | G3 綁色 |
| 46 | S3 | 文字截斷三個屬性的順序 | 機制 | 進 | 合併 | 併入「腳本寫法」 | G5 腳本 |
| 47 | S3 | arrow callback 內 await 整段失敗 | 機制 | 進 | 合併 | 併入「腳本寫法」 | G5 腳本 |
| 48 | S3 | 隱藏子層不重算位置（報小數） | 機制 | 進 | 合併 | 併入「隱藏節點」＋integer-rules | G2 隱藏節點 |
| 49 | S3 | createAutoLayout 預設裁切內容 | 機制 | 進 | 合併 | 併入「建立節點的預設值」 | G1 結構性操作 |
| 50 | S3 | 先讀 componentPropertyDefinitions | 原則 | 進 | 合併 | 併入「腳本寫法」 | G5 腳本 |
| 51 | S3 | 三人並行建母版的實績 | 慣例 | 進 | 流程 | core/parallel.md＋s3 §5 | G8 並行 |
| 52 | S3 | 隱藏 instance 讀不到子層 | 機制 | 進 | 合併 | 併入「隱藏節點」 | G2 隱藏節點 |
| 53 | S3 | clone 變體掉子層綁定 | 機制 | 進 | 合併 | 併入「結構性操作」表 | G1 結構性操作 |
| 54 | S7 | PingFang 字寬瀏覽器比 Figma 寬 | 機制 | 進 | 驗收 | capture-gotchas 字寬段＋s7 R2 判定 | G6／G9 |
| 55 | S4 | resetOverrides 連名稱尺寸都重設 | 機制 | 進 | 合併 | 併入「結構性操作」表 | G1 結構性操作 |
| 56 | S4 | text style id 結尾有逗號 | 機制 | 進 | 合併 | 併入「腳本寫法」 | G5 腳本 |
| 57 | S4 | 顏色覆寫會跟著 swap 走 | 機制 | 進 | 合併 | 併入「綁色與渲染」 | G3 綁色 |
| 58 | S4 | createAutoLayout 預設白底 | 機制 | 進 | 合併 | 併入「建立節點的預設值」 | G1 結構性操作 |
| 59 | S4 | 母版在重建期間被改動 | 慣例 | 進 | 流程 | core/parallel.md 母版異動通報 | G8 並行 |
| 60 | S4 | 覆寫值≠母版值要掃描 | 機制 | 進 | 程式 | figma_audit 新增 overrideDrift＋s7 R3 | G12／G9 |
| 61 | S4 | swap 後 icon 圖層名變母版名 | 機制 | 進 | 合併 | 併入「結構性操作」表 | G1 結構性操作 |
| 62 | S7 | R2 要逐區段比 x 片段 | 原則 | 進 | 方法 | core/s7-review R2 | G9 復盤 |
| 63 | S5 | 兩個 FILL 兄弟不一定等寬 | 機制 | 進 | 整數規則 | integer-rules | G10 整數 |
| 64 | S5 | 複製獨立母版保留屬性 key | 機制 | 進 | 合併 | 併入「結構性操作」表 | G1 結構性操作 |
| 65 | S5 | icon 端點 square 對 butt | 機制 | 進 | 對照表 | css-to-figma icon 列 | G11 換算 |
| 66 | S5 | RECTANGLE 方點被算小數 | 機制 | 進 | 程式 | figma_audit 例外＋gotcha | G12 程式 |
| 67 | S5 | 品牌色比例用渲染量測 | 原則 | 進 | 規範 | core/s1 插畫規格 | G14 手冊 |
| 68 | S7 | socket 中斷整批回滾 | 機制 | 進 | 合併 | 併入「腳本寫法」 | G5 腳本 |
| 69 | S7 | findAll 找不到隱藏內文字 | 機制 | 進 | 合併 | 併入「隱藏節點」 | G2 隱藏節點 |
| 70 | S7 | R4 高嚴重度要讀回確認 | 原則 | 進 | 方法 | core/s7-review R4 | G9 復盤 |
| 71 | S7 | R5 對比取樣點要落在文字上 | 原則 | 進 | 方法 | core/s7-review R5 | G9 復盤 |
| 72 | S7 | R5 重疊與觸控判定 | 原則 | 進 | 方法 | core/s7-review R5 | G9 復盤 |
| 73 | S7 | FIXED 改 AUTO 前先量內容高 | 機制 | 進 | 合併 | 「結構性操作」＋s4 長頁 frame | G1 結構性操作 |
| 74 | S6 | subagent 讀不到 MCP resource | 機制 | 進 | 流程 | core/parallel.md 派工前置 | G8 並行 |
| 75 | S6 | scratchpad 檔名互相覆寫 | 機制 | 進 | 流程 | core/parallel.md 派工前置 | G8 並行 |
| 76 | S6 | tokens_build 碎片互撞不報錯 | 機制 | 進 | 程式 | scripts/tokens_build 檢查 | G12 程式 |
| 77 | S2 | 擷取把 Semibold 寫成 Semi Bold | 機制 | 進 | gotcha | capture-gotchas 擷取後處理 | G6 擷取 |
| 78 | S2 | 擷取已知差異四則 | 機制 | 進 | 清單 | capture-gotchas 擷取不支援 | G6 擷取 |
| 79 | S2 | 多分頁同時擷取與對回頁面 | 機制 | 進 | 流程 | platforms/app.md S2＋capture 流程 | G13／G6 |
| 80 | S2 | 數字半形空格加大字寬差 | 機制 | 進 | 合併 | 併入第 54 條字寬段 | G6 擷取 |
| 81 | S4 | FILL 按鈕 label 要改 FILL 置中 | 機制 | 進 | 整數規則 | integer-rules | G10 整數 |
| 82 | S4 | 整頁置中樣板的 chrome 要 ABSOLUTE | 機制 | 進 | 流程 | core/s4-rebuild 樣板對位 | — |
| 83 | S3 | 負偏移子層不能改 auto-layout | 機制 | 進 | 合併 | 併入「結構性操作」表 | G1 結構性操作 |
| 84 | S3 | TEXT 屬性是整組共用 | 機制 | 進 | 合併 | 「腳本寫法」＋「結構性操作」 | G5／G1 |
| 85 | S3 | SPACE_BETWEEN 下 itemSpacing 失效等三則 | 機制 | 進 | 合併 | 「腳本寫法」＋版面 gotcha | G5 腳本 |
| 86 | S5 | 切變體後巢狀子層 id 會換 | 機制 | 進 | 合併 | 併入「腳本寫法」 | G5 腳本 |
| 87 | S4 | 遮罩頁 chrome 要放最後兩個子層 | 機制 | 進 | 流程 | core/s4-rebuild 規則 8 | — |
| 88 | S5 | 未公開巢狀 instance 仍可切變體 | 機制 | 進 | 對照表 | figma-gotchas instance 表 | — |

## 合併群組（去重後母檔真正新增的內容）

| 群組 | 併入後長什麼樣 |
|---|---|
| G1 結構性操作 | resize／clone／convert／resetOverrides／swap／建立節點的預設值會重設 sizing、綁定、名稱、位置：一張「操作 → 被重設的東西 → 對策」表＋「改前讀回、改後讀回」原則（11 條併成 1） |
| G2 隱藏節點 | 隱藏節點讀不到也不重算：批次綁定、搜尋、位置計算前先顯示或關掉 skipInvisibleInstanceChildren（4 條併成 1） |
| G3 綁色與渲染 | 綁變數不等於畫面正確：基底色要用解析值、向量先 flatten、覆寫會跟著 swap（5 條併成 1） |
| G4 SVG 匯入 | defs、transform scale、線寬與端點的處理（3 條併成 1） |
| G5 腳本寫法 | 整批回滾、await 位置、屬性設定順序、先讀定義再改（9 條併成 1） |
| G6 擷取 | 擷取流程、不支援清單、量測與截圖、字寬差（15 條併成 4 段） |
| G7 S0 對位 | 讀取來源的四個陷阱（5 條併成 1） |
| G8 並行 | 新檔 core/parallel.md：分層、契約、旗標、派工前置、母版異動通報（9 條併成 1 份文件） |
| G9 復盤 | R2／R3／R4／R5 的判定方法補強（6 條併進 s7-review） |
| G10 整數 | 置中 .5 的四種情境（5 條併進 integer-rules） |
| G11 換算 | css-to-figma 表格新增或補註 6 列 |
| G12 程式 | 能自動檢查的改成程式：s0 兩支工具、token_diff 複合型、figma_audit 兩條規則、tokens_build 撞名（6 條變 5 個程式改動） |
| G13 APP | platforms/app.md 從 experimental 升 stable（4 條） |
| G14 手冊 | 手冊撰寫規範兩則 |

## 統計

- 類型分布（0.4.0 起的入口閘門）：機制 67、原則 8、慣例 7、決策 6。
- 總條目 88：進母檔 81、留專案 6、作廢 1
- 其中 28 條併進既有原則（不新增條目），6 條改成程式或腳本
- 母檔實際新增：references 約 12 條、core 方法補強 8 處、新檔 core/parallel.md 1 份、程式改動 5 項、platforms/app.md 升 stable

## 寫入原則

見 `README.md` 第三、四關。
