# 正隆機密文件水銷服務：官網首頁 SEO 交付規格

- **文件用途**：官網首頁的 SEO 實作規格，開發照本文件填值、加標籤、建檔。
- **適用頁面**：https://clc-doc-destruction.vercel.app/（上線後為 `{{正式網域}}/`）
- **版本日期**：2026-10-28

本文件裡的 `{{…}}` 是還沒到位的值：客戶要提供的列在第 7 節。分享圖 `og-cover.jpg` 已由 UI 提供（2026-10-28），圖檔另附。`{{正式網域}}` 一律指含 `https://`、結尾不加斜線的網域（例：`https://www.example.com.tw`）。

---

## 1. `<head>` 標籤

整段貼進首頁 `<head>`，`<html>` 的語系一併設定。

```html
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>正隆機密文件銷毀｜水銷服務・賦予紙張再生的機會</title>
<meta name="description" content="正隆以水力散漿技術，安全銷毀機密文件，再製成環保衛生紙和再生紙漿，並以綠點存摺將回收紙化為永續資產，與企業共創永續循環，賦予紙張再生的機會。">
<link rel="canonical" href="{{正式網域}}/">
<meta name="robots" content="index, follow, max-image-preview:large">

<!-- Open Graph：LINE、Facebook 分享預覽 -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="正隆機密文件水銷服務">
<meta property="og:locale" content="zh_TW">
<meta property="og:url" content="{{正式網域}}/">
<meta property="og:title" content="正隆機密文件銷毀｜水銷服務・賦予紙張再生的機會">
<meta property="og:description" content="正隆以水力散漿技術，安全銷毀機密文件，再製成環保衛生紙和再生紙漿，並以綠點存摺將回收紙化為永續資產，與企業共創永續循環，賦予紙張再生的機會。">
<meta property="og:image" content="{{正式網域}}/og-cover.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="正隆 CHENG LOONG：RECIRCULATE PAPER, NEW LIFE.">

<!-- X（Twitter） -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="正隆機密文件銷毀｜水銷服務・賦予紙張再生的機會">
<meta name="twitter:description" content="正隆以水力散漿技術，安全銷毀機密文件，再製成環保衛生紙和再生紙漿，並以綠點存摺將回收紙化為永續資產，與企業共創永續循環，賦予紙張再生的機會。">
<meta name="twitter:image" content="{{正式網域}}/og-cover.jpg">
<meta name="twitter:image:alt" content="正隆 CHENG LOONG：RECIRCULATE PAPER, NEW LIFE.">

<!-- 網站圖示 -->
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#14a558">

<!-- 結構化資料：兩段 JSON-LD 見第 6 節，貼在這裡 -->
</head>
```

| 標籤 | 填值規則 | 字數或尺寸上限 |
|---|---|---|
| `<html lang>` | `zh-Hant-TW` | — |
| `<title>` | 「正隆」放最前面，含「機密文件銷毀」 | 全形 30 字內（本值 23 字） |
| `meta description` | 品牌與 ESG 角度，內容只取頁面上已有的事實 | 全形 70～80 字（本值 70 字） |
| `link canonical` | 首頁正式網址，絕對網址，與 `og:url` 完全相同 | — |
| `meta robots` | `index, follow, max-image-preview:large` | — |
| `og:title` | 與 `<title>` 同值 | 同 `<title>`（本值 23 字） |
| `og:description` | 與 `meta description` 同值 | 同 `meta description`（本值 70 字） |
| `og:image` | `og-cover.jpg`（UI 2026-10-28 提供，Figma 正隆水銷視覺提案 node 2322:34392），放網站根目錄、填絕對網址；JPG | 1200×630 px，檔案 1 MB 內 |
| `og:image:alt` | 照圖上實際看得到的文字寫，圖換了要跟著換 | 100 字內 |
| `og:locale`／`og:site_name` | `zh_TW`／`正隆機密文件水銷服務` | — |
| `twitter:*` | 與對應的 `og:*` 同值 | 同 `og:*` |

