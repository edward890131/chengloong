# S4 重建計畫與進度

做法：每段用 Playwright 量網站元素位置（scratchpad geo.js），照數值用元件 instance＋變數重建，再和網站截圖並排比對。

## A-01 首頁

| 段落 | 元件 | 1440 | 768 | 375 |
|---|---|---|---|---|
| Header | Header（Desktop／Compact） | ✓ | 待對位 | 待對位 |
| 01 Hero | Button；首屏文字為本地文字（等比縮放） | ✓ 重建（1440×800 viewport） | 待重建 | 待重建 |
| 02 關於 | Section Head、Card/About×4、Pill | ✓（+1px） | 待對位 | 待對位 |
| 03 紙張 | Section Head、Card/Paper×3、Ecolabel/* | ✓ 重建（+2px） | 待重建 | 待重建 |
| 04 流程 | Section Head、Card/Process×4、Tab×3、Card/Step×4 | ✓（+5px，步驟卡各 +1） | 待對位 | 待對位 |
| 05 綠點 | Section Head、Tile×3、Info Card、Pill | ✓ 重建（+1px） | 待重建 | 待重建 |
| 06 串場 | 照片 6 張（交錯 0／40） | ✓ 重建 | 待重建 | 待重建 |
| 07 FAQ | Section Head、Tab×3、Accordion×5 | ✓（+1px） | 待對位 | 待對位 |
| 08 CTA | Button（White 20、White） | ✓ 重建 | 待重建 | 待重建 |
| Footer | Footer | ✓（母版加背景曲線、回頂部） | 手機版母版待做 | 手機版母版待做 |

1440 全頁：網站 9774（1440×800 viewport）／設計稿 9784。

## B-01 服務條款

| 寬度 | 狀態 |
|---|---|
| 1440／768／375 | 組裝稿 v0，待對位 |
