# 港式 MBTI 獨立審計 ＋ 流程改善（2026-10-05）

審計員：xai-oauth / grok-4.7
範圍：唯讀。冇改 `/opt/data/repos/hk-mbti` 任何檔，冇 commit／push／tag，冇改版本。
HEAD：`7dc1dc3`（`main`，同 `origin/main` 一致）。`git status --porcelain` 空。
報告只寫呢個 scratch 檔。

標示：`[事實]`＝今次工具輸出。`[推論]`＝由事實推出、未再做一次對照實驗。`[猜測]`＝未驗。今次冇用猜測做結論。

---

## 0. 一句判斷

`[事實]` 用戶睇到嘅版面冇壞。壞嘅係兩支**唔喺 `ship.sh` 入面**嘅真 Chrome 測試，仲有三份文件同現行 CSS／DOM 唔一致。

`[事實]` 如果而家改 app 去令 `desktop_render_test.py` 變綠（收埋複本、改返 4×4、768 收走導覽），會推翻 2026-10-04 `a257129` 已經上線、而且 `desktop_layout_test.js` 守住嘅設計。唔好咁做。

---

## 1. 今次親手跑過咩

### 1.1 出貨五閘（全部 rc=0）

命令（`/opt/data/repos/hk-mbti`）：

```
export NODE_PATH=/opt/data/profiles/apps/cache/scratch/harness/node_modules
sh tools/ui/run.sh
node tools/desktop_layout_test.js
node tools/desktop_gate_test.js
node tools/deeplink_test.js
python3 tools/preflight.py
```

`[事實]` 五個都係 rc=0。

- `run.sh`：24 個 `tools/ui/*_test.js` 全綠。另一次計時：rc=0，50.8 秒。
- 斷言合計：今次完整輸出逐檔加總 = **971**（python `sum`）。`docs/SESSION-2026-10-04.md` 寫 964，交接簡報寫 943。兩份都過時。`run.sh` 自己唔印總數，所以呢個數字會繼續漂移。
- `desktop_layout_test.js`：56 項全綠。入面已經寫「探索更多 5 欄」「32 張卡」「複本唔再隱藏」。
- `desktop_gate_test.js`：34 項全綠。
- `deeplink_test.js`：全綠（輸出冇總數，唔報一個估數）。
- `preflight.py`：32 項全綠，包括「版本 2.0.0（manifest/sw/chrome 一致）」。

另跑、唔喺閘內、但 `AGENTS.md` 叫人跑：

- `node tools/voice_test.js` → rc=0，「全部通過（10 項）」
- `node tools/record_view_test.js` → rc=0

### 1.2 兩支過期 Chrome 測試

```
CHROME=.../pw/browsers/chromium-1243/chrome-linux64/chrome
pwpy/bin/python tools/desktop_render_test.py
pwpy/bin/python tools/mobile_zero_impact.py --widths 390
```

`[事實]` `desktop_render_test.py`：10/45 失敗，`sys.exit` 路徑 rc=1。再跑一次計時：rc=1，29.8 秒，失敗行數同摘要「10 / 45」一致。唔係 flaky，係斷言過期。

失敗（第一次完整輸出）：

| 寬度 | 失敗斷言 | 測試寫死 | 實測 |
|---|---|---|---|
| 1440、1024 | 只顯示 16 張卡 | `len(c)==16`（第 75 行） | 32 |
| 1440、1024 | 4 欄 × 4 行 | 第 77 行 | 32 個 x、1 個 y |
| 1440、1024 | 卡填滿 reel 盒 | 第 79–81 行 | 卡伸到盒外（滑輪本應如此） |
| 1024 | 組別標籤收埋 | 第 83 行，`<1280` 要收 | 標籤顯示 |
| 1440、1024 | 探索更多 4×2 | 第 91 行，`len==8` | 見下節，5 格 1 行 |
| 768 | 冇導覽／頁尾 | 第 117 行 | 導覽同頁尾都顯示 |

`[事實]` `mobile_zero_impact.py`：rc=1。Traceback：

