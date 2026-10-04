# A1 測試審計 — hk-mbti

- 報告時間：2026-10-05 00:12 HKT（測試窗 2026-10-04 16:07:08Z–16:08:50Z）
- 正式跑嘅 commit：`ea257fb`（`ea257fbefb80b95801367be909754260503106e7`）
- 跑之前：`git status --short` 空、branch `main`
- 環境：node v26.5.1、Python 3.13.5、`NODE_PATH=/opt/data/profiles/apps/cache/scratch/harness/node_modules`（jsdom 喺度）
- 工作目錄：`/opt/data/repos/hk-mbti`
- 本代理：**冇**改 repo 任何檔、冇 push、冇 tag、冇改版本號

## 0. 時序（唔好將兩個 commit 嘅數字撈埋）

| 標記 | 內容 |
|---|---|
| 事實 | 五條指定命令全部喺 `ea257fb`、工作樹乾淨時跑完（最後一條 16:08:50Z 結束） |
| 事實 | 16:10:37Z 出現 **唔係本代理寫** 嘅 commit `77dda73`：`test(pair): 加真 popstate 返回路徑守門…`。`git diff ea257fb --stat` 只得 `tools/ui/pair_test.js` +14 行 |
| 事實 | 本代理 16:11:38Z **額外**跑咗一次 `node tools/ui/pair_test.js`（見文末「跟進」）。正式套數字 **唔包括** 呢一下 |
| 事實 | 寫報告時 HEAD 已係 `77dda73`，工作樹再次乾淨。app 碼（`index.html` 等）相對 `ea257fb` 冇 diff |

---

## 1. 指定命令結果

失敗總數：**0**。五條 exit code 全部 **0**。冇失敗斷言，所以冇失敗原文可貼。

### 1.1 `sh tools/ui/run.sh` — exit 0

事實（runner 自己印嘅尾句）：`===== 全部 UI 測試通過 =====`

24 個 `tools/ui/*_test.js`（`run.sh` 只跑呢個 glob；`button_audit.js`、`start_flow_probe.js` 唔會入）。`AGENTS.md` 寫「21 檔」——同今次輸出唔符，係文件過時，唔係今次失敗。

| 檔 | 通過／總數 | 來源 |
|---|---|---|
| app_feel_test.js | 46/46 | runner 印 `全部通過（46/46）` |
| back_nav_test.js | 29/29 | 同上 |
| backkey_test.js | 30/30 | 同上 |
| boot_reload_test.js | 25/25 | 同上 |
| dark_mode_test.js | 60/60 | 同上 |
| dialogs_ab_test.js | 30/30 | 同上 |
| hub_consolidation_test.js | 117/117 | 同上 |
| hub_tiles_test.js | 18/18 | 同上 |
| letter_card_test.js | 22/22 | 同上 |
| letter_career_test.js | 9/9 | 同上 |
| letter_dim_test.js | 5/5 | 同上 |
| mobile_debug_fixes_test.js | 28/28 | 見下方註 |
| oneshot_delete_test.js | 14/14 | runner 印 `全部通過（14/14）` |
| pair_test.js | 28/28 | runner 印 `全部通過 28/28`（`ea257fb` 嗰版，**冇** popstate 斷言） |
| personal_report_test.js | 55/55 | 同上 |
| premium_test.js | 173/173 | 同上 |
| reel_test.js | 31/31 | 同上 |
| result_page_test.js | 51/51 | runner 印 `結果頁測試 51/51` |
| share_card_test.js | 23/23 | runner 印 `分享卡版面測試 23/23` |
| tailwind_static_test.js | 39/39 | runner 印 `全部通過 39/39` |
| type_pick_test.js | 15/15 | runner 印 `型格卡狀態 15/15` |
| type_tabs_test.js | 87/87 | 同上 |
| version_card_test.js | 15/15 | 同上 |
| wizard_test.js | 14/14 | 同上 |
| **小計** | **964/964** | 24 檔相加；檔級失敗 **0** |

`mobile_debug_fixes_test.js` 註（事實，唔係美化）：

