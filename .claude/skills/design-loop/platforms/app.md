# 平台：APP

狀態：**stable**（0.3.0 起）。依據：APP 案走完 S0–S7（2026-09），走的是「iOS／Android 不差異化」分支、Phone 單一 Size、Light 單一主題。下方標 **待驗** 的段落（兩平台差異化、Dark mode、平板設計稿、工程交接）還沒有 APP 案走過，第一次用時照做並把結果寫 LESSONS。實測結果和本文件不符時以實測為準。

## 開案分支：iOS／Android 要不要差異化

開案時問使用者。不差異化就在 init 加 `--unified-platform`；init 會預填 `manifest.platform_policy`（日期＋決策），理由欄開案後補上。

| | 差異化（init 預設，**待驗**） | 不差異化（實測 0.3.0） |
|---|---|---|
| 適用 | 設計師兩平台都畫、或客戶要求各走原生慣例 | 客戶只要一套；Android 沿用 iOS 版面與 system chrome |
| manifest | `modes.Platform` iOS／Android；viewports 兩平台各一 | init 加 `--unified-platform`：`modes.Platform: []`、viewports 只留 Phone（＋Tablet）、`options.unified_platform: true`（0.4.0） |
| S0 HTML | `?platform=android` 切 `data-platform`；`source_nodes` 兩平台 | 不做 `?platform=`；`source_nodes` 只填有畫的平台 |
| S1 | 平台差異表＋「S1 額外驗收」 | 平台差異章寫「不差異化」與決策日期；略過 S1 額外驗收 |
| S2 擷取 | 兩平台各擷取一次 | 擷取一次 |
| S3 | 建 `Platform` collection、兩平台長得不同的元件加 Platform 變體 | 不建 Platform collection（Size 順號成 `3 Size`）、不加 Platform 變體 |
| S4 | 切 Platform mode 看兩平台；版面不同的畫面各做 frame | 一個畫面一張 frame |

之後要改成差異化：走 S5 T 類（加 mode）＋C 類（加變體），不重開案。

## manifest 預設（init 會填）

- `viewports`：iOS 393×852、Android 412×915（依客戶主力機型改）；`--tablet` 加 iPad 834×1194、Android Tablet 800×1280。
- `modes`：
  - `Semantic`：Light＝`:root`；`--dark` 加 Dark＝`[data-theme="dark"]`。
  - `Platform`：iOS＝`:root`（預設平台的值直接寫在 `:root`）、Android＝`[data-platform="android"]`（只寫和 iOS 不同的值）。
  - `Size`：Phone＝`:root`；`--tablet` 加 Tablet。
- `figma.source_file_key`：客戶給的 key page 檔，**唯讀**，不寫入。`figma.file_key`：設計系統與設計稿的檔（新開或使用者指定）。客戶只給一個檔（兩個 key 相同）時照 `core/s0-source-to-html.md` B-1 的同檔唯讀守則。
- 建案前確認 Figma 方案允許的 mode 數量。

## Dark mode／平板「可能要」（**待驗**）

- **還沒確定就先不建 mode**，也不放草稿值（避免被當成定案）。預留靠結構：元件只綁 Semantic、版面只綁 Size／layout 變數、手冊寫明「預留 Dark／平板」。
- 確定要做時再加 mode：
  1. `manifest.modes` 加一列（`Dark`／`Tablet`），`options` 改 true；平板另加 `viewports`。
  2. tokens.css 加覆寫區塊（`[data-theme="dark"]{…}`／`@media (min-width:600px){…}`）；tokens.json 對應 token 加 `$extensions.designLoop.modes`。
  3. Figma collection 加 mode（值會先複製預設 mode，逐一改）。
  4. 走 S5（T 類）驗證：token_diff 會比對新 mode。
- 值還在跟客戶確認時，可以先建 mode、值標草稿：tokens.json 標 `$extensions.designLoop.status: "draft"`，Figma 變數 description 寫「草稿」。

## S0：HTML 規格（HTML 是原型，不是交付程式碼）

- **一個畫面一支 HTML，兩平台共用**。預設是 iOS；網址加 `?platform=android` 時在 `<html>` 設 `data-platform="android"`。主題同理：`?theme=dark` 設 `data-theme="dark"`（有開 Dark 才做）。
- body 寬固定＝該平台 viewport 寬；單屏畫面高＝裝置高，可捲動畫面高度依內容。畫面根節點用一個固定 class（例：`.{prefix}-screen`），擷取與截圖都以它為範圍；帶 sticky 底部列的長頁截圖方式見 capture-gotchas。
- system chrome 做成元件、照平台畫：status bar、home indicator（iOS）、navigation bar（Android）、safe area inset。
- 單位：CSS px 1:1 對應 pt／dp。
- 沒有 hover；狀態做 pressed、focus、disabled、selected、loading。
- `?static` 停在第一個狀態；要看特定狀態用 `?state=empty|loading|error`。參數可以並用。
- 圖片、圖示素材放專案 `assets/`。
- `registry.pages[]` 一個畫面一筆；`source_node` 改寫成 `source_nodes: {"iOS": "<node id>", "Android": ""}`（設計師沒畫的平台留空）。
- 驗收：
  - 設計師有畫的平台：照 S0-B 對來源驗收。
  - 設計師沒畫的平台：S0 先照有畫的平台版面做、system chrome 照該平台畫，記進 audit-source.md；這個平台的驗收移到 S1（見下）。