```
File "tools/mobile_zero_impact.py", line 73, in render
    await pg.evaluate(js)
ReferenceError: openSpectrum is not defined
```

呼叫清單喺第 71 行：`openSpectrum()`、`openSocial()`。剝桌面層嘅 regex（第 23–30 行）冇爆，即係 crash 之前 strip 成功。測試死喺導航，未去到像素比較。

### 1.3 真 Chrome 幾何（唔係靠舊測試）

Probe：`/opt/data/profiles/apps/cache/scratch/audit-geom-probe.py`（臨時 HTTP server，跑完 `shutdown`）。10.02 秒。四個寬度零 `pageerror`。

`[事實]` 1440：`html.dt` 開、導覽開、頁尾開、組別標籤開。`scrollWidth==clientWidth==1440`（冇橫向 page scroll）。探索更多 5 格全 `display:flex`，同一 y=1153.9，闊都係 243.2，高都係 204.1，`overlaps=[]`，5 欄 1 行。滑輪 DOM 32、可見 32、同一 y、卡闊 144、`scrollWidth 4984 > clientWidth 709`。

`[事實]` 1024：同樣 5 欄 1 行、無重叠、無橫向 page scroll。組別標籤**顯示**。卡闊 124。`scrollWidth 4344 > clientWidth 532`。

`[事實]` 768：`html.dt` 開、導覽 `display:block`、頁尾開、組別標籤開。`scrollWidth==clientWidth==768`。探索更多：

- 第 1 行 3 格（x=20 / 268 / 516，闊 232，高 204.1）
- 第 2 行 2 格（x=144 / 392，闊 232，高 178.6）
- 左內縮 144−20=124，右內縮 (516+232)−(392+232)=124。置中。`overlaps=[]`。

`[事實]` 390：`html.dt` 關、導覽 `display:none`、頁尾關、組別標籤關。風琴係直排 5 行（手機摺疊）。卡闊 96。`scrollWidth==clientWidth==390`。

`[事實]` 四個寬度 `typeof openSpectrum === "undefined"`、`typeof openSocial === "undefined"`。`openHub`／`openType`／`openAbout`／`goVersion`／`startTestWithVersion`／`goHome`／`show` 都係 function。

`[事實]` live `index.html` HTTP 200，md5 `fdd72a374852ed6e4188592eaa1c0200`，同 local 一致。其餘 5 個 live 檔今次冇逐個對 md5。`[未驗]` 唔當已核對。

---

## 2. 客觀缺陷（同「建議」分開）

### 2.1 用戶可見 bug

`[事實]` 今次量度範圍內，冇發現用戶可見嘅版面 bug。10 條 render 失敗全部係測試仲要求 2026-09-28 嘅 4×4 設計。現行 CSS 註釋（`index.html` 第 747–748 行）寫「平板 3+2、桌面 5 欄」，同像素一致。

### 2.2 測試係客觀缺陷（會誤導人改錯 app）

1. `[事實]` `tools/desktop_render_test.py` 最後改動係 `191327f`（2026-09-28 08:44，「16 型 4×4 做主角」）。`a257129`（2026-10-04 13:35）重做咗版面，冇改呢個檔。斷言寫死 16／4×4／8 格 4×2／768 冇導覽。

2. `[事實]` `tools/mobile_zero_impact.py` 同一個 commit `191327f` 之後冇再改。`openSpectrum` 喺 `3c149dc` 由 index.html 4 次變成 0 次（`git grep -c`：parent=4，該 commit=0）。`openSocial()` 喺 HEAD 係 0 次；剩低 5 次係 `openSocialArticle`。`tools/ui/hub_consolidation_test.js` 第 210 行**要求** `openSpectrum`／`openSocial` 唔可以係 function。所以「修測試」唔可以係把函數加返去 app。

3. `[事實]` 兩支都不喺 `tools/ship.sh` 第 26–31 行。出貨閘可以全綠，同時呢兩支係紅。今次就係咁：五閘 rc=0，render rc=1，zero-impact rc=1，working tree 乾淨。

### 2.3 假綠（測試過，但唔係佢個名講嘅嘢）

