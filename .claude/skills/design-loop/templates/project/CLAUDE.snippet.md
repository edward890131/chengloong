## design-loop

本專案使用 design-loop（`~/.claude/skills/design-loop`）。狀態與紀錄在 `_design-loop/`：
- `manifest.json`：平台、Figma 檔與 page、目前站別、整數與同步規則
- `registry.json`：CSS class ↔ Guideline 章節 ↔ Figma 母版 ↔ 設計稿對照

Figma 正式稿（功能 page）不直接改：複製到「調整區」改完，跟 AI 說「<畫面代碼> 調整好了，套回去」。不在 manifest 裡的 page 是自由區，AI 不動。

任何 HTML／CSS／token／Figma 母版的異動都要走 S5 三邊同步；`_design-loop/SYNC_PENDING.md` 有未勾選項目時先處理。