`/terms` 頁的 canonical 為 `{{正式網域}}/terms`，其餘欄位照該頁內容另填。

---

## 2. 標題層級（H1～H3）

- 全頁只有一個 `<h1>`。
- 英文眉標（Document Destruction、From document to daily paper、Service Process、GREEN POINTS & DIGITAL CERTIFICATES、GREEN POINTS、CERTIFICATES、FAQ）用 `<p>`，不用標題標籤。
- 標題標籤裡只放標題文字。裝飾符號（「從機密文件到日常用紙」三步的 `#`）、說明按鈕與說明泡泡、FAQ 編號（`Q1.`）都放在標題標籤外面，搜尋引擎才不會把它們讀成標題的一部分。
- 頁籤（服務流程的「線上預約步驟／送廠前的準備／當天進場流程」、常見問題的「預約與到廠／準備與分類／水銷證明與綠點回饋」）維持 `role="tab"` 按鈕，不用標題標籤。
- 常見問題每一題的寫法：`<h3>` 包住展開按鈕，按鈕內只有問句；`Q1.` 編號放在 `<h3>` 前面。

```html
<div class="cl-faq__item">
  <span class="cl-faq__num" aria-hidden="true">Q1.</span>
  <h3 class="cl-faq__q">
    <button type="button" aria-expanded="false" aria-controls="faq-a1">第一次到廠，怎麼知道怎麼走？</button>
  </h3>
  <div id="faq-a1" class="cl-faq__a" hidden>…</div>
</div>
```

完整標題樹：

```
H1 透過機密水銷，賦予紙張再生的機會
├ H2 關於正隆水銷服務
│ ├ H3 完善的銷毀流程
│ ├ H3 實地見證監銷
│ ├ H3 資源永續再生
│ ├ H3 永續數據追溯
│ └ H3 水銷價值循環
├ H2 從機密文件到日常用紙
│ ├ H3 水力散漿
│ ├ H3 依原料特性進行產線分流
│ └ H3 重新製成，賦予新生
├ H2 服務流程
│ ├ H3 預約＆做好送廠準備
│ ├ H3 自行運載入廠
│ ├ H3 水銷及循環再生
│ ├ H3 獲得綠點
│ │  〔頁籤：線上預約步驟〕
│ ├ H3 選擇車型與台數
│ ├ H3 選擇水銷分類
│ ├ H3 挑選到廠日期與時段
│ ├ H3 完成預約並閱讀須知
│ │  〔頁籤：送廠前的準備〕
│ ├ H3 一、移除雜物
│ │ ├ H4 移除大型金屬夾具
│ │ └ H4 抽掉塑膠資料夾與 L 型夾
│ └ H3 二、將處理好的紙張打包，準備送廠
│   ├ H4 家庭用紙產線｜白紙・影印紙
│   └ H4 工業用紙產線｜瓦愣紙・報紙・混合紙類
│    〔頁籤：當天進場流程，六個步驟用 <ol>，不用標題標籤〕
├ H2 綠點存摺與數位證明
│ ├ H3 綠點存摺
│ │ ├ H4 用途一｜企業採購折抵
│ │ └ H4 用途二｜公益捐贈
│ └ H3 完整的水銷數位證明
│   └ H4 機密文件水銷證明
├ H2 常見問題
│ ├ H3 第一次到廠，怎麼知道怎麼走？
│ ├ H3 臨時決定要銷毀，沒預約可以進場嗎？
│ ├ H3 預約時還不確定到場車號，怎麼辦？
│ ├ H3 水銷服務要收費嗎？
│ ├ H3 一次要送多少量才能預約？
│ ├ H3 文件分類有什麼限制？金屬夾、塑膠夾或訂書針需要拆除嗎？
│ ├ H3 運送時的包裝方式有規定嗎？
│ ├ H3 可以送到哪些廠區進行水銷？
│ ├ H3 水銷完成後，多久可以拿到銷毀證明？
│ ├ H3 綠點如何計算？有使用期限嗎？
│ ├ H3 綠點如何兌換商品或進行公益捐贈？
│ └ H3 數位證明上的貢獻減碳量與保留樹木等資訊，可視為經第三方驗證的嗎？
└ H2 您回收的每1KG文件，都與正隆攜手共創永續循環。
```