1. `[事實]` `desktop_layout_test.js` 第 140 行，名係「桌面維持 4×2：deep 格喺桌面層隱藏」。斷言只 regex `html.dt .home-acc-item[data-acc="deep"]{display:none}`。HTML 冇任何 `data-acc="deep"`（全 repo 只得呢條 CSS 第 841 行，同呢條測試）。測試綠，因為死規則仲喺度。名講 4×2，碼冇查 4 或者 2。

2. `[事實]` `desktop_render_test.py` 第 94 行「連結貼底」用 `gb[:4]` 同 `gb[4:]`。5 格同一行、底部一樣時，兩組 `set` 長度都係 1，斷言照過。今次 1440 輸出：4×2 失敗，貼底同等高都通過。等高（第 92 行）同樣唔查格數。

3. `[事實]` `tools/ui/button_audit.js` 第 55 行、`start_flow_probe.js` 第 43 行無條件 `process.exit(0)`。而家唔入閘（`run.sh` 第 15 行只 glob `*_test.js`）。潛在假綠，唔係而家出貨漏洞。如果有人「tools 入面所有 js 都跑」就會假綠。

4. `[事實]` `ship.sh` 第 16–22 行只睇 exit code。`run.sh` 第 22 行額外把「exit 0 但行首 ✗」當失敗。兩層標準唔同。preflight 舊版就係「有警告但 exit 0」走過漏（`preflight.py` 第 83–85 行註釋已經記低）。`ship.sh` 冇繼承呢道雙重檢查。

### 2.4 文件同註釋過時（客觀不準，但唔係 runtime bug）

1. `[事實]` `AGENTS.md` 第 4 行叫人先睇 `docs/DESKTOP-HANDOFF.md` 做真相來源。該檔第 55 行仲寫導覽 5 個入口含 spectrum／social；第 75 行寫平板**冇**導覽／頁尾；第 90 行寫探索更多 4×2。同今次像素相反。

2. `[事實]` `AGENTS.md` 第 8 行，≥1024 句入面寫「探索更多 6 欄」。CSS 第 941 行 `@media (min-width:1024px)` 係 `repeat(5)`。6 欄 grid 喺平板層第 914 行（用來砌 3+2），唔係桌面。第 20 行寫 run.sh「21 檔」，實數 24。第 25–26 行把兩支已死測試寫成「改完一定要跑」，而且當「45 項」同「54 張 0 pixel」仍然成立。

3. `[事實]` `index.html` 第 803 行註釋寫「後 16 張複本收埋」。第 58–59 行 layout 測試要求**冇** `nth-child(n+17){display:none}`。像素：32 張都可見。註釋錯，行為同較新嘅測試一致。

### 2.5 而家冇爆、但結構上會再靜靜死

`[事實]` 平板 3+2 今日係啱嘅，但 CSS 第 916–917 行用 `nth-child(5)`／`nth-child(6)`。`#homeAccordion` 第一個仔係 label，唔係 item。所以 nth-child(5) 打中第 4 格 method（實測 x=144＝第 2 欄），nth-child(6) 打中第 5 格 privacy（x=392＝第 4 欄）。置中係 label 佔咗 child 1 嘅副作用。

`[推論]` 如果有人把 label 搬出 grid，或者再加一格，`desktop_layout_test.js` 第 77–80 行仍然綠（佢只 regex 呢兩句 CSS），視覺 3+2 會散。今次冇真係搬 label 去做對照實驗，所以呢句係推論，唔係已重現嘅 bug。

`[事實]` `preflight.py` 第 66–75 行只掃 HTML `onclick="fn("`。`openSpectrum` 喺 index.html 已經 0 次，所以 preflight 綠，同時 `mobile_zero_impact.py` 仍然呼叫佢。產品入口守門覆蓋唔到測試腳本。

`[事實]` `mobile_zero_impact.py` 嘅基準係「現行 index.html 剝走桌面層」（檔頭第 12–13 行已經講明，唔係對 v2.0.0）。就算佢綠，都只證明桌面層冇漏去手機，唔證明手機同 v2.0.0 一樣。`AGENTS.md` 第 26 行嘅「54 張 0 pixel」會令人以為係更強嘅保證。