- runner 印嘅係 `===== 全部通過（28 項）=====`，**冇**印 `28/28`
- `tools/ui/mobile_debug_fixes_test.js:85-86` 無論 `ok===total` 與否都印「全部通過（total 項）」，成敗只靠 `process.exit(ok===total?0:1)`
- `run.sh` 只有 `ec != 0` 先計入 `FAIL`；最終 exit 0 ⇒ 該檔 ec=0 ⇒ `ok===total`。印出 total=28，所以 **28/28 係由 exit 0 加印出嘅 total 推出**，唔係測試自己印咗分數線

### 1.2 `node tools/desktop_layout_test.js` — exit 0

事實：最後一行 `✓ 全部通過（56 項）`。輸出檔 `✗` 數 = 0。**56/56**。

### 1.3 `node tools/desktop_gate_test.js` — exit 0

事實：最後一行 `✓ 全部 34 項正確`。輸出檔 `✗` 數 = 0。**34/34**。

### 1.4 `node tools/deeplink_test.js` — exit 0

事實：測試 **冇印** `通過/總數`。尾句係 `✓ 全部深層連結都開到對應畫面`。`tools/deeplink_test.js:233-234`：`bad` 非 0 先印 `✗ N 項唔合格` 並 `exit 1`。exit 0 ⇒ `bad===0`。

事實：由完整輸出逐項數 ✓（摘要行唔計）：

| 段 | 項 |
|---|---|
| 【1】load hash | 9 |
| 【2】sessionStorage 唔劫持 | 3 |
| 【3】hashchange／pageshow | 2 |
| 【4】pending_type | 3 |
| 【5】pending_screen（1）＋四頁寫旗標（4） | 5 |
| 【6】四頁選單死鏈 | 4 |
| **合計** | **26/26**，✗ = 0 |

呢個 26 係數輸出，唔係程式自己宣告嘅 total。source 只有 12 行 `if(!ok) bad++`，其中兩行喺 loop 入面行多次，所以行數 ≠ 項數。

### 1.5 `python3 tools/preflight.py` — exit 0

事實：尾句 `===== 全部通過（32 項） =====`。輸出 ✓ 行 = 32，✗ = 0。**32/32**。

事實（計數口徑，`tools/preflight.py:96-102`）：32 = `len(notes)`，即有印出嚟嘅 ✓ 行（inline script `node --check`、版本字串一致、onclick 有定義）。emoji 殘留同 `manifest.json` JSON 合法 **過關時唔加 notes**；佢哋失敗先會變 ✗ 並令 exit 1。今次冇 ✗、exit 0，所以呢兩類都過，但 **唔喺 32 入面**。

### 正式套合計

| 命令 | exit | 通過／總數 | 失敗 |
|---|---|---|---|
| `sh tools/ui/run.sh` | 0 | 964/964（24 檔，0 檔失敗） | 0 |
| `node tools/desktop_layout_test.js` | 0 | 56/56 | 0 |
| `node tools/desktop_gate_test.js` | 0 | 34/34 | 0 |
| `node tools/deeplink_test.js` | 0 | 26/26（數輸出；程式冇印分數） | 0 |
| `python3 tools/preflight.py` | 0 | 32/32 | 0 |
| **合計** |  | **1112/1112** | **0** |

原始輸出（本目錄，唔喺 repo）：

- `desktop_layout_test.out`
- `desktop_gate_test.out`
- `deeplink_test.out`
- `preflight.out`
- `run.sh` 全文喺本節表；冇另存檔

---

## 2. 失敗

事實：五條命令都冇失敗。冇斷言原文、冇 stack、冇 file:line 失敗點。

---

## 3. 覆蓋率缺口

前提（事實）：指定五條入面，JS 測試用 jsdom（`tools/desktop_layout_test.js:4-7` 自己寫明「冇排版引擎，量唔到位置」）。`preflight.py` 係靜態：`node --check`、版本字串、onclick 名、emoji、JSON。`tools/` 入面嘅 `*_test.js` **冇** `getBoundingClientRect`。唯一掂到 `offsetWidth` 嘅係 `tools/ui/reel_test.js:31`，而且係 **regex 對源碼字串**，唔係量真寬度。

