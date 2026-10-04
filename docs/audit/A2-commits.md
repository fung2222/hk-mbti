# A2 · 最近 15 commit 審計（靜默回歸／鐵律）

- 範圍：`43ba709` … `ea257fb`（HEAD），基準 `4cb6ee3`（最舊嗰個嘅 parent）。15 個 commit 全部 2026-10-04。
- Repo：`/opt/data/repos/hk-mbti`。工作樹乾淨。**冇改 repo、冇 push、冇 tag、冇改版本號。**
- 方法：`git log -15 --stat` ＋ `git diff 4cb6ee3..HEAD`（`index.html`／`pair-data.js`／`sw.js`／子頁 HTML）；鐵律對 `roy-standing-record.md`、`premium-tier.md`、`page-navigation.md`、`AGENTS.md`。行號係 HEAD。
- 事實 vs 推測：下面標「事實」先係證據；「推測」唔當違規。

## 摘要

| 級 | 數 | 一句 |
|---|---|---|
| 高 | 1 | 配對黑夜色寫漏 `html.dk`、又唔喺 `#dark-layer`，淺色模式被靜默蓋過，正文對比約 2:1 |
| 中 | 3 | 空狀態寫死「只有 INFP」；舊紀錄文案叫免費功能「完整版」；52 篇跨型配對用「你」 |
| 低 | 2 | 桌面規則寫喺主 `<style>`（有雙重閘，手機像素冇變）；`sw.js` 註解錯字 |

---

## 高

### H1 · 配對黑夜色無條件生效，淺色被蓋過

- 嚴重程度：高
- 引入：`95de24b`（`git blame` L732）
- 證據：
  - 淺色定義 `index.html:169-171`（`.pair-go` 字色 `#7C6B45`、`.pair-ol li` `#6b6560`、`.pair-x` `#A08A5C`）
  - 同檔再定義 `index.html:732-734`，**冇** `html.dk` 前綴：`.pair-go{…color:#D9B26A}`、`.pair-ol li{color:#A79E92}`、`.pair-x{color:#C0A87A}`
  - 兩組都喺主 `<style>`（L42–735），唔喺 `<style id="dark-layer">`（L1059 先開始）
  - 後定義優先：L732 蓋走 L169 嘅 `color`／`background`／`border-color`。淺色、黑夜都食同一套
  - 卡底係白：`index.html:640` `.card{background:white}`
  - 對比（WCAG relative luminance，本審計計，唔係真機截圖）：
    - `.pair-go` 字 `#D9B26A`／白 = **1.99:1**（原設計 `#7C6B45`／紙色 `#FAF7F0` = 4.85:1）
    - 清單 `#A79E92`／白 = **2.64:1**（原 `#6b6560`／白 = 5.74:1）
    - `.pair-x` `#C0A87A`／白 = **2.30:1**（原 `#A08A5C`／白 = 3.34:1）
  - 掣自己嘅底被改成 `rgba(217,178,106,.12)`，淺金洗喺白卡上，對比唔會好過「字／白」
- 鐵律：新 `html.dk` 規則要入 `#dark-layer`，而且只准喺黑夜改色（`premium-tier.md`、`roy-standing-record.md`）。同名 selector 後寫贏前寫。
- 影響：預設淺色（跟系統未揀黑夜）開配對頁，11px 掣字同 13px 清單跌到 AA 4.5:1 以下。手機、桌面一樣中，因為規則冇包 `@media`。
- 建議：刪 L732–734；把同等規則寫入 `#dark-layer`，selector 必須 `html.dk ` 開頭。唔好留無前綴副本。
- 範圍外（唔計入今次數）：L730–731 `.pr-sim`／`.pr-note` 同樣冇 `html.dk`，`4cb6ee3..HEAD` 嘅 diff **冇**加呢兩行，15 commit 之前已存在。修 H1 時可一併，但唔係呢 15 個 commit 引入。

---

## 中

### M1 · 未寫配對嘅空狀態仍然寫「只有 INFP」

- 嚴重程度：中
- 引入：`95de24b` 寫死；其後 `bd7dc4b`／`41aabe4`／`87e63c6`／`ea257fb` 加料但冇改呢句
- 證據：`index.html:6562`
  - 字面：`而家已經有 <b>INFP</b> 同其他 15 型嘅配對，其他組合會陸續補上。`
  - 事實（`node` eval `pair-data.js`）：100 個 key、0 非法型號、0 反向重複、0 篇缺 4 段。完成行 8 個：`INFP ENFP ISFJ ESFJ ISTJ ESTJ ISFP ESFP`。同 commit message「總 100 篇／8 行」一致，**數量本身冇講大**。
- 鐵律：文案唔准寫死數量；同實際不符要改（`premium-tier.md`）。
- 影響：撳未寫組合（例如 INTJ×ENTP）會見到「只有 INFP 有文」，但另外 7 行已經齊。唔會白屏。
- 建議：唔好寫死型號。用 `window.PAIRS` 數完成行再填，或者只寫「呢一對仲未寫，其他組合會陸續補上」唔點名。

