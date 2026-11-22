# AGENTS.md — 給接手嘅 AI／開發者

呢個 repo 係 **港式 MBTI**（廣東話 MBTI PWA）：live <https://fung2222.github.io/hk-mbti/>
**現況、鐵律、驗證方法，全部寫喺 → [`docs/DESKTOP-HANDOFF.md`](docs/DESKTOP-HANDOFF.md)（先睇呢份）**

## 30 秒版
- **桌面層**（2026-10-04 v3 重做；2026-11-22 hero 再大修）：`index.html` 嘅 `<style id="desktop-layer">`。
  ≥1024：sticky 導覽（6 入口＋主題／等級）→ hero（左文案／右 **16 型橫向滑輪做主角**，卡片 **9/16 直角**、168–220px 分級放大、自動轉、32 張無縫、箭咀 hover 先現身）→ 版本卡（**桌面詳情長開**、grid stretch 等高）→ 全闊情景帶 → 香港分佈摘要 → 探索更多 5 欄 → 頁尾。
  768–1023：**平板另一套**（內容 920、內頁寬度分級、唔係「放大的手機」）。
  寬度分級 `--dt-w`：**920 / 1120 / 1200 / 1360 / 1440px**（≥1680 斷點）。
- **衛星頁**（`record.html`／`stats.html`／`privacy.html`）：2026-11-22 起桌面頂 bar **同主站同一款**（品牌左置、選單同序、當前頁金下線用 `aria-current="page"`、右端金 CTA「立即測試」）；三頁共享同一寫法嘅 CSS 塊（各頁最尾 `<style>`，冇 id）；寬度分級已拉齊主站。手機 hero 原樣（深藍漸變）。
- ⚠️ 版本卡：桌面 `.ver-more` **長期顯示**（2026-11-22 起；之前撳開先見會推鬱下面內容）。`#versionList` 用 **stretch 等高**——舊規矩「一定要 align-items:start」已廢（嗰陣係為咗展開唔拉高其他卡；長開之後冇呢個問題）。
- **唔可以碰**：手機版任何排版 ✗。所有桌面規則必須 `@media (min-width:…)` **＋** `html.dt`；
  唯一例外：`#dtNav,#dtHeroCta,#dtTypeRows,#dtFoot{display:none}`。
  @media 入面 selector 必須 `html.dt` 開頭；黑夜變體寫 **`html.dt.dk`**（唔好寫 `html.dk.dt` 放 @media 入面，閘會紅；`html.dk.dt` 只可以放 @media 外或者 dark-layer）。淺底規則要喺 `<style id="dark-layer">` 有對應 dark 覆蓋（dark_mode_test 會捉）。
- **`.hidden` 鐵律**：`#home` 同各 section 係靠 Tailwind `.hidden` 收埋；**唔准覆寫佢哋嘅 `display`**，要覆寫就一定寫 `:not(.hidden)`（舊版就係咁令主頁永遠收唔埋）。
- **永久禁止**：無條件 zoom／`.dm` 補償、`calc(50% - 50vw)` 全闊色帶（v3 桌面 `#app` 本身全闊，內容用 `--dt-w` 置中）。**禁字**：emoji 同 `↔` 之類符號（preflight 硬紅；箭嘴用 `→`）。
- **一定要用真瀏覽器睇**：1920 / 1440 / 1280 / 1024 / 768 / 390px（`python3 tools/audit_shots.py` 快速截首頁三段，要先起 `python3 -m http.server 8765`）。

## 改完一定要跑
**出貨一律用出貨閘（唔准自己 `git push`）**：
```bash
sh tools/ship.sh "commit message"   # 以下閘任何一個紅就拒絕 commit + push；閘數同斷言數一律由腳本自己印
SHIP_DRY=1 sh tools/ship.sh x        # 乾跑：只跑閘、唔 commit／push（驗閘／驗 RED 用）
```
**11 套閘，分兩批並行**（實測序列 252.6 秒 → 並行 107.2 秒；快閘紅約 6.7 秒即拒絕，唔跑慢閘）。佢會跑：
```bash
export NODE_PATH=<jsdom node_modules>   # Windows repo 內：export NODE_PATH="$PWD/tools/ui/node_modules"
python3 tools/gate_refs.py          # 靜態：工具引用嘅 UI 函數必須存在（捉已刪函數）＋ py_compile / node --check
python3 tools/gate_design.py        # 靜態：桌面層冇死 selector（CSS [data-*="x"] 冇對應元素即紅）
python3 tools/preflight.py          # 項數由腳本自己印（含所有 HTML inline script 語法檢查）
sh tools/ui/run.sh                  # jsdom 測試集（檔數／斷言總數由 run.sh 自己印，唔准寫死；2026-11-22 起 29 檔）
node tools/question_audit.js         # 題庫 109 條（結構／計分／文法／重複）
node tools/desktop_layout_test.js   # 鐵律 + DOM（項數由腳本自己印）
node tools/desktop_gate_test.js
node tools/deeplink_test.js
node tools/record_view_test.js      # 紀錄頁兩個渠道
node tools/voice_test.js            # 朗讀開關
python3 tools/desktop_render_test.py   # 真 Chrome 幾何（項數由腳本自己印；需要 CHROME + playwright；冇 Chrome 即 fail）
                                       #   Windows：CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe" PWPY=python3
                                       #   快速迭代：ONLY=<關鍵字> 只跑名含該關鍵字嘅斷言（例如 ONLY=弱項）
```
唔入 push 閘（慢／易 flaky），但**改過桌面層一定要另外跑**：
```bash
python3 tools/mobile_zero_impact.py    # 手機零影響：像素對比（約 2–5 分鐘）
                                       #   Windows 渲染雜訊：42 張入面幾張差 1–8 pixel 係已知正常，唔使追
```
「手機零影響」嘅基準係 **現行 index.html 剝走桌面層**（唔係 v2.0.0 —— 之後有好多同桌面無關嘅改動）。

## 美學（用戶要求）
app 感、唔係文件感：少卡框、少金標、大字、留空；首頁主角係 16 型色牌。**唔准加 emoji** ✗。唔准改 app 名做淨「16型人格測試」✗。