## S1：Guideline 補充章節與驗收

在 `templates/guideline-outline.md` 之外補：
- 平台差異（同一元件在 iOS／Android 的差異表）
- 系統元件（沿用原生的有哪些、客製的有哪些）
- 手勢與觸控（觸控區 44pt／48dp、手勢衝突）
- 狀態（empty／loading／error／offline／權限被拒）
- 深色模式（沒開也要寫「元件只綁 Semantic，預留 Dark」）
- 平板版面（有開才寫）：欄數、雙窗格、哪些畫面重排，寫在 05 版面章
- 對標：Material 3 × Apple HIG；文件格式仍用 Ant Design。

**S1 額外驗收**：設計師沒畫的平台，每個畫面和已驗收平台並排截圖，兩者的每一處差異都必須在「平台差異表」上；表上沒有的差異要修掉或補進表並讓使用者過目。

tokens.json 維持**框架中立**：數值用邏輯像素、不帶平台單位；命名看用途（`sys.color.surface.default`），不寫 Flutter／SwiftUI 名稱。`$value` 放預設平台（iOS）與 Light 的值，其他 mode 寫 `$extensions.designLoop.modes`。

## S2：擷取（實測 0.3.0）

1. 專案根目錄起本機站 `python3 -m http.server`（`file://` 不支援）。
2. 每頁 `<head>` 保留 Figma capture script tag。
3. 在 scratchpad 自裝 Playwright（Playwright MCP 留給主控），開裝置寬的分頁，網址 `<頁>.html?static#figmacapture=<captureId>&figmaendpoint=<endpoint>&figmaselector=.{prefix}-screen`；selector 指到畫面根節點，只擷取裝置畫面。呼叫後不 await。
4. `generate_figma_design` 帶 captureId 輪詢；`nodeId` 給 `HTML 擷取` page 的 id 就直接放進該 page。
5. 多頁：一次產多個 captureId、多分頁同時擷取，完成後依 frame 原名對回頁面（capture-gotchas「多頁同時擷取」）；擷取後處理 Semibold 字型名（capture-gotchas）。
6. 擷取稿改名、擺位，寫 `registry.pages[].capture_node`。差異化分支時 iOS 與 Android（`?platform=android`）各擷取一次（**待驗**）。

- 擷取失敗時：Playwright 依 viewport 截全頁 → `upload_assets` 上傳到 `HTML 擷取` page 成圖片 frame（命名同擷取稿）→ `capture_node` 填這個 frame 的 id、`height.capture` 填截圖高。S4 的圖片從 `assets/` 用 `upload_assets` 上傳。結果寫 LESSONS。

## S3：Variables 結構

不差異化分支不建 `Platform` collection（見開案分支）。

| Collection | Modes | 內容 |
|---|---|---|
| `{FP} · 1 Primitives` | Value | 色板、間距階梯、圓角階梯 |
| `{FP} · 2 Semantic` | Light（＋Dark） | surface／text／border／accent／status、字體家族 |
| `{FP} · 3 Platform` | iOS／Android | **只放兩平台真的不同的值**：導覽列高、tab bar 高、`comp/hit-min`（44／48）、系統字體、元件圓角、兩平台字級真的不同時的字級 |
| `{FP} · 4 Size` | Phone（＋Tablet） | 字級、行高、`layout/margin｜gutter｜columns`、不分平台的 `comp/*` |

- 元件只綁 Semantic，不直接用 Primitives。
- 兩平台長得不一樣的元件（Switch、Picker、Action sheet／Bottom sheet、Top app bar）加 `Platform` 變體；長得一樣的不要拆。
- codeSyntax 只設 WEB（Flutter 在 Figma 沒有對應欄位）。

## S4

- 每個功能 page（`core/figma-pages.md`）內依 user flow 排：一個 flow 一列，每個畫面右邊接它的狀態（empty／loading／error）。
- frame 尺寸＝裝置；在 frame 上切 Platform／Semantic mode 看兩平台、兩主題。兩平台版面不同的畫面（例：Android 用 Top app bar、iOS 用大標題）各做一個 frame。
- 平板（有開才做）：不是只切 Size mode，照手冊平板版面規則另做 frame 重排。

## 工程交接（選配，不在閉環內；**待驗**）

- 交付：tokens.json、Guideline、Figma 設計稿、registry.json（元件對照）。
- Flutter：工程師可自行轉換，或另外產 `handoff/flutter-mapping.md`（Semantic 色 → `ColorScheme` 角色、文字樣式 → `TextTheme`、其他 → `ThemeExtension`）；自動轉換可用 Style Dictionary。這一步不影響三邊同步，manifest 記 `handoff.framework`。
