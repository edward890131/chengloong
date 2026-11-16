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

## 2026-11-16 · SEO 交付規格實作（不影響畫面）
- 類型：P（HTML 結構與 head，無視覺異動）
- 畫面：A 首頁、服務條款；來源：同事「官網首頁 SEO 交付規格」（2026-10-28）
- 真相：head 標籤、標題層級（膠囊與 FAQ 改 h3／h4，# 與 Q 編號移到標題外）、圖片 alt、sitemap／robots、JSON-LD；站內連結改 /terms
- 影響：只動語意標籤，新增 `.cl-h`（:where 零權重，字級字重沿用外層）、`.cl-faq__row`、`.cl-paper__step-h`；Figma 母版與設計稿不需改
- HTML：src/_head.html、_header.html、pages/terms.html、sections/01–07、09；css base／03-paper／07-faq；js 07-faq；build.py；serve.py
- Guideline：無
- Figma：無
- 驗證：7 個寬度 × 首頁／條款＋FAQ 展開、頁籤切換共 42 張截圖改前改後逐像素相同（停用網路字型以排除字型渲染浮動）；真字型下文字與圖片位置 35 個狀態相同（僅 1440 寬一個數字量測值在 0.5px 進位邊界，舊新版同時量測皆為 170.27px）
