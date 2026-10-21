# LESSONS 回流分流表（design-loop 0.4.0 升級用）

2026-09-29。來源：Web 案（品牌官網）`_design-loop/LESSONS.md` 共 64 列；本次處理其中 57 列 `待升級`（2026-09-15～17）。# 1–4 已升級 v0.1.0，# 12、28、38 已標只適用本案，不在本表。

流程與判定定義見 `README.md`。這是第二個專案：和 0.3.0（APP 案）同一件事的判「進」、補第二案證據到既有規則，不新增條目；只有 Web 案一案的判「待觀察」。例外：Web 手機設計稿做法（G-W）依使用者指示，以本案實測寫進 `platforms/web.md`（web 平台該段原本就標「尚未實測」，單一實測案即可轉為實測做法）。

## 逐條分流

| # | 站 | 摘要 | 類型 | 判定 | 形態 | 去向 | 合併群組 |
|---|---|---|---|---|---|---|---|
| 5 | S5 | 手機母版 Device 變體＋變體上切 Mobile mode | 慣例 | 進 | 流程 | platforms/web.md S3「手機母版」 | G-W |
| 6 | S5 | clone 變體掉 refs（TEXT／BOOLEAN），補 characters 會打回樣式 | 機制 | 進 | 補證據 | figma-instance-gotchas「clone 變體」列 | G1 |
| 7 | S5 | 同一次 setProperties 換 variant＋設文字，文字被重設 | 機制 | 進 | 補證據 | figma-instance-gotchas 新列「切變體」（併 0.3.0 #86 id 會換） | G1 |
| 8 | S5 | combineAsVariants 要先切到母版 page；失敗整批回滾 | 機制 | 進 | 補證據 | figma-gotchas「腳本會整批回滾」 | G5 |
| 9 | S5 | 橫改直變體遺留 SPACE_BETWEEN／FIXED；WRAP 塌高 | 機制 | 進 | 補證據 | figma-instance-gotchas 新列「改 layoutMode」（0.3.0「改 auto-layout 前後讀回」原則） | G1 |
| 10 | S5 | Responsive 文字樣式在 Mobile 變成別的角色 | 原則 | 進 | 流程 | platforms/web.md「三項齊比」 | G-W |
| 11 | S5 | set 非 auto-layout 不撐開；Figma 字寬比瀏覽器寬 | 機制 | 進（字寬部分） | 推翻 | capture-gotchas「字寬」改成方向依字型；s3 §4 文字 FILL；set 外框部分併入 #35 待觀察 | G6 |
| 13 | S5 | pointer:coarse 加尺寸，手機母版用 isMobile＋hasTouch 值 | 機制 | 進 | 流程 | platforms/web.md＋css-to-figma pointer 列 | G-W |
| 14 | S5 | 同 TEXT 屬性跨變體，樣式互相回寫 | 機制 | 進 | 補證據 | figma-instance-gotchas「動已綁 TEXT 屬性」列（0.3.0 #84） | G1 |
| 15 | S4 | Web 手機設計稿做法（390 frame、切 mode、clone 本地子框） | 慣例 | 進 | 流程 | platforms/web.md S4 Mobile | G-W |
| 16 | S4 | 比例卡取整差累積、頁高抵銷 → 逐段比 y | 機制 | 進 | 整數規則＋驗收 | integer-rules §4、s4 驗收、web.md | G-W |
| 17 | S4 | text-wrap:balance 用 U+2028；regex 字面值語法錯 | 機制 | 待觀察 | — | 單一案例 | G-O1 |
| 18 | S4 | inset 分隔線要關 strokesIncludedInLayout | 機制 | 進 | 補證據 | css-to-figma inset 列＋border-box 列（0.3.0） | G11 |
| 19 | S4 | upload_assets 上傳 webp 渲染空白 | 機制 | 待觀察 | — | 單一案例（工具行為可能變動） | — |
| 20 | S4 | HUG 區塊內 STRETCH 的 absolute 背景被撐高 | 機制 | 待觀察 | — | 單一案例 | — |
| 21 | S4 | 母版文字 auto-width 不換行；instance 子層可覆寫 FILL | 機制 | 進 | 補證據 | figma-instance-gotchas instance 表、s3 §4 規則 3 | G1 |
| 22 | S4 | WRAP＋SPACE_BETWEEN 換行不計 itemSpacing | 機制 | 進 | 補證據 | figma-gotchas 版面（0.3.0 SPACE_BETWEEN 列） | G11 |
| 23 | S4 | instance 比例框 resize 後寬高都 FIXED | 機制 | 進 | 補證據 | integer-rules §6、figma-instance-gotchas resize 列 | G1 |
| 24 | S4 | cover＋object-position 算 CROP imageTransform | 機制 | 待觀察 | — | 單一案例；建議程式化（由原圖尺寸、框尺寸、position 算 transform） | — |
| 25 | 量測 | isMobile 下 fullPage 改變 vh → 分段截圖 | 機制 | 進 | 補證據 | capture-gotchas「長頁不用 fullPage」（0.3.0 sticky 長頁） | G6 |
| 26 | 量測 | get_screenshot 最多 1x | 機制 | 進 | 補證據 | capture-gotchas 1x（0.3.0） | G6 |
| 27 | 量測 | scroll-spy 第一狀態要重新載入再量 | 機制 | 待觀察 | — | 單一案例；r2_texts_web 已預設不捲動 | G-O2 |
| 29 | S5 | 外層 TEXT 不能綁巢狀文字 → exposedInstances | 機制 | 進 | 補證據 | figma-instance-gotchas instance 表（0.3.0 #42） | G1 |
| 30 | S5 | 換成乾淨 instance 的步驟；resetOverrides 清 exposed 與 fill | 機制 | 進 | 補證據＋流程 | figma-instance-gotchas resetOverrides 列＋「換成乾淨 instance」；s4 流程 3 | G1 |
| 31 | S5 | BOOLEAN 關掉的巢狀 instance 不在 children | 機制 | 進 | 補證據 | figma-gotchas「隱藏節點」原則 | G2 |
| 32 | S5 | 母版加 spacer 後和頁面覆寫疊加 | 機制 | 進 | 補證據 | core/parallel.md §5（0.3.0 母版異動通報）、s4 流程 3 | G8 |
| 33 | S5 | 行高 em 段距綁 line-height 變數；em 間距各 mode 寫死 | 機制 | 進 | 對照表 | css-to-figma em 列＋新列 | G-W |
| 34 | S5 | 單頁 class 覆寫不代表元件有手機尺寸 | 原則 | 進 | 流程 | platforms/web.md 手機母版 | G-W |
| 35 | S5 | set 長大被上層 frame 裁掉，render bounds 0 | 機制 | 待觀察 | — | 單一案例（併 #11 set 外框部分） | G-O3 |
| 36 | S5 | flex-wrap＋space-between＋column-gap 的 Figma 做法 | 機制 | 進 | 對照表 | css-to-figma 新列（0.3.0 SPACE_BETWEEN 間距同根） | G11 |
| 37 | S5 | 本地結構 clone 成母版，隱藏文字層保留 FIXED | 機制 | 進 | 補證據 | figma-gotchas「隱藏節點」原則 | G2 |
| 39 | S7 | R2 全頁文字位置自動比對 | 原則 | 進 | 程式 | 新增 r2_texts_web.cjs、r2_texts_figma.js、r2_text_match.py；s7 R2（0.3.0 R2 逐區段比）。複核（主控）：用 Web 案原始量測資料第 01 頁重跑，文字配對 147／147、23 筆文字問題與原腳本逐筆相同；原腳本另有 2 筆圖片比對未移植 → s7 註明圖片仍看截圖、跑時加 `--check-x` | G12 |
| 40 | S7 | 分段截圖前 sticky 改 relative、隱藏 fixed | 機制 | 進 | 補證據 | capture-gotchas「長頁不用 fullPage」 | G6 |
| 41 | S7 | 切變體後巢狀圖示殘留同值 strokes 覆寫 | 機制 | 進 | 程式 | figma_audit 新增 `staleOverrides`；s7 R3（0.3.0 swap 前 resetOverrides） | G12 |
| 42 | S7 | clone／resize 過的 instance 根層停在 FIXED | 機制 | 進 | 程式＋推翻 | figma_audit 新增 `rootSizingDrift`（0.3.0 overrideDrift 刻意不比根層，改為另列一類） | G12 |
| 43 | S7 | registry css 要含頁面別名，R1 用 DOM class 反查 | 原則 | 待觀察 | — | 單一案例；建議程式化（DOM 區塊 class ↔ registry 覆蓋率） | — |
| 44 | S7 | textTruncation ENDING 會把 maxLines 重設成 1 | 機制 | 進 | 補證據 | figma-gotchas 腳本屬性順序（0.3.0 #46） | G5 |
| 45 | S7 | 影像上的文字對比：兩次截圖相減、底取 95 百分位 | 原則 | 進 | 程式＋推翻 | 新增 contrast_on_image.py；s7 R5 對比改寫（0.3.0 寫「底色用中位數」） | G9 |
| 46 | S7 | 全出血影像暗場畫在內容盒 | 原則 | 待觀察 | — | 單一案例 | — |
| 47 | S7 | 點擊區＝元素框與 ::before 外擴聯集，只算負 inset | 機制 | 進 | 補證據 | s7 R5 重疊與觸控（0.3.0 #72） | G9 |
| 48 | S7 | ::before 外擴用 % 算的是 padding box | 機制 | 待觀察 | — | 單一案例 | G-O4 |
| 49 | S7 | 測資料 0／1 筆不能用 hidden | 機制 | 待觀察 | — | 單一案例 | — |
| 50 | S5 | 改變數前查「變數 → 文字樣式 → 元件」 | 原則 | 待觀察 | — | 單一案例；建議程式化（列出綁某變數的文字樣式與用到的母版） | G-O5 |
| 51 | S4／S5 | 看似換行的欄標其實是兩個 frame | 原則 | 待觀察 | — | 單一案例（併 #17 Figma 模擬斷行） | G-O1 |
| 52 | S7 | ::before／::after 都占用時用 padding＋負 margin | 機制 | 待觀察 | — | 單一案例 | G-O4 |
| 53 | S7 | R4 發現要複量、附選擇器 | 原則 | 進 | 補證據 | s7 R4 讀回（0.3.0 #70） | G9 |
| 54 | S5 | clone 後同段寫 TEXT 屬性要先載字型 | 機制 | 進 | 補證據 | figma-instance-gotchas clone 列（figma-use 字型載入＋0.3.0 回滾） | G1 |
| 55 | S5 | instance 整組覆寫 fills 洗掉底色綁定 | 機制 | 待觀察 | — | 單一案例；`figma_audit` 的 unboundPaints 已抓得到 | — |
| 56 | S5／S7 | instance 對齊被改成 MIN 的過時覆寫 | 機制 | 進 | 補證據 | figma-instance-gotchas「覆寫會停在舊值」、s7 R3（0.3.0 overrideDrift） | G12 |
| 57 | S5 | 改 Responsive 變數後 instance 高度停在舊值 | 機制 | 待觀察 | — | 單一案例；高價值，下一案優先確認 | G-O5 |
| 58 | S5 | 換文字樣式不連動 minHeight | 機制 | 待觀察 | — | 單一案例 | — |
| 59 | S5 | 「網站沒有」要用互動後狀態驗證 | 原則 | 待觀察 | — | 單一案例 | — |
| 60 | S5 | 換文字樣式會立即傳播（修正 #57 適用範圍） | 機制 | 待觀察 | — | 單一案例，和 #57 一起等第二案 | G-O5 |
| 61 | S5 | instance 子層設 textAutoResize 會清 maxLines／truncation | 機制 | 進 | 補證據 | figma-gotchas 腳本屬性順序（0.3.0 #46） | G5 |
| 62 | S5 | instance 子層尺寸三條路都失敗 → 根層 minHeight | 機制 | 進 | 補證據 | figma-instance-gotchas instance 表（0.3.0 instance 子層 resize 不生效） | G1 |
| 63 | S5／量測 | 列表型內容頁設計稿記帶 id 的網址 | 慣例 | 待觀察 | — | 單一案例 | — |
| 64 | S5 | Responsive 樣式挑選要字級、行高、字距三項齊比 | 原則 | 進 | 流程 | platforms/web.md 手機母版 | G-W |

