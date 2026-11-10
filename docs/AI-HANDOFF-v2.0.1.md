# 港式 MBTI v2.0.1 · 修改及 AI 交接文件

日期：2026-11-10  
適用對象：下一位接手開發嘅 AI／開發者  
狀態：**已於 2026-11-10 部署（commit `ec8104d`）。下方「§0 部署後驗收記錄」為 push 後實測結果；本文其餘章節保留 push 前嘅修改說明。**

> **其後更新：** 首頁重複品牌標題已喺 v2.0.2 修正。接手請先睇 [`AI-HANDOFF-v2.0.2.md`](AI-HANDOFF-v2.0.2.md)，再用本文查 v2.0.1 完整細節。


## 0. 部署後驗收記錄（2026-11-10，接手 AI 實測）

**部署**
- Commit：`ec8104d`（`main`）；工作區乾淨，冇再追加 commit。
- GitHub Pages 已更新：live `index.html` md5 同本地一致（`2641ea3e18ac16a252d2ea1825eda0b7`）。
- live `sw.js` CACHE = `hk-mbti-v2.0.1`，activate 只清 `hk-mbti-` 前綴舊 cache；live `VERSION` 及 `manifest.json` 均為 `2.0.1`。

**測試（全綠）**
- `SHIP_DRY=1 sh tools/ship.sh x` → 11/11 組閘通過（exit 0）。
- `python3 tools/preflight.py` → 35 項；`node tools/question_audit.js` → 109 題、0 錯；`node tools/voice_test.js` → 12 項。
- 音檔：本地 767 個 MP3；`tools/voice-manifest.json` count 767／items 767／rate `+15%`；live 抽驗 200。
- Owner 已親耳聽 18 段新錄音（`audio/o/*` 17 段 + `audio/q/2e2424a30cf7.mp3`），音量／語速 OK。

**真瀏覽器實測（live，390×844）**
- BB 10 題 → 結果 ESTP；進階 30 題 → INTJ；生活 60 題 → ENTP；進度字樣為 `1 / 10 · BB版`、`1 / 30 · 進階版`、`1 / 60 · 生活版`。
- 分享卡生成 720×1280 PNG；下載成功，檔名 `港式MBTI-ENTP-T.png`。
- 紀錄：3 筆新紀錄 reload 後仍在；另塞 2 筆 v2.0.0 格式（**冇 `id`**）舊紀錄，reload 後原封不動，`record.html` 正常顯示。
- 離線：Service Worker 接管後斷網 reload 仍可開 App（只有預期嘅 `ERR_INTERNET_DISCONNECTED` console 記錄）。
- 無障礙：viewport 可縮放；`.option` 係 `<button>`＋`aria-pressed`；`#qProgress` 有 `aria-live="polite"`；鍵盤 Enter 可答題並前進；`#appDialog` 有 `role/aria-modal/aria-labelledby/aria-describedby`；可見 `<h1>` 只有「港式 MBTI」；`lang=zh-HK`。

**Play**
- 商店頁 live：`com.fung2222.hkmbti`（HTTP 200）。PWA／TWA 內容隨網頁更新，**唔需要新 AAB**；今次冇改 wrapper／權限／billing，亦冇提交新 AAB 或改商店正式資料。

**仍未做（交下一位）**
1. **Google Play 沙盒付款**：owner 決定暫緩（暫時冇人會買）。測試者帳號本身已解鎖（full），所以見唔到解鎖頁；要另開未購買帳號或退款後再測。五個情境：成功／取消／斷網／恢復／退款後。
2. TalkBack／VoiceOver、放大字體、外接鍵盤實機驗收。
3. 商店截圖未因 v2.0.1 UI 改動重拍；Data safety 未按實際請求核對。
4. 心理測量驗證（認知訪談、item analysis、test-retest、因素結構）仍未做；未做前唔可以聲稱「準確診斷／香港常模」。
5. 商店文案（`store-listing/*`）仍係建議稿，未提交。

---

## 1. 今次目標同範圍

保留原有 Vanilla HTML/CSS/JavaScript SPA、GitHub Pages PWA、Service Worker 離線功能、Google Play/TWA 內容更新方式同 Play Billing 流程，集中修正：

- 首屏、離線同分享卡可靠性
- 付款未確認時誤解鎖嘅風險
- 計分同歷史紀錄一致性
- 手機縮放、鍵盤、彈窗及減少動態效果支援
- 桌面結果頁重疊
- 統計、私隱及商店文案嘅過度聲稱
- 部分題目嘅構念污染、社會期許同醫療安全字眼
- 改題後缺少粵語預錄語音

