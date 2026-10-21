# 三邊同步紀錄（SYNC_LOG）

新的寫在最上面。格式：

```
## YYYY-MM-DD · <異動摘要>
- 類型：T／C／V／P／G
- 畫面：代碼＋名稱（例：A-03 簡訊驗證）；來源（調整區副本 node id／設計師直接改／HTML 先動）
- 真相：量測值 vs token；使用者的決定
- 影響：class → Figma 母版 → 設計稿（有覆寫的 instance）
- HTML：檔案:行
- Guideline：parts 檔、手冊版本
- Figma：變數／樣式／母版 node id、設計稿 node id
- 驗證：token_diff ＿／figma_audit ＿／頁高 ＿／截圖路徑
```