---

## 3. Q1 — `desktop_render_test.py` 點修

**唔好逐條改數字。** 16→32、4×4→1 行、4×2→5、冇導覽→有導覽，只係把「黐死上一代設計」換成「黐死呢一代」。下一次改欄數，同一支測試會再靜靜紅，而且因為唔喺閘內，又係要等人審計先發現。

**重寫幾何斷言，數字由 DOM／CSS 當下讀，唔好寫死。** 保留已經同現行設計一致、而且今次通過嘅檢查：hero 喺版本卡上面、文案左／滑輪右、版本卡等高、情景 4 欄、`show()` 之後 `#home` 係 `display:none`、零 pageerror、主頁冇橫向 page scroll、390 冇 `.dt`。

刪走或者改寫呢幾條（佢哋編碼咗舊 grid，唔係滑輪意圖）：

- 第 75 行「只顯示 16 張」
- 第 77 行「4×4」
- 第 79–81 行「卡填滿 reel 盒」——滑輪要循環就一定要溢出。今次 1440：4984 > 709。呢條對滑輪永遠唔應該綠。
- 第 83 行「<1280 收組別標籤」——CSS 第 815 行喺 `min-width:768` 已經 `display:flex`，冇後續收埋規則。
- 第 91 行「8 格 4×2」
- 第 117 行「768 冇導覽」——CSS 第 759、851 行喺 `min-width:768` 設 `display:block`。第 747 行註釋寫「兩行導覽」。

換成設計意圖（示意，唔係叫你而家落盤）：

```python
# 滑輪：可橫滑、一行、等闊、複本對齊。唔查欄數。
cards = g["cards"]  # 已經 filter 可見
assert g["reelSW"] > g["reelCW"]
assert len({round(c["y"]) for c in cards}) == 1
assert max(c["w"] for c in cards) - min(c["w"] for c in cards) < 1
assert len(cards) == dom_card_count          # 由 DOM 數，唔寫 32
assert codes[:half] == codes[half:]          # 無縫複本
assert half == len(set(codes[:half]))        # 前半無重複

# 探索更多：欄數 = 當下 media 嘅 repeat(N)，而且 N 要等於可見格數（桌面）
# 或者最後一行置中（平板）。唔寫 5、唔寫 8。
assert desktop_repeat_n == visible_acc_count
assert len({round(i["y"]) for i in visible}) == 1   # 桌面一行
# 平板：最後一行左右內縮差 < 8px，而且上行格數 > 下行格數
assert abs(left_inset - right_inset) < 8

# 導覽：390 computed display none；768+ computed display block
# 數值由 getComputedStyle 讀，唔好抄 DESKTOP-HANDOFF
```

`repeat(N)` 要用「適用於該 viewport 嘅 media」解析，唔好全檔第一個 `repeat(`。而家檔入面平板係 6、桌面係 5，撈錯就會假紅。

平板唔好再 assert `nth-child(5)`。assert「最後一行置中」先覆蓋到 label 移位。CSS 可以順手改成 `nth-last-child`，但嗰個係加固，唔係修而家嘅視覺 bug。

---

## 4. Q2 — `mobile_zero_impact.py` 點修先至穩

開頭 assert `typeof` **有用，但唔足夠**。`[推論]` 如果呢個 assert 只活喺一支冇人跑嘅 script，佢仍然會靜靜死。今次就係：script 一跑就大聲死（ReferenceError），問題係 `ship.sh` 唔跑佢。所以要兩層：

1. script 內部：未截圖之前，一次過列出所有會呼叫嘅 `window.*`，缺任何一個就 exit 1，訊息寫齊個名。唔好等到第 4 個畫面先爆第一個。
2. `ship.sh` 快閘：靜態掃描 `tools/**/*.py`／`*.js` 入面 `evaluate("fn(")`／`"fn()"`，對 `index.html` 嘅 `window.fn =`／`function fn`。缺就拒絕出貨。呢層先至防止「冇人跑」。