冇改動 109 題題庫數量、三個測試長度、五軸框架、16 型結果架構或收費內容架構。

## 2. 主程式 `index.html` 改動位置

以下用 ID／函數／CSS selector 定位；行號會隨後續修改改變，唔好當永久定位。

### 2.1 首屏、PWA 同更新

- `<head>` viewport：移除 `maximum-scale=1.0` 同 `user-scalable=no`，恢復雙指縮放。
- `window.revealApp`：首屏唔再依賴 `window.load`；立即顯示，另有 500ms 保險。GoatCounter 或 Google Fonts 失敗唔應再令 App 隱形。
- Service Worker 註冊失敗只記錄／忽略，唔阻礙首屏。
- 首頁可見「港式 MBTI」改為唯一主要 `<h1>`，改善文件結構。

### 2.2 答題介面同無障礙

- `#qProgress` 加 `aria-live="polite"`；`renderQ()` 將完整進度只寫入呢個容器，修正舊式 `1 / 10 · BB版 / 60` 重複計數。
- `renderQ()` 嘅 `.option` 由 `<div>` 改為 native `<button type="button">`，加 `aria-pressed`；`selectOpt()` 同步更新 `.selected` 同 `aria-pressed`。
- `.option` 補全闊、繼承字型、左對齊同 `:focus-visible` 金色外框。
- `#appDialog` 加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="adTitle"`、`aria-describedby="adBody"`。
- `appDialog()` 記錄及恢復之前焦點；開窗後聚焦取消／確定；支援 Tab focus trap 同 Escape。
- 主頁輪盤尊重 `prefers-reduced-motion`：用戶要求減少動態時，唔自動轉或自動恢復。
- 個人報告嘅盲點標題顏色統一；`.scenario-badge` 基本字級由 12px 加到 13px。

### 2.3 桌面結果頁

- `<style id="desktop-layer">` 嘅 `#result` grid：移除互相衝突嘅第二個 `grid-template-areas`。
- 免責聲明用 `html.dt #result > p.text-center{grid-area:note}`，避免 `.text-center` 被誤編入 `meta` 區，同標題重疊。
- 已實測 1440px：分享卡底部喺免責聲明之前，兩者唔再重疊。

### 2.4 計分一致性

- `calcScore()` 以實際 deck、題目文字同答案組成 `sig`。
- 新增 FNV 風格 `tieValue(key)`；`decide()` 同 T/A 平手改用穩定 hash，唔再用 `Math.random()` 或隨機 `state._tb`。
- 同一組題目同答案重新計算會得到同一結果；唔代表兩次隨機抽唔同題都必然同型。
- 「計分方法同限制」文案已解釋呢個平手處理。
- 移除「4–6 星期約一半轉型」呢類過度固定講法，改為重測變化受版本、相隔時間同樣本影響。
- 「傾向程度」註釋改為本次作答計分比例，唔再叫「真實百分比」。

### 2.5 分享卡

- 新增 `#shareCardLoading`、`#downloadCardBtn`、`#shareResultBtn` 狀態處理。
- `setCardLoading()` 喺生成期間顯示狀態並停用圖片掣。
- `generateCardImage()` 冇結果時安全返回；完成或失敗都會解除 loading；失敗有中文提示。
- `renderCardBody()` 成功建立圖片後先顯示 `#shareCardImg`。
- 已實測 720×1280 PNG 生成及下載，檔名示例：`港式MBTI-INFP-T.png`。

### 2.6 紀錄同本機統計

- 儲存紀錄以穩定 record ID 識別，唔再因同型、同名、同版本兼三分鐘內完成而刪走另一筆紀錄。
- `clearHistory()` 同時清走 `hkmbti_type_counts` 同 `hkmbti_last_score`，避免清除後殘留統計。
- `getTypeStats()` 只返回固定參考基線；本機答案唔再混入外部比例。
- `renderHomeStats()` 移除香港人口换算同舊 `hkStatsPop`／`hkStatsSample` 欄位。
- 首頁及頁尾統一名稱為「16型參考比例」，並註明唔係香港調查或全港人口估算。

### 2.7 Play Billing 安全閘

- `buyFull()` 冇收到 purchase token：付款流程以 fail 完成、顯示「未能確認購買」、保持免費版。
- acknowledge 失敗：顯示「購買待確認」、保持免費版，提示稍後恢復購買。
- 只有 token 存在兼 acknowledge 成功，先執行 `window._setTierFull()`。
- **只有 mock 測試，未等同 Google Play 真實扣款驗收。** 實機沙盒仍要測成功、待確認、取消、恢復、退款／撤銷同斷網。