`f7c1b1b` 嘅疊頁 bug，今次套裝 **捉到嘅層** 同 **捉唔到嘅層** 要分開：

- 事實：`ea257fb` 嘅 `pair_test.js` 用 `classList.contains("hidden")` 判斷邊個 section 可見（`vis()`），再加一條 regex：`show()` 隱藏清單要覆蓋全部 `<section id>`。呢層捉到「清單漏咗 pair」呢種 **class 漏加**。
- 事實：`tailwind.css` 有 `.hidden{display:none}`。class 喺、但另一條更具體 CSS 把 `display` 覆寫返，jsdom 嘅 class 檢查仍然綠。`191327f` 就係呢類（主頁收唔埋）；`desktop_layout_test.js:4-7` 寫明舊版 regex 測試當時照樣全部通過。

### 3.1 真實 CSS 排版（疊埋、走位、斷行、對齊）— 最重要

① 為咩捉唔到

- 事實：jsdom 冇 layout／paint。`getBoundingClientRect`、flex/grid 實際佔位、行尾斷行、z-index 視覺疊加、`scrollWidth` 橫向捲軸，呢套都冇量。
- 事實：疊頁回歸（`pair_test`）只睇 class，唔睇兩個 section 嘅盒係咪同時高度 > 0、係咪相交。
- 事實：`type_tabs_test.js:41` 自己寫「jsdom 冇 layout，所以用算術守門」——用 font-size × 字數估 320px 放唔放得落，唔係真排。
- 事實：`desktop_layout_test.js` 有守 CSS **文字**鐵律（`@media` 外只准一條 `display:none`、selector 要以 `html.dt` 開頭、唔准無條件 `zoom`）。呢個捉到「桌面層源碼寫錯規則」，捉唔到「規則生效後像素點樣」。

② 歷史（git log，事實）

- `f7c1b1b` 配對頁返結果頁兩個畫面疊埋（class 清單漏 `pair`；今次 class 層有守門）
- `191327f` 桌面版主頁收唔埋／排序錯亂（作者註明舊測試照過）
- `8ec1fb0` 「深入分析」tab 斷行、強／弱項 icon 未對齊（Roy 圖報）
- `9e3f562` 手機桌面模式補償改動咗手機排版（緊急拆走）
- `58a996c` 手機開「桌面版網站」被誤判成大螢幕
- `aa1f90a` 「探索更多」展開時其他欄跳位
- `6770353` 多咗一行白色橫帶
- `d05db59` hidden 嘅 pill 仍然佔一行（卡高 114→89px）
- `8cf69af` 16 型卡殘留變淡
- `ed72728` 「軸接近中間」提示放錯卡

③ 建議

- 事實：repo 已有 `tools/desktop_render_test.py`（Playwright + 真 Chrome，用 `getBoundingClientRect` 量 1440/1024/768/390，並檢查 `show()` 之後 `#home` 係咪真係收埋）。**今次冇跑**（見第 4 節：本機冇 Chrome、冇 playwright）。
- 建議：裝 Chrome + `playwright` 之後，除咗跑現成 45 項，再加一條：結果頁 → `openPair` → `history.back()`（真 back，唔好 `dispatchEvent('popstate')`），斷言 `#pair` 同 `#result` 唔可以同時 `height>0`，盒不相交。390 / 768 / 1440 各一次。
- 建議：tab 斷行、icon 對齊改用同一條 Playwright 量 `getClientRects().length` 同 icon/text 嘅 `y` 差，取代 `type_tabs_test.js:41` 嘅字數算術。

### 3.2 真手機瀏覽器行為 — 最重要（第二）

① 為咩捉唔到

