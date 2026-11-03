# S4 重建計畫與進度

做法：每段用 Playwright 量網站元素位置（scratchpad geo.js），照數值用元件 instance＋變數重建，再和網站截圖並排比對。

## A-01 首頁

| 段落 | 元件 | 1440 | 768 | 375 |
|---|---|---|---|---|
| Header | Header（Desktop／Compact） | ✓ | ✓ Compact | ✓ Size=Mobile |
| 01 Hero | Button；首屏文字為本地文字（等比縮放） | ✓ 重建（1440×800 viewport） | ✓ 重建（768×1024 viewport，Hero Cover Tablet） | ✓ 重建（375×812，Hero Cover Mobile、三標籤） |
| 02 關於 | Section Head、Card/About×4、Pill | ✓（+1px） | ✓ 卡片 2×2 wrap、價值循環等比縮放 | ✓ 卡片橫排裁切、價值循環滿版＋提示 |
| 03 紙張 | Section Head、Card/Paper×3、Ecolabel/* | ✓ 重建（+2px） | ✓ 兩欄 326、文字卡 HUG 照片撐滿 | ✓ 輪播（Nav／Dots） |
| 04 流程 | Section Head、Card/Process×4、Tab×3、Card/Step×4 | ✓（+5px，步驟卡各 +1） | ✓ 窄卡 171、步驟在上預約圖在下 | ✓ Card/Process Mobile 直排 |
| 05 綠點 | Section Head、Tile×3、Info Card、Pill | ✓ 重建（+1px） | ✓ wrap（介紹整列＋兩欄） | ✓ 卡片輪播 |
| 06 串場 | 照片 6 張（交錯 0／40） | ✓ 重建 | ✓ 280×196、交錯 0／28、圓角 12 | ✓ 160×112、交錯 0／16、圓角 8 |
| 07 FAQ | Section Head、Tab×3、Accordion×5 | ✓（+1px） | ✓ | ✓ |
| 08 CTA | Button（White 20、White） | ✓ 重建 | ✓ 背景 1280×600 置中裁切 | ✓ 按鈕直排滿版 |
| Footer | Footer | ✓（母版加背景曲線、回頂部） | ✓ Size=Tablet 變體 | ✓ Size=Mobile 變體 |

1440 全頁：網站 9774（1440×800 viewport）／設計稿 9775。
768 全頁：網站 10564（768×1024 viewport）／設計稿 10563（關於段卡片 308.5 取整）。
375 全頁：網站 9595（375×812 viewport）／設計稿 9596。

## B-01 服務條款

| 寬度 | 狀態 |
|---|---|
| 1440 | ✓ 重建（網站完整條文，4843） |
| 768 | ✓ 重建（5158） |
| 375 | ✓ 重建（7316） |