## 3. 題庫具體修訂

以下 10 題保留原軸向同 0/1/2 向量，除特別註明外冇改分數：

1. `#3 E/I - 群組`：E 選項由怕人覺得唔尊重，改為即刻覆並開啟話題，直接量度社交主動性。
2. `#5 E/I - 傾電話`：移除 missed-call 焦慮，改為直接互動。
3. `#43 T/F - 評價`：T 改為具體、建設性坦白；F 改為先肯定並保護感受，唔再係粗魯 vs 虛偽。
4. `#47 T/F - 投訴`：F 選項改為理解情況、表達感受，唔再等同「算數／唔處理」。
5. `#54 T/F - 朋友反對`：**修正錯配計分**；C「列理由按原則」改 T1/F0，D「照做唔想嘈交」改 T0/F1，維持全題 3:3 平衡。
6. `#55 T/F - 同事踩你`：T 改為核實事實；F 改為關係影響，唔再係對質 vs 逃避。
7. `#61 J/P - Deadline`：P 唔再等同申請延期，改為按臨場狀態調整最後衝刺。
8. `#89 J/P - 跟朋友學嘢`：P 唔再等同甩底，改為按大家進度彈性配合。
9. `#94 T/A - 壓力`：問題同選項改為反覆思考／恢復速度，唔再將健康應對方法硬分成好或壞。
10. `#102 T/A - 睇醫生`：移除「朋友話冇事就等」及「食粒藥瞓下就算」，避免唔安全醫療暗示。

**限制：** 呢啲係內容層面修訂，唔係心理測量驗證。`altIssues` 嘅文字相似度提示只係啟發式檢查，唔應當成題目無效證據。

## 4. 其他頁面同 PWA 檔

| 檔案 | 改動 |
|---|---|
| `stats.html` | 改為「16型參考比例」；只顯示固定參考百分比；唔混本機答案、唔换算香港人口；補非代表性提示；恢復縮放。 |
| `privacy.html` | 恢復縮放；保留單一 H1；本地儲存聲明只涵蓋姓名／暱稱、答案及紀錄；加入 Google Fonts 一般連線資料披露；日期及版本更新。 |
| `record.html` | 恢復縮放；導覽名稱改為「16型參考比例」。 |
| `sw.js` | cache 改為 `hk-mbti-v2.0.1`；activate 只刪 `hk-mbti-` 前綴嘅舊 cache，唔再誤刪同源其他 App 資料。 |
| `manifest.json`、`VERSION` | 版本同步為 `2.0.1`。 |
| `voice-data.js` | 更新題目／選項文字至音檔 map。 |
| `tools/voice-manifest.json` | 記錄 `zh-HK-HiuGaaiNeural`、`+15%`，合共 767 段有效音檔。 |
| `audio/q/`、`audio/o/` | 新增 18 段改文後錄音，清走 18 段不再使用嘅舊錄音；總量維持 767。 |

## 5. 工具同測試改動

- `tools/preflight.py`：cache 檢查改為要求 App 前綴清理；版本檢查維持。
- `tools/question_audit.js`、`extract_bank.js`、`question_audit_detail.js`：預設路徑改為相對 repo；詳細審計唔再寫死舊題號 `#112`。
- `tools/deeplink_test.js`：選單預期文字改為「16型參考比例」。
- `tools/desktop_render_test.py`：統計斷言改為固定基線／非人口估算；封阻外部字型請求；次頁用 DOM ready，避免第三方網絡令測試假死。
- `tools/ui/mobile_debug_fixes_test.js`：移除舊人口／樣本欄位預期，改驗參考比例提示。
- `tools/ui/overlay_hide_test.js`：改驗只清本 App 舊 cache。
- `tools/ui/personal_report_test.js`：配合 13px 字級同盲點標題規則；顏色規則用靜態斷言，避免 jsdom cascade 誤報。
- `tools/ui/premium_test.js`、`tailwind_static_test.js`：版本預期更新至 2.0.1。

下次再 bump 版本時，要同步更新呢啲故意鎖版本嘅測試，唔好為咗轉綠而跳過。

## 6. 商店文件（只係建議稿）

已更新：

- `store-listing/full-desc-play.txt`
- `store-listing/full-desc.md`
- `store-listing/whats-new.txt`
- `store-listing/changelog.md`
- `store-listing/README.md`
- `store-listing/data-safety.md`