導航唔好再叫 `openX()`。`pair_test.js` 第 112–117 行已經有正確模式：由 `<section id>` 動態計清單，再對 `show()` 隱藏陣列。像素腳本應：

```javascript
const ids = [...document.querySelectorAll("section[id]")].map(s => s.id);
await page.evaluate(id => show(id), someId);
```

`show` 今次 typeof 係 function，而且隱藏清單同 17 個 section id 完全一致（今次 python 對過：HTML 有而清單冇 = 空；清單有而 HTML 冇 = 空）。

畫面清單建議：

- 刪 `spectrum`、`social`。加返去 app 會令 `hub_consolidation_test.js` 第 210 行紅。
- 保留而家仍然存在嘅：`home`、`openHub`／`show("hub")`、`openType("INFJ","hub")`、`openAbout`、`goVersion("bb")`、`startTestWithVersion("bb")`。
- 新 section 由 DOM 清單減一個 skip set（要 fixture 先開得嘅：`result`、`test`、`pair`、`deepChapter`…）自動出現。skip set 要寫註釋點解 skip，唔好變成第二份會腐爛嘅硬編碼畫面表。

`strip_desktop()` 第 30 行 `n != 1` 就 `SystemExit`，呢個 fail-loud 要保留。函數檢查用同一種：缺就即停，唔好截一半圖再爆。

像素比較本身唔好再當「手機冇變過」嘅證明。見 2.5。如果仲要像素：只留 390 一個闊度、先過函數閘、凍結 reel（檔入面已有 `FREEZE`）。三闊度 × 兩版 × 40 題 × 850ms，等待下限係 275.7 秒（python 計 `3*2*45950ms`），未計截圖。呢個先至係慢同 flaky 嘅來源，唔係幾何量度。

---

## 5. Q3 — 要唔要塞入 `ship.sh`？點樣分層先至唔會永遠冇人跑

`[事實]` 幾何測試 29.8 秒，`run.sh` 50.8 秒。幾何測試**唔慢**。慢嘅係像素腳本（等待下限約 276 秒）。幾何測試今次失敗係確定性過期，唔係 flaky。

所以：

- **唔好**把而家呢兩支原樣塞入 `ship.sh`。一塞，所有出貨（包括只改配對文）都會被過期斷言同已刪函數擋住。先修斷言，再決定邊層跑。
- **唔好**把像素對比放入每次 push。慢，而且字體／亞像素／動畫會假紅。假紅多咗，人會學識「忽略呢道閘」，比冇閘更差。
- **可以**把重寫後嘅幾何測試放入 push，30 秒係負擔得起。但更穩嘅分層係：每次 push 跑靜態閘（毫秒級，捉到今次兩類錯誤）；Chrome 幾何只喺版面 hash 變咗先強制跑。

分層點解唔會變成「永遠冇人跑」——因為可選腳本喺呢個 repo 已經失敗過。`AGENTS.md` 第 25–26 行寫明要跑，`docs/audit/A1-tests.md` 亦記低 2026-10-04 審計冇跑（當時冇 Chrome）。有 Chrome 之後仍然冇人跑，直到今次。文件提醒唔算閘。

要算閘，必須係 `ship.sh` 嘅 exit code：

1. 每次 push 都跑「函數引用」同「寫死數字 vs DOM」兩道靜態檢查。呢兩道如果 2026-10-02 已經喺閘內，`openSpectrum` 刪走當日就會紅；如果 2026-10-04 已經喺閘內，`len(c)==16` 同 layout 測試嘅 32 就會紅。唔使 Chrome。
2. Chrome 幾何 stamp：`visual.sh` 成功後，把「desktop-layer + `#homeAccordion` + `#homeTypeReel` 外殼」嘅 hash 寫入 scratch（唔好寫入 repo，否則一份 docs commit 會順便更新 stamp）。`ship.sh` 計同一個 hash。唔同就拒絕，訊息寫「跑 `sh tools/visual.sh`」。版面冇改（只改 `pair-data.js`）就唔使等 Chrome。
3. stamp 檔唔存在 = 拒絕（fail closed）。第一日會擋一次出貨，呢個係對的。
4. 再加年齡上限：stamp 舊過 14 日都拒絕，即使 hash 冇變。成本係每兩星期 30 秒。唔加年齡上限，Chrome 升級或者字體變化可以永遠冇人跑。14 日係建議，唔係量度過嘅最優值。`[建議]`
5. 像素測試保持手動旗標（`--pixel`），唔入 `ship.sh`，亦唔入 14 日循環。循環跑嘅係幾何，唔係 54 張圖。

