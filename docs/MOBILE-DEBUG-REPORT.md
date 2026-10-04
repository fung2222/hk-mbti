# 手機版除錯報告（2026-10-04）

審計對象：`/opt/data/repos/hk-mbti` `main` @ `a9ff4ab`（tag `desktop-v3-2026-10-04` 在父 commit `d139440`）。只讀 app code；本檔係唯一寫入。

探針：`/opt/data/profiles/apps/cache/scratch/mbti-audit-probe.js` ＋ `mbti-audit-probe2.js`（jsdom，唔開 server、冇截圖）。jsdom 冇 layout 引擎，排版數字係由 CSS 抽值計出嚟。

## 執行摘要

回歸測試全綠（UI 20 檔、desktop 56＋34、deeplink、record_view、voice 10、preflight 32），所以今次搵到嘅都係測試冇覆蓋嘅洞。冇整頁白屏、返回鏈主路徑（百科／人格／九章／場景文章）同解鎖閘門喺探針入面係行得通。

最嚴重唔係「撳唔到」，而係三類會靜靜出錯或者一眼睇到壞：**深入分析第 3／9 章清單把換行寫成可見字面 `<br>`（16 型都有）**、**結果頁「% 夾」每次重繪都亂數（人格頁已經改用穩定算法，註解自己寫明亂數會似 bug）**、**測驗 280ms 內連撳兩下會跳過一題，空答案唔計分**。另外字母卡切黑夜唔刷新底色（對比約 1.1:1），同 320px 有標題裝唔落。

P0：0。P1：5。P2：4。

## 測試實跑輸出

`export NODE_PATH=/opt/data/profiles/apps/cache/scratch/harness/node_modules` 之後實跑，全部 exit 0。

| 檔 | 結果 |
|---|---|
| `tools/ui/app_feel_test.js` | 46/46 通過 |
| `tools/ui/back_nav_test.js` | 29/29 通過 |
| `tools/ui/backkey_test.js` | 30/30 通過 |
| `tools/ui/boot_reload_test.js` | 25/25 通過 |
| `tools/ui/dark_mode_test.js` | 60/60 通過 |
| `tools/ui/dialogs_ab_test.js` | 30/30 通過 |
| `tools/ui/hub_consolidation_test.js` | 117/117 通過 |
| `tools/ui/hub_tiles_test.js` | 18/18 通過 |
| `tools/ui/letter_card_test.js` | 22/22 通過 |
| `tools/ui/letter_career_test.js` | 9/9 通過 |
| `tools/ui/letter_dim_test.js` | 5/5 通過 |
| `tools/ui/oneshot_delete_test.js` | 14/14 通過 |
| `tools/ui/premium_test.js` | 173/173 通過 |
| `tools/ui/reel_test.js` | 31/31 通過 |
| `tools/ui/result_page_test.js` | 51/51 通過 |
| `tools/ui/share_card_test.js` | 23/23 通過 |
| `tools/ui/type_pick_test.js` | 15/15 通過 |
| `tools/ui/type_tabs_test.js` | 87/87 通過 |
| `tools/ui/version_card_test.js` | 15/15 通過 |
| `tools/ui/wizard_test.js` | 14/14 通過 |
| `tools/ui/run.sh` | 20 檔全部通過，0 失敗 |
| `tools/desktop_layout_test.js` | 56/56 通過 |
| `tools/desktop_gate_test.js` | 34/34 通過 |
| `tools/deeplink_test.js` | 全部深層連結開到對應畫面（腳本冇印總條數；輸出結尾「全部深層連結都開到」） |
| `tools/record_view_test.js` | 全部通過（腳本冇印 N/N；結尾「兩個渠道都通…」） |
| `tools/voice_test.js` | 10/10 通過 |
| `tools/preflight.py` | 32/32 通過（含 emoji 硬檢查、onclick 定義、版本 2.0.0） |

## P0 壞（用唔到）

冇。探針入面：解鎖閘（免費第 1 章入到、第 2 章去升級頁、寫入 `hkmbti_tier=full` 之後第 2 章入到）、`goBack` 由人格返百科、由章節返目錄、由文章返百科場景詳情，都係預期頁。`window.show` 第二個定義（`index.html:5075–5084`）係包住第一個（`:3167`）再補分享提示／停朗讀，唔係同名蓋死。

## P1 一眼見到／錯位

### P1-1 深入分析清單把 `<br>` 畫成可見字