- 事實：返回鍵測試係 jsdom 入面 `dispatchEvent(popstate)` 或 `history.back()` 模擬（`tools/ui/backkey_test.js:26` 註明 jsdom 唔得就 fallback 手動 dispatch）。冇 Android 系統返回、冇手勢、冇 WebView。
- 事實：`deeplink_test.js` 嘅 bfcache 係自己 `new Event("pageshow")` 再 `defineProperty(persisted)`。唔係瀏覽器真還原頁面。
- 事實：`desktop_gate_test.js` 係抽出 gate script，改 `screen.width`／`innerWidth` 再跑判斷。唔係 Chrome「桌面版網站」真 viewport、唔係 iOS visualViewport、唔係 `safe-area-inset`、唔係地址列伸縮令 `100vh` 跳。
- 事實：多個測試把 `jsdomError` 入面 `scrollTo|Not implemented` 吞咗（例如 `desktop_layout_test.js:91`、`deeplink_test.js:46`）。捲動還原（`index.html:3258` `scrollTo`）喺 jsdom 根本唔會郁。

② 歷史（事實）

- `1372e38` Android 返回鍵喺測試中途直接彈主頁
- `9f05b31` 連續撳 Android 返回第二次就退出 app（`replaceState` 只吸收一次）
- `f76322d` 由記錄頁入結果頁，手機返回應該返 `record.html`
- `32b15c5`／`4809518` 返回要還原捲動位置，唔彈頂
- `550834f` 下拉重整／開機變空白頁
- `2eed95e` 場景／維度頁下拉重整後資料消失
- `58a996c`、`9e3f562`、`55eaae8` 手機「桌面版網站」模式一連串排版事故
- `b5eae42` 可視高度換算（夾住唔可以高過螢幕）

③ 建議

- 建議：Playwright Chromium，`viewport` 390×844、`hasTouch: true`，用 `page.goBack()` 而唔係合成 popstate。路徑至少：測驗中途返回、配對頁返回結果頁、記錄頁深連結返回。
- 建議：下拉重整用 `page.reload()`，重載前寫好 `sessionStorage`／`localStorage`，斷言目標 section 有內容而唔係全部 `.hidden`（對應 `550834f`／`2eed95e`）。
- 建議：iOS Safari 嘅 visualViewport、safe-area、input focus 放大，Playwright **模擬唔足**。要真機或雲端真 Safari。本報告冇跑過真機。
- 事實：`77dda73` 新加嘅 popstate 守門仍然係 jsdom `dispatchEvent`，**填補唔到**呢個缺口。跟進跑 29/29 只證明 class 層喺合成事件下過關。

### 3.3 Service worker 更新行為 — 最重要（第三）

① 為咩捉唔到

- 事實：`tools/ui/app_feel_test.js:51-78` 用 `new Function` 載入 `sw.js`，`caches.open().addAll` 係空函數，`skipWaiting`／`clients.claim` 係空 stub。測試只呼叫 `fetch` handler（斷網 → offline.html、cache 命中、全空 503）。**冇呼叫** `install`、`activate`。
- 事實：`sw.js:18-31` 嘅重點行為因此冇被執行：`install` 用 `allSettled` 逐個 `cache.add`（一個 404 唔拖死成個 precache）、`skipWaiting()`、`activate` 刪舊 cache、`clients.claim()`。
- 事實：`preflight.py:54-60` 只對 `const CACHE = "hk-mbti-v…"` 同 `VERSION` 字串。`tailwind_static_test.js:71-73`、`premium_test.js` 只 regex「precache 清單有冇某個檔」。冇「更新後舊頁仲係咪 cache-first 舊 JS」、冇 waiting worker、冇 `controllerchange`。
- 事實：jsdom 冇 Service Worker 生命週期。`navigator.serviceWorker.register` 唔會喺呢套跑出瀏覽器行為。

② 歷史（事實）

- `95b377d` HTML 改 network-first + bump CACHE（註明解決 stale cache）
- `444b900` `voice-data.js` 改 network-first（stale 會 404，跌返機械聲）
- `3cb7a48` SW precache 補漏（同 commit 加咗字串守門，守嘅係清單有冇寫，唔係更新時序）
- `bcb31c9` dead PWA shortcuts 同 stale manifest 文案
- 多次 freeze commit 係 VERSION／manifest／`sw.js` CACHE 對齊（preflight 今次守到字串層）

③ 建議