`ship.sh` 第 26 行寫死「5 項」。加閘時要用 `run_gate` 嘅實際次數印總數，唔好再寫死。第 40 行 `git add -A` 會把意外檔一併 commit。建議改成明確路徑。呢個唔係今次事故根因，但係同一類「閘沒有收窄範圍」。

---

## 6. Q4 — 仲有咩結構性漏洞會造成行為錯誤

按「會唔會令錯行為上船」排：

1. **閘外測試可以永遠紅。** 機制：`ship.sh` 第 26–31 行寫死 5 項。`AGENTS.md` 另有一份「一定要跑」清單。人同 agent 跟強制嗰份。證據：今次五閘綠、兩支 Chrome 紅、tree 乾淨、live index md5 一致。

2. **同一事實有兩套斷言，冇交叉檢查。** `desktop_layout_test.js` 第 132 行要 32 張卡，第 58 行要求複本唔隱藏。`desktop_render_test.py` 第 75 行要 16 張可見。兩套可以一個綠一個紅，而出貨只睇綠嗰套。

3. **斷言名同斷言內容脫節，製造假安全感。** 第 140 行「4×2」只保護一條死 CSS。死 CSS（第 841 行）又只為咗令呢條測試綠。循環：規則唔匹配任何元素，測試仍然要求規則存在。

4. **切片斷言喺錯誤格數下仍然綠。** 第 94 行 `[:4]`／`[4:]`。見 2.3。

5. **產品入口守門掃唔到測試腳本。** `preflight.py` 第 66–75 行。見 2.5。

6. **註釋同 handoff 被寫成真相，但冇守門。** `AGENTS.md` 第 4 行指向一份 9 月 28 日描述。agent 如果信 handoff 多過信 CSS，會把平板導覽當 bug 拆走。今次像素證明拆走先至係 bug。

7. **nth-child 打中 label 偏移，測試只鎖 CSS 字面。** 見 2.5。而家視覺啱，下一手搬 DOM 會靜靜錯。

8. **`run.sh` 唔印斷言總數。** SESSION 964、簡報 943、今次 971。agent 會引用記憶入面嘅舊數，當「全套仍然係嗰個數」＝冇漏檔。`run.sh` 第 25 行應印 `N 檔 / M 斷言`。

9. **健康測試亦唔喺閘內。** `voice_test.js`、`record_view_test.js` 今次 rc=0，但 `ship.sh` 冇佢哋。方向同第 1 點相反：呢兩支而家綠，將來紅都唔會擋 push。`AGENTS.md` 有列，閘冇列。

10. **`window.show` 定義兩次**（第 3229 行真身，第 5252 行 wrapper 呼叫 `_origShow`）。隱藏清單只得一份，`pair_test.js` 第 112–117 行已經守「清單覆蓋全部 section」。今次對過 17 個 id，零漏。呢個係已補嘅洞，唔係新洞。提一筆，避免下次審計再當未修。

`preflight.py` 第 77–86 行 emoji 只掃 HTML。`voice-data.js` 註釋有 U+26A0。全站「JS 註解都唔准」呢條，對獨立 `.js` 係空閘。用戶睇唔到。唔好把呢個升做今次三道主閘，否則一開就紅喺註釋，掩蓋真正嘅版面閘。

---

## 7. Q5 — 三個可以即時落 code 嘅守門

三道都要入 `ship.sh` 嘅 `run_gate`。落地當日會紅。修補必須同閘同一個 commit，否則所有出貨停擺。紅係預期，唔好為咗綠而放寬閘。

### 守門 A — 工具引用嘅 window 函數必須存在