- 位置：`index.html:6287`（`bold()` 先 `esc`）＋ `:6307`（先把 `\n` 換成 `<br>` 再交俾 `bold()`）。資料：`premium-data.js:36–39`（第 3 章）同 `:91–95`（第 9 章）；16 型同一結構。
- 證據（事實，jsdom 叫 `formatChapterHtml(PREMIUM.INTJ.chapters[2].b)`）：輸出含 `- <strong>感官放縱</strong>：…亂買嘢&lt;br&gt;- <strong>執著細節</strong>`。`esc()` 把已經插咗嘅 `<br>` 變成 `&lt;br&gt;`，`innerHTML` 之後用戶見到字面 `<br>`，唔係換行。探針對 16 型嘅 chapter index 2 同 8 都標到 raw dash（即第 3 章「壓力爆煲時，你會變成點」、第 9 章「香港情境對照」）。
- 期望 vs 實際：清單每點一行。實際係一段裡面夾住可見 `<br>`。
- 建議最小修法：先 `esc`／`bold`，再把 `\n` 換成 `<br>`（`bold(b).replace(/\n/g, "<br>")`）。唔好先插 `<br>` 再 escape。
- 影響：`formatChapterHtml`、`#deepChapterBody`。第 2 章編號清單係空白行分段，行 `<ol>`，唔經呢條路，所以第 2 章冇呢個症狀。

### P1-2 結果頁「% 夾」每次重繪都變

- 位置：`index.html:4630` `Math.floor(Math.random()*15+85)`。對照 `:6045–6048` `typeCompatPct`（註解原文：「唔用 Math.random()（每次 render 都變會似 bug）」）。`viewHistoryResult`（`:5551`）每次都 `renderResult`。
- 證據（事實，同一份 `INTJ-A` 連續 `renderResult` 兩次）：第一次 `93% 夾, 88% 夾`，第二次 `99% 夾, 95% 夾`，`SAME false`。人格頁穩定值：`ENFP 84 | ENTP 84`（`typeCompatPct`，82–94）。結果頁範圍係 85–99，兩邊對唔齊。
- 期望 vs 實際：同一個配對永遠同一個百分比，同人格頁一致。實際係 85–99 亂數，離開再入（歷史還原）會變。
- 建議最小修法：`:4630` 改用 `typeCompatPct(type, c)`。`demo/desktop-full.html:4161` 有同一行，但嗰個係 demo，唔好當主站修。
- 影響：`renderResult`、`#compatibility`。

### P1-3 測驗 280ms 內連撳兩下會跳題

- 位置：`index.html:4282–4297` `selectOpt`。冇 in-flight lock（對 `selectOpt` 函數體搜 `_advancing|disabled` = false）。`finishTest`（`:4428`）有 `_finishing` 防重入，中途題冇。空答案喺 `calcScore`（`:4376`）直接 `continue`，唔計分。
- 證據（事實，jsdom，BB 版 `idx=0` 時 280ms 內 `selectOpt(0)` 再 `selectOpt(1)`）：700ms 後 `idxDelta=2`，`answers=[1,null,null]`，`unansweredBeforeCurrent=1`。即係第 1 題留低最後一撳，第 2 題空，畫面已經去到第 3 題。
- 期望 vs 實際：一撳只前進一題。實際係第二個 timeout 再 `idx++`，靜靜跳題；接近中間嘅軸可以因此翻邊（`closeAxes` 定義係分差 ≤1，`:4408–4413`）。
- 建議最小修法：`selectOpt` 開頭若已有 pending timeout 就 return；或者一撳即 disable `#qOptions`，timeout 先前進。最後一題唔使再加，`_finishing` 已經擋雙存。
- 影響：`selectOpt`、`renderQ`、`calcScore`。

### P1-4 字母卡切黑夜，底色唔跟，字同底都係淺色

- 位置：`openLetter` `index.html:6465–6466` 按當刻 `html.dk` 寫 inline `background`。`toggleTheme`（`:6803–6807`）只切 class ＋ 記住 localStorage，唔重繪。`#letterHero` 冇入 `#dark-layer`。字母淺底喺 `data.js:4,30,56,81,106,130,154,179`（`#FFF0E5` 等）。
- 證據（事實）：開 E 之後 `letterHero.style.background` = `rgb(255, 240, 229)`；加上 `html.dk` 之後仍然係同一個 rgb。對比（相對亮度公式）：8 個字母淺底 vs 黑夜 `--ink #ECE7DE` = **1.05–1.11**；vs 黑夜灰 `#D9D2C6` = **1.28–1.35**。WCAG 正文要 4.5:1。`#letterBig` 冇自己設色，跟 body `--ink`。
- 期望 vs 實際：切主題之後字母卡底色跟住變（開卡時已經有深色分支 `L.color+"2E"`）。實際 inline 底色凍住，深色字色規則一生效就係淺字淺底。
- 觸發（事實 vs 需真機）：平板／桌面 `#dtThemeBtn`（`:1126`）喺字母頁仍然喺度，一撳就中。手機主題掣只喺主頁（`:2045`），頁內選單冇主題項（`:3298–3306`）；手機要靠系統 `prefers-color-scheme` 喺未揀過主題時變（`:6811–6816`）先會中 —— 呢條路徑代碼在，視覺需真機。
- 建議最小修法：`toggleTheme`／`onSysTheme` 若 `_showing==="letter"` 就再叫 `openLetter(_lastLetter)`；或者底色改 CSS 變數，唔寫 inline。
- 影響：`openLetter`、`toggleTheme`、`#letterHero`。人格／場景／章節 hero 係漸變＋`color:white`，唔經呢個分支。