- 建議：Playwright `browser.newContext({ serviceWorkers: 'allow' })`，開本地 static server：
  1. 第一次 `goto` 等 SW activated
  2. 改一個 cache-first 資源（例如 `data.js`）再 `goto`，斷言見到新內容定舊內容（對應 `95b377d`）
  3. `context.setOffline(true)` 再開首頁，斷言係 `offline.html` 而唔係空白（`app_feel` 已有 mock 版；呢條先係真 Cache API）
  4. 將 precache 其中一個 URL 改 404，斷言 `install` 唔會令其他檔都冇 cache（對應 `sw.js:19-21` 註解，而家冇測試行過）
- 建議：mock 可以加「呼叫 `H.install`／`H.activate`」做便宜回歸，但要喺測試名寫明 **唔等於** 瀏覽器更新時序。唔好用 mock 綠燈代替第 1–4 點。

### 3.4 Canvas 渲染（分享卡）

① 為咩捉唔到

- 事實：jsdom 冇 canvas pixel。幾乎所有 UI 測試 `stubCanvas`：`measureText` 固定 `{width:10}`，`toDataURL` 返回 `data:image/jpeg;base64,x`（例：`mobile_debug_fixes_test.js:8`、`deeplink_test.js:29-37`）。
- 事實：`share_card_test.js:1-5` 自己寫明用「錄影式 2D context」記 `fillText`／`drawImage` 座標。`_w()`（約第 27 行）用「CJK=1em、其他=0.58em」估字寬，唔係真字型（PingFang HK／Noto Sans HK）嘅 glyph metrics。logo 圖 `Image.onload` 係 `setTimeout` 假觸發，冇解碼 `og`／icon 像素。
- 因此捉到「呼叫座標係咪 48×48、y=265」。捉唔到：真字溢出、抗鋸齒、圖載入失敗、JPEG 空白、長按儲存到嘅圖係咪張卡。

② 歷史（事實）

- `4b91216` 分享卡改做真實 PNG（用戶可長按儲存）
- `3c29f87` 移除 canvas 入面 T 恤 hook 文字
- `4855513` logo 92→48px、名字移低、日期格式（同 commit 加咗而家呢套座標測試）
- `536058e` 分享卡日期取消、版本字加大

③ 建議

- 建議：Playwright 打開結果頁，等 `generateCardImage()` 嘅 `<img>` `naturalWidth>0`，截圖同 golden PNG 做像素差（容許抗鋸齒閾值）。或者 node-canvas 真跑 `getContext('2d')`，禁止 `toDataURL` stub。
- 建議：至少加一條「`toDataURL` 解碼後非全白、寬 720」。而家 stub 會令呢條永遠假綠，所以要喺 **冇 stub** 嘅行程跑。

### 3.5 無障礙

① 為咩捉唔到

- 事實：`git log --grep='無障礙'` 同 `--grep='accessibility'` 都係空。
- 事實：測試入面 `aria-` 只出現喺三個檔，而且係箭咀按鈕有冇指定 `aria-label` 字串：`letter_card_test.js:35-37`、`type_tabs_test.js:213-216`、`hub_consolidation_test.js:266-278`。冇 axe、冇 tab 順序、冇 focus trap、冇對比度計算、冇 screen reader。
- 事實：產品有 `role="dialog" aria-modal="true"`（`record.html`）、大量 `aria-hidden` SVG、`aria-label="更多／睇結果／分享／刪除"`。呢啲 **冇** 測試：dialog 開咗焦點去唔去到、Esc 關唔關到、背景係咪 inert。

② 歷史（事實）

- `5e41adc` 維度字母對比度太淺（Roy 報）。係顏色問題，唔係完整 a11y 計劃。今次 `dark_mode_test.js` 60/60 守嘅係色 token／class，本代理冇見到對比度數值斷言（冇逐行讀晒 60 項；**冇做**「確認 60 項入面零對比度計算」嘅逐項分類——見第 4 節）。
- 其餘 a11y 事故：git log 用上述關鍵字 **冇搵到**。唔等於生產冇問題。

③ 建議

