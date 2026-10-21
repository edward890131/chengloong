## design-loop

本專案使用 design-loop（`~/.claude/skills/design-loop`）。狀態與紀錄在 `_design-loop/`：
- `manifest.json`：平台、Figma 檔與 page、目前站別、整數與同步規則
- `registry.json`：CSS class ↔ Guideline 章節 ↔ Figma 母版 ↔ 設計稿對照

Figma 正式稿（功能 page）不直接改：複製到「調整區」改完，跟 AI 說「<畫面代碼> 調整好了，套回去」。不在 manifest 裡的 page 是自由區，AI 不動。

任何 HTML／CSS／token／Figma 母版的異動都要走 S5 三邊同步；`_design-loop/SYNC_PENDING.md` 有未勾選項目時先處理。

## GitHub 推送遇到 403

推送回 403 時不要一直重試。先用 `gh api user --jq .login` 與 `gh api repos/edward890131/chengloong --jq .permissions.push` 查目前連結的帳號與寫入權限，向使用者說明是權限問題，並**一律附上以下連結**：

1. 讓 `una4498`（或當下連結的帳號）有寫入權限：用 `edward890131` 登入 https://github.com/edward890131/chengloong/settings/access → Add people → 權限 Write；再用該帳號登入接受邀請（https://github.com/notifications）。
2. 改用 `edward890131` 連結 Claude：先在瀏覽器登出 GitHub、改用 `edward890131` 登入，再開 https://claude.ai/connect-github?org=c70befa2-24c9-4b19-8dbf-cfb7c45ad36c
3. Claude GitHub App 安裝與 repo 範圍（用 `edward890131` 登入）：https://github.com/apps/claude/installations/select_target

已知狀況：session 連結的帳號會在 `edward890131`、`una4498`、`kh4078` 之間變動，只有 `edward890131` 確定有寫入權。使用者說修好後，先確認 `push: true` 再推送。