### M2 · 免費個人化報告仍被叫「完整版」

- 嚴重程度：中
- 引入：`43ba709` 寫 L4680；`fe66f91` 抽走 D 卡閘同「完整版 · 你嘅個人化報告」標題，**冇改呢句**
- 證據：`index.html:4680`
  - `重新做一次測試，就會有返「傾向程度」同完整版個人化報告。`
  - 同檔 D 卡標題已係「你嘅個人化報告」（diff 入面 `fe66f91` 改 L4648 一帶）。`renderPersonalReport` 已冇 `getTier()` 閘。
  - 收費閘仲喺該在嘅位：`index.html:6012` `if(i > 0 && window.getTier() !== "full")`。`openDeepChapterFromType`（L6322）係叫返 `openDeepChapter`，冇繞閘。
- 鐵律：已免費嘅卡唔准標「完整版」（`premium-tier.md` 2026-10-04 定位）。
- 影響：只喺「修復前舊紀錄、而且同最近一次測試唔同型、冇 `pct`」先出。窄路徑，但是用戶睇到嘅字，同剛改嘅定位相反。`personal_report_test.js` 只 grep D 卡 HTML 冇「完整版」，掃唔到呢句，所以測試綠咗都漏。
- 建議：L4680 改做「傾向程度」同「個人化報告」，刪「完整版」。守門加一條掃 `_noPctNote`。

### M3 · 跨型配對用「你」，同一篇兩邊讀會錯邊

- 嚴重程度：中
- 引入：`pair-data.js` 全檔係呢 15 commit 新增（`4cb6ee3..HEAD` +297／−0）
- 證據（`node` eval，唔係估）：
  - 100 篇。字元「你」120 次；其中「你哋」2、「『』／「」內」41、其餘裸「你」77，分佈 57 篇。
  - 跨型（key 兩邊唔同）有裸「你」：**52 篇、71 次**。自配對 5 篇（兩邊同一型，「你」唔會錯邊，影響低）。
  - 例子：
    - `pair-data.js:34` `INFJ 想幫你解決問題，INFP 淨係想被聽`（`INFP|INFJ`；INFJ 讀會以為「你」係自己）
    - `pair-data.js:45` `ENFJ 主動照顧同記得你講過嘅小事`
    - `pair-data.js:79` `ESFP：出口前停一秒，你嘅直接對佢係重擊`
    - `pair-data.js:110` `ISFJ 記得你所有細節`
  - 簡體專用字掃描（`pair_test` 清單再加 国后从当经现问题关开并进书长个）：**0**。emoji：**0**。`<` `>` `&`：**0**（現況 innerHTML 直插唔會爆 tag；見下方「核對過」）。
- 鐵律：配對文用型號＋「嘅人」，唔准用「你」——同一篇兩個方向都讀（`premium-tier.md` B 模組）。`pairKey`（`index.html:6548-6549`）反向 key 共用同一篇，所以呢條係實害唔係文風。
- 影響：52 篇跨型文有機會對其中一方講錯對象。唔係導覽／收費故障。
- 建議：唔好全域把「你」替換。逐句改：對話引號入面可以留；「你哋」另計；裸「你」改成型號。自配對 5 篇優先級低。守門應掃裸「你」，而唔係只掃簡體字。

---

## 低

### L1 · 配對桌面寬度規則唔喺 `#desktop-layer`

- 嚴重程度：低
- 引入：`95de24b`
- 證據：`index.html:175` `@media (min-width:768px){ html.dt #pair > *{max-width:760px;margin-left:auto;margin-right:auto} }`，喺主 `<style>`，唔喺 L739 `#desktop-layer`。
- 事實：有 `@media (min-width)` **同** `html.dt`，手機（<768 或冇 `.dt`）唔會中。`4cb6ee3..HEAD` 冇改現有手機 selector 嘅 px／display／位置。
- 影響：手機像素冇變。只係桌面規則混入手機命脈 stylesheet，之後 md5／抄寫容易漏閘。
- 建議：搬入 `#desktop-layer` 現有 `@media (min-width:768px)` 段，selector 保持 `html.dt`。

### L2 · `sw.js` 註解「買一個檔」

- 嚴重程度：低
- 引入：`3cb7a48`
- 證據：`sw.js:19` `買一個檔 404 就會連累成個 precache`。下句 L20 先講清楚係改 `allSettled`。
- 影響：運行冇影響。`CACHE` 仍係 `hk-mbti-v2.0.0`（L1），冇改版本。推測係「任一」筆誤。
- 建議：註解改「任一」，邏輯唔好郁。

---

## 核對過，冇問題