新檔 `tools/test_refs.py`。每次 push 都跑。唔使 Chrome。

```python
defined = set(re.findall(r"window\.([A-Za-z_$][\w$]*)\s*=", index))
defined |= set(re.findall(r"function\s+([A-Za-z_$][\w$]*)\s*\(", index))
# 再掃 data.js 等被 inline 嘅腳本，如果函數定義喺度
call_re = re.compile(r"""(?:evaluate\(\s*|["'])([A-Za-z_$][\w$]*)\s*\(""")
for path in tools_py_js:          # 跳過 node_modules
    for i, line in enumerate(read(path), 1):
        for name in call_re.findall(line):
            if name not in defined and name not in PY_BUILTINS:
                fail(f"{path}:{i} 呼叫 {name}()，index.html 冇定義")
# 額外：hub_consolidation 已禁止嘅名，工具再呼叫就失敗
for banned in ("openSpectrum", "openSocial", "openRomance"):
    if banned_called(banned):
        fail(banned + " 已禁止，工具仍然呼叫")
```

今次預期紅：`mobile_zero_impact.py` 第 71 行 `openSpectrum`、`openSocial`。
修法：改呼叫，或者刪呢兩個畫面。唔好加返函數。

同時 `py_compile` 所有 `tools/**/*.py`，`node --check` 所有 `tools/**/*.js`。語法壞嘅工具而家可以無限期坐喺度。

### 守門 B — 寫死嘅卡數／欄數必須等於 DOM，死 selector 必須失敗

新檔 `tools/design_consistency.py`。每次 push 都跑。唔使 Chrome。

```python
html = read("index.html")
items = re.findall(r'<div class="home-acc-item"', html)   # 今次 = 5
cards = len(re.findall(r'id="homeTypeReel"[\s\S]*?</div>\s*</div>', ...))
# 更穩：用 html.parser 數 #homeTypeReel .hub-type-card，今次 = 32

desk = css_repeat_in_media(layer, min_width=1024, selector=".home-acc")  # 今次 5
assert desk == len(items), f"桌面 repeat({desk}) != 風琴格 {len(items)}"

# 死 attribute selector
for val in re.findall(r'\[data-acc="([^"]+)"\]', layer):
    assert f'data-acc="{val}"' in html_without_style, val  # deep 會紅

# 測試字面唔准同 DOM 打架
for n in re.findall(r"len\(c\)\s*==\s*(\d+)", read("tools/desktop_render_test.py")):
    assert int(n) == card_count, n          # 16 != 32，紅
for n in re.findall(r"len\(a\)\s*==\s*(\d+)", read("tools/desktop_render_test.py")):
    assert int(n) == len(items), n          # 8 != 5，紅
```

今次預期紅：`len(c)==16`、`len(a)==8`、`data-acc="deep"`。
修法：render 測試改為 Q1 嘅意圖斷言（冇字面 16／8 之後，regex 搵唔到，閘唔會假紅）；刪 `index.html` 第 841 行同 `desktop_layout_test.js` 第 140 行。刪死規則冇視覺差，因為冇元素匹配。`[推論]` 視覺無差係由「零匹配」推出，今次冇刪完再截圖。

唔好喺閘入面再寫死 5 同 32。閘只比較「CSS／DOM」同「測試字面」。設計變 6 欄時，人改 CSS 同 DOM，測試如果仲寫 5 就紅；測試如果已經改到由 DOM 讀，閘保持綠。

### 守門 C — 版面 hash 變咗，就要有新嘅 Chrome 幾何 stamp

`tools/visual.sh`：跑重寫後嘅 `desktop_render_test.py`（Q1）。成功先寫 stamp。

```python
# stamp 內容（寫去 scratch，唔入 repo）
blob = desktop_layer_css + home_accordion_outer + home_type_reel_outer
open(STAMP, "w").write(sha256(blob) + " " + iso_now + "\n")
```

`ship.sh` 加：

