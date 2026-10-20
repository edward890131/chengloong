# Figma MCP 規則摘要（給 subagent；主控已讀過原始 skill）

## 讀取（S0 只准讀）

- `get_metadata`（fileKey, nodeId）：結構與座標。注意 Group 子層座標相對 Group 的上一層；metadata 不展開時改用 `use_figma` 唯讀列 children。
- `get_design_context`（fileKey, nodeId, clientLanguages="html,css", clientFrameworks="unknown", skillNames="resource:figma-design-to-code"）：回傳 React+Tailwind 參考碼，**要轉成純 HTML＋CSS**（不准裝 Tailwind）。
  - 回應太大時只回稀疏 metadata → 對子節點分批呼叫（同一則訊息平行呼叫多個）。
  - 回傳碼是視覺參考：absolute 定位能用 flex／grid 表達就改成正常版面；只有疊圖、裝飾、弧線這類才用 absolute。
  - 每個看得見的圖片／SVG 都要下載、放在稿上的位置；SVG 的 root width/height 不要改。
  - `data-node-id` 對應 Figma node id，抄到 HTML 的 `data-figma`。
- `get_screenshot`（fileKey, nodeId, maxDimension, enableBase64Response=true）：視覺目標。最多回 1x。
- `get_motion_context`（fileKey, nodeId, recursive=true）：動畫 keyframes 與 CSS 片段。
- `use_figma`（唯讀用途才准用）：skillNames="resource:figma-use"。規則：用 `return` 回傳資料；不要包 async IIFE；`await figma.getNodeByIdAsync(id)`；換 page 用 `await figma.setCurrentPageAsync(page)`；**不准有任何寫入**（不改屬性、不建節點）。

## 常見陷阱

- 文字 `leading-[normal]` → CSS `line-height: normal`。
- Tailwind `text-[rgba(...)]`、`tracking-[2px]` → `color`、`letter-spacing: 2px`。
- `font-['Noto_Sans_TC:SemiBold']` → `font-family: var(--cl-font-sans); font-weight: 600`。
- 小數尺寸（161.28、47.36…）照抄即可，S0 不取整；S1 再決定。
- `opacity-0` 的圖層是動畫或替代狀態的隱藏圖，不是主畫面要顯示的。
