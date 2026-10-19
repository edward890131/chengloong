# 並行分工（多 agent）

同一站或同一批 S6 要多個 agent 同時做時照這份（S1 分章、S3 分章節建母版、S4／S6 分頁）。只有一個 agent 時不需要；它自己就是所有檔與母版的負責人。

分層、契約檔、檔案所有權這類分工做法是 **建議做法，待驗**（0.3.0，APP 案一案：S1 五人分章、S6 兩批各 3 人 HTML＋2–3 人母版＋4 人擷取重建），換一個團隊可以有別的分法，第二案照做沒問題才改實測。工具與 CSS 的行為（partial 串接順序、碎片撞名、MCP resource、scratchpad 覆寫、母版異動疊加）是 **實測**。

## 1. 分層

| 層 | 做什麼 | Figma 權限 |
|---|---|---|
| P1 | HTML／CSS／手冊章節／token 碎片 | 唯讀（截圖、metadata、`exportAsync` 取 SVG） |
| P2 | S3 補母版與變體 | 只寫 Guideline page 上自己的章節 frame |
| P3 | S2 擷取＋S4 重建 | 只寫 `HTML 擷取`／功能 page 上自己的 frame 或子 section；`Wireframe`、`調整區` 唯讀 |
| P4 | DS_GAPS 清空、S7 復盤、S5 紀錄、數量回報 | 主控＋R4 審查 agent |

- **P1 與 P2 可以並行**：母版照開工當下的 CSS 建；HTML 負責人把元件層 CSS 異動逐條列在回報的「元件 CSS 異動」，主控彙整後走 S5 轉給母版負責人。比等 HTML 全部完成才建母版快很多。建議做法，待驗。
- **P2 分章節並行**：每位 DS 負責人寫一個章節 frame；多人都會用到的元件（例：共用疊層）指定給一人、放在他的 section，不讓兩人寫同一個 frame。證據：三人約 28 分鐘建完 72 個母版＋46 icon，audit 全 0。建議做法，待驗。

## 2. 契約檔

主控開工前寫 `_design-loop/<站或批>_CONTRACT.md`，agent 只照契約做：

1. 已定案的基礎（決策來源、tokens 原始檔、build 產物）：不准改，要改回報主控。
2. 檔案所有權表（§3）。
3. 共用決策（例：按鈕層級、人稱、wireframe 灰塊代表什麼），每條寫依據。
4. 新元件 class API（markup、變體、狀態、S6 判斷樹層級）與手冊章節格式、章節編號區段。
5. 交付格式與驗收門檻（§4）。

- 契約只放跨批共用的常規；單批的狀態旗標（誰 ready、幾點、分派）放 `_design-loop/<批>_RUN_LOG.md`。有依賴的工作（例：基礎元件 ready 後其他人才用）靠旗標開工。
- 後一批只寫差異，開頭寫明沿用哪份、衝突時以哪份為準。

## 3. 檔案所有權

- 每個檔只有一個負責人。CSS 拆 partial（`components/_10-base.css`…）、手冊拆 part、comp token 拆碎片 `tokens/comp-<範圍>.json`，由 build 合併；registry 交碎片 `_design-loop/registry-<批>/<負責人>.json`。
- 主控獨佔：`tokens.json`、`registry.json`、`manifest.json`、`audit.md`、`LESSONS.md`、`DS_GAPS.md`、`SYNC_*`、`REVIEW_LOG.md`、手冊版本號。
- 碎片 key 各自加範圍前綴：碎片之間撞名，build 不一定會擋（後讀蓋先讀）。
- **partial 串接順序決定同權重勝負**：base 借用別人 partial 的 class，會被後面 partial 的同權重規則蓋掉。跨 partial 組合時提高權重，或請負責人加 modifier，不靠串接順序。
- 別人的檔只讀；需要別人改寫進回報的「跨負責人需求」，頁面暫代只准用 token。不刪、不改名別人或舊版建立的 class；既有母版只能加變體或屬性，不改既有預設值與 key。
- 同一個母版只有一個負責人（S3 §5）；頁面 agent 發現母版問題寫 DS_GAPS，不自己改。

## 4. 派工前置（主控在派工前做）

- **MCP resource**：subagent 環境可能讀不到 MCP resource（`skill://figma/figma-use` 等）→ 主控先讀，把規則摘成專案檔（例：`_design-loop/refs/figma-use_rules.md`），派工時列為必讀。
- **scratchpad 共用**：多個 agent 的暫存腳本同名會互相覆寫 → 暫存檔名加負責人前綴。
- **報告檔**：交付時先試寫一次報告檔（`evidence/<批>/<負責人>/REPORT.md`）；被權限擋下才把同樣內容放回報訊息，由主控落檔。不要預設 subagent 不能寫檔（各環境權限不同）。
- **瀏覽器**：Playwright MCP 只有一個，留給主控；其他 agent 自己裝（capture-gotchas）。
- 每人指定 evidence 路徑、registry 碎片路徑、Figma 擺放位置（子 section 與座標規則）。
- 回報格式：頁數或元件數、新增 token／元件／變體數量、跨負責人需求、LESSONS、待使用者決定。

## 5. 母版異動通報

- 症狀：P3 重建期間母版被改（例：導覽列加 icon、狀態列加右 padding），已建頁面位移，或頁面層原有的補償和母版修正疊加出 .5。
- 對策：母版負責人每次改母版都通報主控，主控轉給受影響頁面的 agent 重查；頁面 agent 先查頁面層有沒有同一處的補償（手動位移、覆寫 padding），有就拿掉再量。改前改後量頁高（S4 流程 4）。
- 證據：APP 案 badge 位置出 118.5；Web 案母版加上 BOOLEAN spacer 後，頁面原本模擬同一效果的覆寫疊加，KV 430→470（0.4.0）。單一 agent 作業、自己改母版時一樣會疊加。

## 6. 收尾（主控）

碎片併回（tokens、registry）→ 報告落檔 → build 與各站驗收 → agent 用 Bash 寫的檔補進 SYNC_PENDING → 數量回報給使用者。