隱藏中的頁籤內容仍輸出在 HTML 裡（用 `hidden` 屬性切換，不要等點擊才用 JavaScript 產生），搜尋引擎才讀得到。

---

## 3. 圖片 alt

**規則**：不帶資訊的圖寫 `alt=""`，包含線條、虛線圓、底色帶、背景圖、氛圍照，以及旁邊已有文字或外層按鈕／連結已有 `aria-label` 的 icon、箭頭與 logo。`alt=""` 一定要寫出來（空字串），螢幕閱讀器才會略過；整個屬性省略會被唸出檔名。帶資訊的照片與圖表寫具體描述，不以「圖片」「照片」開頭。

**另外三條**：
- 首屏輪播的外層容器不加 `role="img"` 與 `aria-label`，四張圖各自用下表的 alt（外層包成一張圖時，裡面的 alt 會被忽略）。
- 服務流程四張卡片中有寫 alt 的圖（`card2-truck`、`card3-pulper`、`card4-screen`），外層容器不加 `aria-hidden="true"`。
- logo 連結的 `aria-label`：導覽列與頁尾都用 `正隆機密文件水銷服務`。

路徑皆以 `assets/` 開頭，表內省略。

| 區塊 | 圖檔路徑 | alt 值 |
|---|---|---|
| 載入畫面、導覽列、頁尾 | `01-hero/logo-mark.svg`、`01-hero/logo-zh.svg`、`01-hero/logo-en.svg`、`09-footer/logo-mark.svg`、`09-footer/logo-zh.svg`、`09-footer/logo-en.svg` | `""` |
| 全站按鈕與選單 | `common/icon-arrow-w-20.svg`、`common/icon-arrow-w.svg`、`common/icon-arrow-dark.svg` | `""` |
| 首屏輪播 | `01-hero/cover-1.webp` | 正隆竹北廠廠房外觀 |
| 首屏輪播 | `01-hero/cover-2.webp` | 水力散漿設備，槽內為離解中的紙漿 |
| 首屏輪播 | `01-hero/cover-3.webp` | 產線上包裝完成的蒲公英環保衛生紙 |
| 首屏輪播 | `01-hero/cover-4.webp` | `""` |
| 首屏「安全／綠色／永續」 | `01-hero/icon-safe.svg`、`01-hero/icon-leaf.svg`、`01-hero/icon-recycle.svg` | `""` |
| 首屏數據說明 | `01-hero/icon-info.svg`、`01-hero/tooltip-arrow.svg` | `""` |
| 關於正隆水銷服務 | `02-about/card2-ellipse-a.svg`、`02-about/card2-ellipse-b.webp`、`02-about/card2-dot.svg`、`02-about/card3-ellipse-outer.svg`、`02-about/card3-ellipse-inner.webp`、`02-about/card3-dot.svg` | `""` |
| 水銷價值循環 | `02-about/value-cycle-s-band.svg`、`02-about/value-cycle-l-band.svg` | `""` |
| 水銷價值循環 | `02-about/value-cycle-s-nodes.svg`、`02-about/value-cycle-l-nodes.svg` | 水銷價值循環圖：左環「循環經濟．機密文件循環再生」依序為機密文件、水銷處理、再生紙品製造；右環「綠點生態系．創造多贏永續價值」依序為綠點存摺、綠色採購折抵／公益捐贈、永續共好；兩環交會於綠點，1 KG 回收紙 = 1 綠點 = 1 元。 |
| 從機密文件到日常用紙 | `03-paper/arrow.svg` | `""` |
| 從機密文件到日常用紙 | `03-paper/step1-pulper.webp` | 散漿機中正在離解為纖維的紙漿 |
| 從機密文件到日常用紙 | `03-paper/step2-workers.webp` | 正隆工作人員於產線作業 |
| 從機密文件到日常用紙 | `03-paper/step3-tissue.webp` | 以再生紙漿製成的蒲公英環保衛生紙 |
| 從機密文件到日常用紙 | `03-paper/ecolabel-1.svg` | 環保標章 |
| 從機密文件到日常用紙 | `03-paper/ecolabel-2.svg` | 碳足跡標籤 |
| 從機密文件到日常用紙 | `03-paper/ecolabel-fsc.svg` | FSC 認證標章 |
| 服務流程卡片 | `04-process/card1-typing.webp` | `""` |
| 服務流程卡片 | `04-process/card2-truck.webp` | 載運文件的貨車停在正隆廠區 |
| 服務流程卡片 | `04-process/card3-pulper.webp` | 正在運轉的水力散漿設備 |
| 服務流程卡片 | `04-process/card4-laptop.webp` | `""` |
| 服務流程卡片 | `04-process/card4-screen.webp` | 企業後台「我的綠點」頁面，列出每次水銷的重量與獲得點數 |
| 服務流程卡片 | `04-process/icon-files.svg`、`04-process/icon-truck.svg`、`04-process/icon-drop.svg`、`04-process/icon-recycle.svg`、`04-process/icon-info.svg` | `""` |
| 線上預約步驟 | `04-process/booking-mockup2.webp` | 線上預約水銷的頁面畫面 |
| 送廠前的準備 | `04-process/prepare-1.webp` | 從文件上取下長尾夾 |
| 送廠前的準備 | `04-process/prepare-2.webp` | 抽出塑膠資料夾 |
| 送廠前的準備 | `04-process/prepare-3.webp` | 將白紙整疊放入紙箱 |
| 當天進場流程 | `04-process/route-home@2x.webp` | 家紙當天進場動線：1 警衛室報到、2 重車過磅、3 進入作業區、4 投入家紙水銷產線、5 空車過磅、6 領過磅單離場 |
| 當天進場流程 | `04-process/route-industrial@2x.webp` | 工紙當天進場動線：1 警衛室報到、2 重車過磅、3 進入作業區、4 投入工紙水銷產線、5 空車過磅、6 領過磅單離場 |
| 綠點存摺 | `05-green/m-arrow-next.svg` | `""` |
| 綠點存摺 | `05-green/greenpts-coins.webp` | `""` |
| 綠點存摺 | `05-green/paper-dandelion.webp` | 可用綠點折抵採購的蒲公英環保家用紙 |
| 綠點存摺 | `05-green/icon-cart.svg`、`05-green/icon-hand-heart.svg`、`05-green/icon-badge-check.svg` | `""` |
| 完整的水銷數位證明 | `05-green/certificate-pdf@3x.webp` | 機密文件水銷證明範例 |
| 完整的水銷數位證明 | `05-green/certificate-full@2x.webp` | 機密文件水銷證明範例（全頁） |
| 完整的水銷數位證明 | `05-green/esg-hand.webp` | `""` |
| 照片帶 | `06-strip/photo-forklift.webp` | 堆高機作業人員 |
| 照片帶 | `06-strip/photo-windmill.webp` | `""` |
| 照片帶 | `06-strip/photo-seedling.webp` | `""` |
| 照片帶 | `06-strip/photo-lab.webp` | 造紙檢測設備 |
| 照片帶 | `06-strip/photo-pulp-stack.webp` | 堆疊的紙漿板 |
| 照片帶 | `06-strip/photo-paper-roll.webp` | 再生紙捲 |
| 常見問題 | `07-faq/icon-add-32.svg`、`07-faq/icon-minus-32.svg`（含 `-24` 版） | `""` |
| 行動區 | `08-cta/bg-composite.webp` | `""` |
| 頁尾 | `09-footer/line-top.svg` | `""` |

