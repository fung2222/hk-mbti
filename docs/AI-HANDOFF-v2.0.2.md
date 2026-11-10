# 港式 MBTI v2.0.2 · 首頁標題修改及 AI 交接文件

日期：2026-11-10  
適用對象：下一位接手開發嘅 AI／開發者  
狀態：**已於 2026-11-10 部署。程式 commit 為 `8f2712506c3d39f8b0c0d5a7f358739ad1d3426b`；live 版本、內容雜湊及手機 DOM 已核實，詳見下方部署後驗收。**

## 部署後驗收記錄

- GitHub `main` 已核實為 `8f2712506c3d39f8b0c0d5a7f358739ad1d3426b`。
- GitHub Pages 已生效：live `index.html` MD5 `bfb4a45d1d3164308fa1c458a846108a`，同本地一致。
- live `VERSION` 及 `manifest.json` 均為 `2.0.2`；`sw.js` 為 `hk-mbti-v2.0.2`。
- 390×844 live DOM 實測：上方品牌連結冇可見文字，無障礙名稱為「港式 MBTI 主頁」；中間「MBTI」係唯一 H1，無障礙名稱為「港式 MBTI」。
- 上述 live 檢查冇 JavaScript page error，亦冇橫向溢出。
- Android App 實機重開、舊紀錄、進度、離線及分享卡仍應由 owner 再確認；唔將瀏覽器驗收當成實機驗收。
- Play Console 未更新；今次冇提交新 AAB。

## 0. 今次用戶問題同設計決定

Roy 提供 Android App 首頁截圖：左上 logo 旁邊嘅「港式 MBTI」意外放大及折行，同畫面中間嘅大「MBTI」重複，令手機首屏有兩個視覺標題。

採用嘅處理：

- **手機上方只保留 App logo**，唔再顯示旁邊嘅「港式 MBTI」文字。
- **保留中間大「MBTI」作為唯一視覺主標題**。
- logo 連結保留返回主頁功能，並加 `aria-label="港式 MBTI 主頁"`。
- logo 圖片改用空 `alt=""`，由連結統一提供讀屏名稱，避免重複朗讀。
- 中間標題改為 `<h1 class="home-hero-mbti" aria-label="港式 MBTI">MBTI</h1>`，視覺同文件語義都保留完整產品身份。
- 桌面導覽左上嘅正常細字「港式 MBTI」保留；冇改桌面層 v3 嘅版面規則。

## 1. 根因

原本上方品牌文字係：

```html
<h1 class="font-black text-[19px] tracking-tight">港式 MBTI</h1>
```

但 `index.html` 舊有：

```css
.home-hero h1{font-size:2.35rem;line-height:1.25;letter-spacing:-.02em}
```

`.home-hero h1` 嘅 specificity 高過 Tailwind 嘅 `text-[19px]`，所以實際字級變成 `2.35rem`，而唔係預期嘅 19px。呢個亦解釋咗點解品牌名喺手機突然變大。

今次唔係再用更高 specificity 硬縮上方文字，而係移除重複標題，同時刪走呢條舊規則，避免佢反過來縮細中間新 H1 嘅響應式字級。

## 2. 修改位置

| 檔案 | 修改 |
|---|---|
| `index.html` | 移除 `#homeLogoLink` 入面嘅品牌 H1；logo 連結加無障礙名稱、44px 觸控範圍及鍵盤焦點；中間 `.home-hero-mbti` 改做唯一 H1；移除舊 `.home-hero h1` 字級 override。 |
| `VERSION` | 升至 `2.0.2`。 |
| `manifest.json`、`sw.js` | 經 `bash tools/sync-version.sh` 同步版本及 cache `hk-mbti-v2.0.2`。 |
| `tools/ui/home_branding_test.js` | 新增 13 項回歸：logo-only、讀屏名稱、唯一 H1、中間字級 selector、44px 觸控範圍、鍵盤焦點、桌面品牌名保留。 |
| `tools/ui/premium_test.js`、`tools/ui/tailwind_static_test.js` | 更新故意鎖定嘅版本預期至 2.0.2。 |
| `README.md` | 最新版本及接手文件指向 v2.0.2。 |
| `docs/DESKTOP-HANDOFF.md` | 頂部對照版本更新至 2.0.2；註明桌面層 v3 冇改。 |
| `docs/AI-HANDOFF-v2.0.1.md` | 頂部加指向本文件嘅其後更新提示；舊部署及測試紀錄保留作歷史。 |
| `store-listing/*` | 更新相關建議稿及 changelog；只係草稿，未提交 Play Console。 |

冇改題目、答案、計分、紀錄格式、語音、付款、wrapper、權限或 billing。

## 3. 最終驗證

2026-11-10 本機結果：

- `SHIP_DRY=1 sh tools/ship.sh x`：**最終 11/11 組出貨閘全部通過**。
- UI：**28 個測試檔、1106 個斷言全部通過**；包括新品牌標題 13/13。
- Preflight：**35 項通過**。
- 題庫：109 題結構／計分／文法／重複錯誤為 0。
- 朗讀：12 項通過，767 段音檔齊；今次冇改錄音。
- Chromium 幾何閘通過。
- 真瀏覽器截圖檢查：390×844 日間、390×844 深色、1440×1000 桌面。
- 手機上方只剩 36×36 logo；中間標題 computed font-size 為 89.7px，冇被舊規則縮細。
- 三個畫面均係主頁唯一 H1、冇 JS page error、冇橫向溢出；桌面品牌導覽同 16 型色牌正常。

## 4. 部署後要做

1. 用正常 `main` push 流程發佈，唔好 force push。
2. 核對遠端 commit，再等 GitHub Pages 完成；push 成功唔等於 live 已生效。
3. 核對 live `VERSION`／`manifest.json` 為 `2.0.2`，`sw.js` 為 `hk-mbti-v2.0.2`。
4. 用 Android App 實機關閉再重開，確認上方只剩 logo、中間只有一個大 MBTI、主題切換、色牌同「立即測試」正常。
5. 確認舊紀錄、未完成進度、離線同分享卡冇受影響。
6. 今次純 PWA 內容更新，**唔需要新 AAB**；商店截圖如要更新，應重拍首頁，但唔好未核對就提交 Play Console。

## 5. 仍然未完成

- 學生／在職身份選擇及題目情境分流：**未實作**。
- Play 沙盒付款：按 owner 決定暫緩；正式推廣收費前用未購買帳號補測。
- TalkBack／VoiceOver、放大字體、外接鍵盤實機驗收。
- 商店截圖、Data safety 及商店正式文案核對／提交。
- 心理測量驗證；唔好聲稱「準確診斷」或「香港常模」。

v2.0.1 完整修改及部署驗收：[`AI-HANDOFF-v2.0.1.md`](AI-HANDOFF-v2.0.1.md)。  
桌面層原有鐵律：[`DESKTOP-HANDOFF.md`](DESKTOP-HANDOFF.md)。