主要修正「真實百分比」、「唔收集個人資料」同完全本地嘅過度概括。Data safety 舊稿有矛盾，已改成人工核對指引；**唔好未睇現行 Play Console 定義就照搬答案。**

`whats-new.txt` 同商店完整描述係 v2.0.1 建議稿，尚未提交。PWA 內容部署同 Play 商店文案係兩個步驟，唔好當其中一個完成就代表另一個完成。

## 7. 已完成驗證

2026-11-10 本機結果：

- `SHIP_DRY=1 sh tools/ship.sh x`：**11 組出貨閘全部通過**，冇 commit／push。
- Preflight：**35 項通過**。
- UI：**27 個測試檔、1093 個斷言全部通過**。
- Chromium 桌面／手機幾何：**120 項通過**。
- 題庫：109 題；結構、計分、文法、重複錯誤為 0；#54 軸向已重新平衡。
- 朗讀：**12 項通過**；327 條題目（含變體）、436 條選項、4 個字母，767 段音檔齊。
- 真瀏覽器流程：BB 10、進階 30、生活 60 全部完成，結果為預期 INFP-T，冇頁面 JS error。
- 390px 無橫向溢出；1440px 結果頁無重疊。
- 分享卡生成、下載、同題同答案計分一致：通過。
- 彈窗焦點／Escape、減少動態、清除紀錄連同類型次數：通過。
- 模擬冇 token：保持免費；模擬 acknowledge 失敗：保持免費；模擬 acknowledge 成功：解鎖。
- `stats.html`、`privacy.html`、`record.html`、`offline.html`：通過。
- Service Worker 控制後離線 reload：通過。
- 測試時封阻所有外部 HTTPS，首屏仍然顯示。

## 8. 下一位 AI 嘅執行流程

### A. 接手及檢查

1. 先睇 `AGENTS.md`、本文件、`docs/DESKTOP-HANDOFF.md`。
2. 確認 `VERSION`、`manifest.json`、`sw.js` 係 2.0.1。
3. 確保 767 段音檔存在；唔好只帶走 HTML 而漏咗 `audio/`。
4. 如需 jsdom：`npm i --prefix tools/ui jsdom`。

### B. 再改內容時

- 改題目後：跑 `node tools/question_audit.js`，再補錄音。
- 沿用現有聲音嘅命令：

```bash
python3 tools/gen_voice.py --voice zh-HK-HiuGaaiNeural --rate +15%
node tools/voice_test.js
```

- 如要清舊音檔，確認 map 正確後先加 `--prune`。
- 改完版本：更新 `VERSION`，再跑 `bash tools/sync-version.sh`；檢查鎖版本測試同商店文件。
- 每次發佈都要用新 cache 名，唔好重用 `hk-mbti-v2.0.1` 承載下一批不同內容。

### C. 發佈前

```bash
python3 tools/preflight.py
node tools/question_audit.js
node tools/voice_test.js
SHIP_DRY=1 sh tools/ship.sh x
```

另做實機測試：Android 手機、桌面 Chrome、舊版升級、離線開 App、螢幕閱讀器／鍵盤、暗色、分享圖、Google Play 沙盒付款同恢復購買。18 段新錄音要人工聽一次發音同語速。

### D. 部署（由擁有者決定）

項目原流程係：

```bash
sh tools/ship.sh "v2.0.1 修正內容、無障礙、付款安全閘及語音"
```

呢個指令會 commit 同 push；未得到當時授權唔好自動執行。部署後要核對 live 版本、Service Worker 更新、舊紀錄、離線及真實購買。

一般純 PWA 內容更新會經現有 wrapper 更新，**今次冇重建或提交新 AAB**。如之後改原生 wrapper、權限、billing 設定或 asset links，就要另外評估 Android 套件及 Play 審核。

## 9. 仍然要做嘅工作

1. **真機及真實 Play Billing 驗收**：mock 綠唔等於正式付款安全完成。
2. **心理測量驗證**：內容審閱、認知訪談、item analysis、test-retest、因素結構、不同學生／青年群組偏差；未有呢啲數據前唔好聲稱「準確診斷」或「香港常模」。
3. **統計來源**：而家只係固定參考比例。如果要講香港分佈，必須另有清楚來源、抽樣方法、樣本及日期。
4. **商店截圖**：現有截圖未因今次 UI 改動重新拍攝；提交商店更新前用實機重做受影響畫面。
5. **私隱／Data safety**：部署後按實際第三方請求同當時 Play 定義逐項核對。
6. **無障礙實機**：程式層已改善，但仍需 TalkBack／VoiceOver、放大字體及外接鍵盤人工驗收。