綠點存摺輪播的切換按鈕 `aria-label` 為「切換綠點示意圖」。

---

## 4. sitemap.xml

放在網站根目錄：`{{正式網域}}/sitemap.xml`。

**收錄**：

| 網址 | changefreq | priority |
|---|---|---|
| `{{正式網域}}/` | monthly | 1.0 |
| `{{正式網域}}/terms` | yearly | 0.3 |

**不收**：登入頁與登入後的所有頁面（企業後台、正隆後台）、預約流程（五頁都要先登入，屬企業後台）、首頁錨點（`#about`、`#faq` 等）；這些頁面在 `<head>` 加 `<meta name="robots" content="noindex">`。

**網址一致**：sitemap、canonical、頁內連結一律用不帶 `.html` 的網址（服務條款連結寫 `/terms`）。

**lastmod**：填該頁內容最後一次修改文字或數字的日期，由部署流程自動寫入；只改樣式不更新。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{{正式網域}}/</loc>
    <lastmod>2026-10-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>{{正式網域}}/terms</loc>
    <lastmod>2026-10-28</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

---

## 5. robots.txt

放在網站根目錄：`{{正式網域}}/robots.txt`。

```
User-agent: *
Allow: /

Sitemap: {{正式網域}}/sitemap.xml
```

- 後台與登入頁不寫進 `Disallow`，改用第 4 節的 `noindex`（被 `Disallow` 擋住的頁，爬蟲讀不到 `noindex`，網址仍可能出現在搜尋結果）。
- 測試網域（`*.vercel.app`）整站回應標頭 `X-Robots-Tag: noindex`，只讓正式網域被收錄。