```sh
cur=$(python3 tools/layout_hash.py)          # 同一個 blob 嘅 sha256
read stamp_hash stamp_time < "$STAMP" || { echo "冇 visual stamp"; exit 1; }
[ "$cur" = "$stamp_hash" ] || { echo "版面 hash 變咗，先跑 sh tools/visual.sh"; exit 1; }
# 14 日：python 比較 stamp_time，超時 exit 1
```

`layout_hash.py` 同 `visual.sh` 必須用同一段抽取碼，否則 stamp 永遠對唔上。抽函數放一個檔，兩邊 import。

唔好把 `mobile_zero_impact.py` 像素循環放進呢道。`visual.sh` 可以加一個 390 幾何煙測（`.dt` 關、`#dtNav` computed `display==none`、`scrollWidth<=clientWidth`）。今次 probe 呢三項已經係咁，而且 10 秒涵蓋四個寬度。呢個先替代「54 張圖」嘅出貨角色。

### 落地次序（同一個工作單元，但 commit 要可回滾）

1. 守門 A＋B 連同令佢哋變綠嘅測試／死 CSS 刪除，一個 commit。未綠唔好 push（`ship.sh` 會拒絕，呢個係對的）。
2. 按 Q1 重寫 `desktop_render_test.py`，親手跑到 rc=0，先寫 stamp。
3. 先至把守門 C 加入 `ship.sh`。如果 C 早過重寫加入，所有出貨會被過期幾何測試擋住。
4. `AGENTS.md`、`DESKTOP-HANDOFF.md`、第 803 行註釋，同第 1 步一齊改，或者緊接嘅 commit。只改文件、唔加 A／B，下一次會再漂移。

---

## 8. 對母代理計劃 A–E 嘅審（唔好照抄）

- A 更新 render 斷言：方向啱。做法唔好「逐條改成 32／5／有導覽」。要改成 Q1 嘅意圖斷言。否則下一次改欄數又係同一種死法。
- B 修 `openSpectrum`：方向啱，但唔好只換一個而家存在嘅函數名。用 `show(id)`＋ DOM 清單，並且唔好復活 `openSpectrum`／`openSocial`。
- C 兩支都加入 `ship.sh`：幾何（重寫後）可以，像素唔好。原樣加入會令出貨閘紅喺過期斷言，人會有壓力改 app 去遷就測試。
- D 測試資產健康：呢個先係根因修復。收窄成守門 A＋B，唔好做成「所有 py 開到就算」。開到唔代表斷言未過期。
- E 修 `AGENTS.md`：要修，但真相來源係 `DESKTOP-HANDOFF.md`（`AGENTS.md` 第 4 行），只改 30 秒版會留低一份更長嘅錯文件。第 803 行 CSS 註釋一併改。

---

## 9. 今次冇做／唔好誤會

- 冇改 repo。`git status --porcelain` 於寫報告前為空。HEAD 仍然 `7dc1dc3`。
- 冇把 live 其餘 5 個檔逐個對 md5。只核對咗 `index.html`。
- 冇跑全套像素對比（script 喺函數呼叫已死，強行跑完會係另一個問題）。
- 冇用視力判斷「靚唔靚」。3+2 置中係內縮 124=124 計出嚟，唔係睇圖感覺。
- 臨時 HTTP server 由測試腳本自己開、自己 `shutdown`。冇長開。

---

## 10. 摘要（≤400 字，畀母代理轉述）

今次係測試同文件過期，唔係版面壞。Chrome：1440／1024 探索更多 5 欄一行、滑輪 32 張可橫滑；1024 有組別標籤；768 有導覽，3+2 置中、無重叠；390 冇 .dt。desktop_render_test.py 仲係 9 月 28 日 16 卡 4×4，10/45 失敗（rc=1，29.8 秒）。mobile_zero_impact.py 叫已刪嘅 openSpectrum／openSocial，一跑即 crash。兩支都唔喺 ship.sh，閘綠都睇唔到。唔好改 app 遷就舊斷言。像素對比唔好塞入每次 push（等待下限約 276 秒，易 flaky）。三道快閘：tools 呼叫嘅 window 函數必須存在；寫死卡數／欄數必須等於 DOM 同 CSS repeat(N)；桌面層 hash 變咗就要新 Chrome 幾何 stamp。