### P1-5 320px（部分 360px）標題裝唔落

算式（事實，由 CSS 抽值；字寬假設：CJK／全形 = 1em，ASCII = 0.62em，空格 = 0.33em）：

- `#app` `px-4` 被 `.page-hero{margin:-24px -16px}`（`:149`）抵消，viewport ≤ 448 時 hero 闊 = viewport。hero padding 16×2，列闊 = viewport − 32。
- 一般 h1（`:151`）：`padding:0 4.5rem`（72×2）、19px、`nowrap`＋`ellipsis`。文字盒 = viewport − 176。320px → **144px**；360 → 184；390 → 214；430 → 254。
- `#deepChapterTitle`（`:317`）蓋過字級／換行／padding：21px、`white-space:normal`、`padding:0 3rem`。文字盒 = viewport − 128。320px → **192px**。但 `:151` 嘅 `position:absolute` 同 `overflow:hidden` 冇被蓋過，列本身 `min-height:44px`（`:150`）唔會被絕對定位嘅 h1 撐高。

超出文字盒（事實）：

| 標題 | 估計闊度 | 320 | 360 |
|---|---|---|---|
| 壓力爆煲時，你會變成點（11 個全形 × 21px = 231） | 231px | 超出 192 | 360 文字盒 232，剛好貼邊 |
| 3 個可以即刻做嘅改變 | ~209px | 超出 192 | 入到 |
| 你睇唔到嘅 3 個盲點 | ~194px | 超出 192 約 2px（貼邊，當邊界） | 入到 |
| Group Project 隊友（場景 h1，走一般 19px／144px 盒） | ASCII 用 0.5em 都 ~164px | 超出 144，ellipsis 截走 | 360 盒 184，0.62em 估計 ~192，仍可能截 |

- 期望 vs 實際：章節名同場景名喺 320 部機睇得晒。實際長章節名必須折行或溢出；因為 h1 絕對定位，第二行會畫出 44px 列，同下面 `#deepChapterCrumb` 搶位。**重疊幾多 px 係推測，需真機**（jsdom 冇 layout）。截斷本身對「Group Project 隊友」係 CSS 事實（`nowrap`＋`ellipsis`＋文字盒 144 < 164）。
- 建議最小修法：`#deepChapterTitle` 唔好絕對定位，或者列 `min-height` 跟住行數；一般 h1 喺 `<380px` 減少左右 padding（而家 72px 係為 36px 選單留位，留 44px 已經夠）。場景名可將「Group Project」改做「小組專案」或者允許呢粒 h1 換行。
- 影響：`.page-hero-row h1`、`#deepChapterTitle`、`#socialArticleTitle`。

## P2 打磨

### P2-1 字重 800（鐵律只准 400/600/700/900）

事實，`font-weight:800`：

- `index.html:197` `.ad-title`、`:283` `.up-cmp .yes`、`:286` `.up-cta`、`:315` `.home-acc-lock`、`:573` `.result-more-btn`
- `record.html:92`、`:218`；`stats.html:36`；`tee.html:44`、`:68`；`privacy.html:74`

另外 `:32` Google font 係 `wght@400;500;700;900`，載咗唔准用嘅 500、冇載准用嘅 600。`font-weight:600` 在 `index.html` 有 5 處（例如 `:131`、`:177`），瀏覽器會合成或者跳去 500/700。最小修法：800→700，font URL 改 `400;600;700;900`。

### P2-2 字色超出 4 token

定案 token（`docs/UI-TODO.md` 第 39 項）：主 `var(--ink)`、次 `#6b6560`（dark `#A79E92`）、金 `#8B6F3D`（dark `#D8C69E`）、淡金 `#A08A5C`（dark `#C0A87A`）。

正文違規（事實，唔包 icon 場景色／白字色卡）：