- **emoji（畫面／app 碼）**：`index.html`、`pair-data.js`、`sw.js`、`privacy/record/stats/tee.html` 呢 15 commit 新增行冇 preflight 禁字（`⚠`／彩色 emoji／`←→`）。解鎖／賣點字眼冇加 marketing emoji。`docs/FREE-VS-PAID.md` 有 `✅`、`store-listing/aso-plan.md` 有 `✅`／`⚠️`、測試檔有 `★` —— 唔入 `preflight.py`（只掃 `*.html`），唔算畫面違規。
- **版本四處**：`VERSION` = `2.0.0`；`manifest.json:12` = `2.0.0`；`sw.js:1` `CACHE = "hk-mbti-v2.0.0"`；畫面 chrome `index.html:2111` 同 `:2453`「版本 v2.0」（freeze 號只去兩段，同 `preflight.py` 一致）。呢 15 commit 冇改呢四樣。
- **手機像素**：diff 冇改現有手機規則嘅 px／尺寸／位置。新 class（`.pair-*`、`.text-ink`）係新畫面自己嘅樣式，唔係改舊版面。色被蓋過見 H1，唔算像素回歸。
- **`.hidden`**：新增 CSS 冇覆寫 `.hidden` 嘅 `display`。桌面層現有覆寫帶 `:not(.hidden)`（例如 `html.dt #result:not(.hidden)`），唔係呢 15 commit 引入。
- **`calc(50% - 50vw)`**：全 repo HTML 只得 `index.html:747` 註解「唔用」。新增行冇。按鐵律，註解提到禁用寫法唔算違規。
- **返回鍵**：`index.html` 15 個 `.page-back` 全部 `onclick="goBack()"`（含新配對頁 L1889）。子頁 `back-nav` 用 `siteBack()`（同源 `history.back()`，直開先 fallback `./`），符合 `page-navigation.md`。冇跳指定頁。
- **畫面互斥**：`<section id>` 17 個，同 `window.show` 隱藏清單（L3251，`f7c1b1b` 補 `pair`）一致，冇漏、冇多。`restoreNav` 有 `pair` 分支（L5436）。
- **免費／收費紅線（除 M2 嗰句）**：測試、5 軸 % ＋逐條解釋、個人化報告（最似 3 型＋盲點）冇閘。第 2–9 章閘仍在 L6012。配對深入冇 tier 閘 —— 事實係免費放出，**冇**鎖紅線項目。推測：文件寫過 B 係未來加值，而家免費係產品選擇，唔當違規。
- **繁體**：`pair-data.js` 簡體專用字 0（見 M3）。`aa507b2` 嘅「为」守門係測試檔字串，唔係畫面殘留。
- **靜默覆蓋 · `window.X = function`**：全 shipped `*.html`／`*.js` 只得 `window.show` 兩次（L3227 真身、L5251 wrapper）。wrapper 先存 `_origShow` 再呼叫（L5250–5252），冇蓋走隱藏清單。呢 15 commit 改嘅係真身清單（L3251），唔係 wrapper。其餘 `window.X =` 重複係 `typeof` 檢查或狀態寫入，唔係第二個函數定義。
- **靜默覆蓋 · `function` 宣告**：頂層 `function` 0 個同名重複。`const esc`／`closeList`／`mk` 各出現喺唔同函數（`formatChapterHtml`／`formatGuideHtml`／`formatTypeFullHtml`、`renderTypeTabs`／`renderHubSceneList`），`const` 函數 scope，唔會互蓋。
- **style id**：`index.html`／子頁冇重複 `id`。`record.html` 有兩個無 id 嘅 `<style>`（L31、L218），唔係同 id 互蓋。
- **硬編碼型號清單**：`window.TYPE_ORDER`（L6776）16 型齊。`show()` 清單齊。配對 key 100 個合法、無反向重複。寫死進度只得 M1 那句。
- **`closeNote` TDZ**：只剩 L4681 一處宣告，使用喺 L4710，宣告在前。`ed72728` 嘅搬位喺最終檔係成立嘅。
- **SW precache**：`3cb7a48` 加 `/hk-mbti/pair-data.js`、`/hk-mbti/tailwind.css`（`sw.js:7-8`），兩檔都在。`install` 改 `allSettled` 係註解講明嘅取捨，唔係靜默刪 cache 名。
- **Tailwind `<link>`**：五頁都喺 `</head>` 之前、`</style>` 之後（例如 `index.html:1153`、`privacy.html:210`）。同 `docs/FREE-VS-PAID.md` 講嘅 CDN `document.head.append` 次序一致。冇插進 `<style>` 入面。
- **hash／NAV 冇 `pair`**：`MAP`（L1298–1303）同 `NAV`（L3367–3372）冇 pair。事實：配對唔係選單頁，入口係 `openPair()`，返回靠 `goBack`＋`restoreNav`。推測：而家冇 `#pair` 連結，所以未爆。唔當違規；要深連結先補，而且要帶 `pairA`／`pairB`，空 hash 入去只會見 M1 嗰句。

## 唔算發現（避免誤報）

- `window.show` 雙定義係有意串接，唔係今次靜默蓋函數。
- 新配對頁嘅 `font-size:11/13/22px` 喺字級 scale 內，而且係新元素，唔係改手機舊版面。
- commit message 嘅 58／81／100 篇同 8 行，同 `pair-data.js` 實數一致。