## 合併群組

| 群組 | 併入後長什麼樣 |
|---|---|
| G1 結構性操作與 instance | 0.3.0 表補第二案證據；新增「改 layoutMode」「切變體」兩列；clone、resetOverrides、TEXT 屬性列擴寫；instance 表補 FILL 可覆寫、根層 minHeight、exposedInstances；新增「換成乾淨 instance」步驟。整段移到新檔 `figma-instance-gotchas.md`（12 條） |
| G2 隱藏節點 | 原則補 BOOLEAN 關掉的巢狀 instance、clone 保留隱藏層 FIXED（2 條） |
| G5 腳本寫法 | 屬性順序補「truncation 重設 maxLines、textAutoResize 清 truncation」；combineAsVariants 先切 page（3 條） |
| G6 擷取與量測 | 1x、長頁不用 fullPage 補 Web 手機分段截圖；字寬段改成方向依字型（4 條） |
| G8 並行 | 母版異動通報補單一 agent 也會疊加（1 條） |
| G9 復盤 | R4 附選擇器複量；R5 對比改兩張相減＋最壞分位；R5 點擊區聯集（3 條） |
| G11 換算 | css-to-figma：inset 分隔線、flex-wrap 新列、strokesIncludedInLayout 補證據（3 條） |
| G12 程式 | R2 自動比對三支腳本；figma_audit 新增 `rootSizingDrift`、`staleOverrides`；overrideDrift 補實證（4 條） |
| G-W Web 手機稿 | platforms/web.md S3「手機母版」＋S4「Mobile 設計稿」「Mobile 對位」；css-to-figma em、pointer 列；integer-rules §4（8 條） |
| G-O1～O5 待觀察 | Figma 模擬斷行（#17、#51）；scroll-spy 狀態（#27）；set 外框（#11 部分、#35）；::before 外擴技法（#48、#52）；變數改動的傳播（#50、#57、#60） |