---

## 6. 結構化資料（JSON-LD）

兩段都放進首頁 `<head>`。

### 6.1 Organization＋LocalBusiness

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "{{正式網域}}/#organization",
      "name": "正隆股份有限公司",
      "url": "{{正式網域}}/",
      "logo": "{{正式網域}}/apple-touch-icon.png",
      "telephone": "+886-3-556-1226"
    },
    {
      "@type": "LocalBusiness",
      "@id": "{{正式網域}}/#zhubei",
      "name": "正隆機密文件水銷服務（正隆竹北廠）",
      "description": "以水力散漿將機密文件徹底銷毀，紙漿循環再製成多元再生紙品，並依水銷重量發放綠點至企業綠點存摺。",
      "url": "{{正式網域}}/",
      "image": "{{正式網域}}/og-cover.jpg",
      "telephone": "+886-3-556-1226",
      "parentOrganization": { "@id": "{{正式網域}}/#organization" },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "大義里長青路二段300號",
        "addressLocality": "竹北市",
        "addressRegion": "新竹縣",
        "postalCode": "302",
        "addressCountry": "TW"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 24.85994,
        "longitude": 120.96320
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:30",
          "closes": "11:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "13:00",
          "closes": "16:00"
        }
      ]
    }
  ]
}
</script>
```

### 6.2 FAQPage

問與答一字不改照頁面文字。頁面上的 FAQ 改了，這段要同步改。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "第一次到廠，怎麼知道怎麼走？",
      "acceptedAnswer": { "@type": "Answer", "text": "預約完成頁會提供進場動線圖與到廠注意事項（含警衛室報到、地磅人員登記車號過磅至水銷區流程）。出發前花一分鐘確認，到廠後照圖行進即可。" }
    },
    {
      "@type": "Question",
      "name": "臨時決定要銷毀，沒預約可以進場嗎？",
      "acceptedAnswer": { "@type": "Answer", "text": "為確保廠區作業安全與過磅效率，本服務全面採用線上預約制。請先於平台完成預約並取得預約編號後再行前往。" }
    },
    {
      "@type": "Question",
      "name": "預約時還不確定到場車號，怎麼辦？",
      "acceptedAnswer": { "@type": "Answer", "text": "線上預約時車號非必填，您可以安心預約並彈性調配運送車輛。為縮短現場等待時間，仍建議您儘可能預先填寫；若預約時未填，車輛抵達廠區報到時，將由地磅人員協助現場核對預約資訊並補登過磅即可。" }
    },
    {
      "@type": "Question",
      "name": "水銷服務要收費嗎？",
      "acceptedAnswer": { "@type": "Answer", "text": "本服務為正隆免費提供之機密文件水銷處理服務，不收取任何處理費或手續費。" }
    },
    {
      "@type": "Question",
      "name": "一次要送多少量才能預約？",
      "acceptedAnswer": { "@type": "Answer", "text": "本服務未設定單次最小送銷重量限制，歡迎透過系統預約到廠銷毀。" }
    },
    {
      "@type": "Question",
      "name": "文件分類有什麼限制？金屬夾、塑膠夾或訂書針需要拆除嗎？",
      "acceptedAnswer": { "@type": "Answer", "text": "為維護紙漿循環品質，請務必移除金屬夾具、拆除塑膠資料夾、塑膠封面。少量一般訂書針則可直接進入水銷系統。" }
    },
    {
      "@type": "Question",
      "name": "運送時的包裝方式有規定嗎？",
      "acceptedAnswer": { "@type": "Answer", "text": "可使用紙箱裝箱、紙袋盛裝或以繩索綑綁妥當，以便於現場搬運與過磅作業。" }
    },
    {
      "@type": "Question",
      "name": "可以送到哪些廠區進行水銷？",
      "acceptedAnswer": { "@type": "Answer", "text": "目前集中於正隆竹北廠進行水銷服務。開放時段請以線上預約系統顯示之時段為準（廠區保養日與國定假日除外）。" }
    },
    {
      "@type": "Question",
      "name": "水銷完成後，多久可以拿到銷毀證明？",
      "acceptedAnswer": { "@type": "Answer", "text": "文件過磅銷毀當下，現場地磅人員會提供實體磅單供您攜回作為初步憑證。此外，系統預計於 48 小時內完成數據比對並自動產出「機密文件水銷證明」，企業可隨時至「企業後台」下載數位檔案歸檔，作為內部紀錄與永續專案成果佐證。" }
    },
    {
      "@type": "Question",
      "name": "綠點如何計算？有使用期限嗎？",
      "acceptedAnswer": { "@type": "Answer", "text": "綠點永久有效，無期限限制。工業用紙產線水銷為 1 KG＝1 點；家庭用紙產線水銷為 1 KG＝2 點（含正隆加碼 1 點）。每1點具新臺幣1元之正隆指定商品採購折抵或公益捐贈價值。" }
    },
    {
      "@type": "Question",
      "name": "綠點如何兌換商品或進行公益捐贈？",
      "acceptedAnswer": { "@type": "Answer", "text": "企業可透過平台送出「指定環保產品」採購需求，將由專屬業務窗口主動聯繫對接；亦可選擇將點數用於捐贈予正隆合作公益機構，正隆即另行加碼 0.5 倍點數效益（攜手放大 1.5 倍永續影響力），兌換指定家用紙品捐贈公益團體。" }
    },
    {
      "@type": "Question",
      "name": "數位證明上的貢獻減碳量與保留樹木等資訊，可視為經第三方驗證的嗎？",
      "acceptedAnswer": { "@type": "Answer", "text": "本證明之貢獻減碳量與預估保留樹木棵數，係依據正隆生產實績及參考國際通用推估進行計算，未經第三方機構確信，適用於企業永續專案成果說明。" }
    }
  ]
}
</script>
```

上線後用 Google「複合式搜尋結果測試」（https://search.google.com/test/rich-results ）貼首頁網址驗證，兩段都要顯示「有效」。

---

## 7. 還沒到位的值

- `{{正式網域}}`：官網上線的正式網域（含 `https://`）。
- `{{預約入口網址}}`：首頁「免費預約水銷」「立即預約」按鈕要連到的預約第一頁，即企業後台的預約流程第一步（demo 為 `/corp/book.html`）；正式網址依企業後台上線網域，由開發設定，不需客戶提供。
- 郵遞區號已填 302（竹北市）。
- 經緯度已填 24.85994, 120.96320（正隆竹北廠，2026-11-16 依 OpenStreetMap 標點查填）。