- 建議：Playwright + `@axe-core/playwright`，至少跑主頁、測驗頁、結果頁、配對頁、`record.html` dialog。對 `5e41adc` 嗰對字母色加一條 WCAG 對比度（計 computed color，唔好 regex hex）。
- 建議：dialog 開啓後 `document.activeElement` 喺 dialog 內、Tab 唔走得出去、Esc 關閉。jsdom 可以做焦點斷言，但對比度同真 screen reader 唔得。

### 3.6 其他（次要，但同「jsdom 假綠」同一類）

| 缺口 | ① 技術原因 | ② 歷史 | ③ 建議 |
|---|---|---|---|
| 捲動位置 | jsdom `scrollTo` not implemented，測試吞錯誤 | `32b15c5`、`4809518` | Playwright 斷言 `window.scrollY`，唔好只 regex 源碼有 `scrollTo` |
| 真字型行高／PingFang 缺字 | jsdom 用預設 sans；`share_card` 用 0.58 係數 | `8ec1fb0` 斷行；分享卡多輪微調 | 真 Chrome 截圖，字型清單同生產一致 |
| 音檔／朗讀 | `voice_test.js` **今次冇跑** | `444b900`、`141b33e`（stale voice-data → 機械聲） | 跑現成 `node tools/voice_test.js`；真播要用瀏覽器，jsdom 播唔到 mp3 |
| 記錄頁眼掣 | `record_view_test.js` **今次冇跑** | `3e592f0` 超過 5 條靜靜彈主頁；`da910ce` 再修 | 跑現成測試；視覺層仍然要瀏覽器 |

---

## 4. 冇做到

- 冇跑 `node tools/record_view_test.js`、`node tools/voice_test.js`（`AGENTS.md` 有列，今次指定命令冇包含）
- 冇跑 `python3 tools/desktop_render_test.py`、`python3 tools/mobile_zero_impact.py`。事實：本機 `google-chrome` 同 `chromium` 都唔喺 PATH；`import playwright` 失敗（`ModuleNotFoundError`）。所以真排版測試 **跑唔到**，唔係「睇過所以當過」
- 冇跑 `tests/*.test.js`（Jul 30 四個舊檔，唔喺 `run.sh` glob）
- 冇跑 `button_audit.js`、`start_flow_probe.js`（唔係 `*_test.js`）
- 冇真機、冇開 live 站、冇截圖對位
- 冇逐項分類 `dark_mode_test.js` 60 項入面有冇對比度計算（只確認檔案通過，同 `aria-` grep 冇打中呢個檔）
- 冇重跑成套於 `77dda73`。該 commit 只改測試檔，app 碼同 `ea257fb` 一樣；除下面跟進外，其餘數字仍然係 `ea257fb` 嗰次

## 5. 跟進（唔計入第 1 節合計）

事實：`77dda73` 只加 `pair_test.js` 一項「真 popstate」守門（仍然係 jsdom 合成事件）。

```
node tools/ui/pair_test.js
EXIT 0
===== 全部通過 29/29 =====
```

時間 2026-10-04T16:11:38Z，HEAD `77dda73`。輸出檔：`/opt/data/profiles/apps/cache/scratch/audit/pair_test_followup_77dda73.out`。

如果有人把正式套嘅 pair 28 換成 29，UI 小計會變 965、五命令合計 1113。**本報告正式合計維持 1112/1112（ea257fb）**。

## 6. 推測（同事實分開）

- 推測：而家最大嘅假綠風險唔係「邏輯寫錯」（1112 項邏輯／字串守門係綠嘅），而係「用戶用眼先睇到」嘅排版同「瀏覽器生命週期」嘅 SW／返回鍵。`f7c1b1b` 之後 class 層已有守門，**同一條用戶路徑如果改由 CSS `display` 覆寫造成疊頁，今次五條命令仍然會綠**。
- 推測：`AGENTS.md` 寫 layout 56、preflight 32，同今次一致；「run.sh 21 檔」過時（今次 24）。過時本身唔令測試失敗。
- 推測：`77dda73` 係並行代理喺本代理跑完之後提交。本代理冇參與該 commit。