## 推翻或修改既有規則

| 既有規則（版本） | 改成 | 依據 |
|---|---|---|
| capture-gotchas「中文字寬：瀏覽器比 Figma 寬」（0.3.0） | 「字寬：瀏覽器和 Figma 不一致，方向依字型」；對策加「母版文字框不貼齊內容寬」 | #11：Web 案品牌字型 Figma 較寬 |
| s7 R5「影像上的文字估背景色用中位數，最壞分位會被抗鋸齒污染」（0.3.0） | 預設拍有字／無字兩張相減，底色取無字那張的 95 百分位；中位數只在拍不到無字那張時退回 | #45：無字底沒有抗鋸齒污染；中位數高估（標稱 4.65，實際 1.97–2.80） |
| figma_audit `overrideDrift` 不比 instance 根層 sizing（0.3.0） | 維持不列入 overrideDrift，另列 `rootSizingDrift`：只抓「instance FIXED、母版 HUG／FILL」 | #42：clone／resize 過的根層停在 FIXED，畫面一樣 |

## 統計

- 類型分布（0.4.0 起的入口閘門）：機制 43、原則 11、慣例 3、決策 0。
- 本次 57 條：進 38、待觀察 19、留專案 0、作廢 0。
- 進的 38 條中：30 條是和 0.3.0 同一件事、補第二案證據（其中 3 條推翻或修改既有規則），8 條是 Web 手機稿做法（G-W）。
- 程式：新增 4 支（`r2_texts_web.cjs`、`r2_texts_figma.js`、`r2_text_match.py`、`contrast_on_image.py`），`figma_audit.js` 新增 2 類掃描。
- 建議程式化（待觀察中）：#24 cover 裁切 transform 計算、#43 registry class 覆蓋率、#50 變數 → 文字樣式 → 母版影響清單。
- references 行數上限：`figma-gotchas.md` 已滿 60 行，拆成 `figma-gotchas.md`（讀取、建構、腳本）與 `figma-instance-gotchas.md`（instance、變體、覆寫、結構性操作）。

## 測試

- `r2_text_match.py`：用 Web 案 R2 原始量測（9 頁）轉格式重跑，配對數與原專案腳本 9 頁全同；問題數 8 頁相同，1 頁少 6 筆（原腳本另判 dx，新腳本預設不判，`--check-x` 開啟）。
- `r2_texts_web.cjs`：本機伺服 Web 案一頁、390＋`--mobile` 量測，和當時的量測在網站未改動的區段 x／y 完全一致；sr-only 與 skip link 已排除。
- `r2_texts_figma.js`、`figma_audit.js` 新增段：以模擬節點樹執行通過（`rootSizingDrift` 1 筆、`staleOverrides` 1 筆符合預期）；**尚未在真實 Figma 檔實測**。
- `contrast_on_image.py`：合成影像（漸層底＋亮字）測試，整條 FAIL（最壞 1.56）、暗段 PASS（最壞 5.20），符合預期。