- 攻略／章節內文 `.article-guide-body p/li` 用 `#374151`（`index.html:374,386,389`）。黑夜有覆蓋（`:495`、`:1060`），日頭唔係 token。
- `.q-ctrl` `#9ca3af`（`:177`）；`.home-more-down` `#8a7a5a`（`:503`）；`record.html` 多處 `#888`／`#555`／`#666`；`privacy.html:61` `#374151`、`:66` `#4b5563`；`tee.html:43` `#6b6b6b`；`offline.html:27,29` `#4a4640`、`:33` `#8b857c`。

場景 icon 色（`#C08552` 等）同刪除紅唔當正文 token 違規。最小修法：正文收到 4 token；subpage 要各自改（唔共用 `index.html` CSS）。

### P2-3 同一類 CTA 多過一種寫法

事實，按鈕文案並存：`立即選擇測試版本`（百科等多處）、`立即進行`（版本卡 `:2089` 起）、`立即開始`（結果頁 `:2383`）、`開始測試`（桌面 nav `:1128`）、`立即測試`（九章目錄腳 `:5794`）、`返主頁開始測試`（`stats.html:201`、`privacy.html:284`）、`看完整分析`（`:2363`）。唔係功能壞。若要統一，先定一句再替，唔好順手改版本卡「著燈 → 立即進行」流程（鐵律保留兩段式）。

### P2-4 第 9 章免責聲明單星冇轉

- 位置：`premium-data.js` `*MBTI 係性格參考，唔係心理診斷。*` 16 次（每型章節 9 結尾）。`formatChapterHtml` 只轉 `**...**`（`:6287`），單星原樣輸出。
- 期望 vs 實際：斜體或普通一句。實際用戶見到前後 `*`。
- 最小修法：資料改做普通句，或者 formatter 加單星規則。唔好同 P1-1 混成一次大改。

目錄卡 icon 雙重包 `.deep-ico`（`renderDeepTypeToc` `:5786` 再包 `deepIcoHtml` `:5767` 已經有嘅 span）係事實；svg 仍係 36px（`:301`），視覺差未能量到，唔當 P1。

## 需真機驗

- P1-5 章節標題第二行同 `#deepChapterCrumb` 重疊幾多 px（絕對定位＋列高 44px 係事實，像素重疊 jsdom 量唔到）。
- 「WhatsApp 群組」喺 320px 會唔會 ellipsis：0.62em 估計 139px < 144px 盒，0.70em 估計 150px > 144px。邊界。
- 字母卡英文標題（`外向 Extraverted` 等，24px）喺箭咀中間會唔會溢出。冇 `nowrap`，算術係會折行（320px 中間約 156px，估計要 ~220px），折行後靚唔靚需真機。
- 手機系統主題喺字母頁中途切換（P1-4 代碼路徑在，視覺未見真機）。
- 結果頁情景卡 `from-yellow-50 to-white`（`:4606`）喺黑夜會唔會壓過 `html.dk .card`。特指度上 `.card` 應該贏，未見真機。
- 三粒分享掣算術喺 320px 內寬約 83px、需要約 77px，當 fit；字重 700 若闊過 0.62em 可能換行，需真機。

## 如果只修 3 樣，修邊 3 樣

1. **P1-1 章節 `<br>` 被 escape。** 16 型 × 2 章，完整版用戶一定睇到字面 `<br>`。修法係一行次序，唔郁排版。
2. **P1-2 結果頁亂數百分比。** 註解已經承認呢個會似 bug，人格頁修咗、結果頁漏咗。離開再入個數會變，同「夾幾多」呢個承諾直接矛盾。一行改呼叫。
3. **P1-3 雙擊跳題。** 靜靜少一題、空答案唔計分，接近中間嘅軸可以因此翻型。用戶唔會知道結果係跳題嚟。加一個 in-flight lock 就夠。

P1-4／P1-5 都係真問題，但一個要切主題先中、一個係窄屏標題。上三項係「內容錯」或者「結果錯」，先修。

## 今次確認過、唔當 bug

- 返回主路徑、解鎖閘、`articleStep`／`typeStep`／`letterStep` 唔加 history 層：探針實跑符合註解。
- `formatGuideHtml` 嘅 `」。` 係正常句號，唔係多咗句號（探針初段 regex 誤中，已核對原文）。
- emoji：preflight 32 通過。探針 regex 中咗註解入面嘅 `✓`（U+2713），唔係頁面 emoji。
- C 組 HK$18 示範解鎖彈窗：`docs/UI-TODO.md` 未做第 1 項，上架前先改，今次唔當新 bug。
