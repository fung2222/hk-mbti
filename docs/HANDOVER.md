# 港式 MBTI — 交接總文件（單一入口）

> 更新：2026-11-22 · 版本 **2.1.0** · branch `main`
> 任何 AI／開發者接手，**先讀呢份**，再按需要跳去 §7 文件地圖。
> 現況以本文＋`AGENTS.md`＋`docs/DESKTOP-HANDOFF.md` 為準；其他舊文件只作歷史。

---

## 1. 一句話現況

廣東話 MBTI PWA 已經**正式上架 Google Play 並持續更新**：網站 live、商店頁（8 張截圖＋新描述）已發佈、Play Billing（HK$18 解鎖完整分析）真機驗收 4/4、稅務（W-8BEN）已提交、15% 服務費已註冊。**手機版（<768）係底線，唔准郁**；桌面／平板工作已完成一輪。Apple 上架未開始。

| 項目 | 值 |
|---|---|
| Live | <https://fung2222.github.io/hk-mbti/> |
| Repo | <https://github.com/fung2222/hk-mbti>（`main`） |
| 版本 | `VERSION` = 2.1.0；`manifest.json` = 2.1.0；`sw.js` CACHE = `hk-mbti-v2.1.0` |
| Play 套件 | `com.fung2222.hkmbti` |
| 商店標題 | 港式 MBTI - 16型人格測試（**唔好改成淨「16型人格測試」**） |
| 聯絡／登入 | fung22222@gmail.com |
| 技術 | 單一 `index.html` SPA + 衛星頁 `record.html`／`stats.html`／`privacy.html`；GitHub Pages + Service Worker（HTML network-first） |

---

## 2. 已完成（2026-11 狀態）

### 產品／內容
- **三個版本定位**：生活版 60 題（主推、完整結果）／進階版 30 題（初步探索）／BB 版 10 題（娛樂體驗、唔強調準確度）。版本卡有「主推」標籤＋撳開詳細說明。
- 測試前身份分流（學生／在職／兩者／略過），題目情境跟身份變，計分不變。
- 題庫 109 題（E/I 19、S/N 20、T/F 19、J/P 31、T/A 20）；10／30／60 題分層抽樣。
- 結果頁：分享卡（720×1280 PNG、可下載／分享）、性格分析、個人報告、港人情境、朋友配對（鎖）、深入分析 16 型 × 9 章（第 1 章免費）。
- 16 型百科、相處／拍拖攻略、計分方法同限制、私隱聲明（全部可 zoom）。
- 粵語朗讀：767 段預錄 MP3（`audio/q`、`audio/o`），`voice-manifest.json` count 767、rate +15%。

### 桌面／平板（2026-11-22 完成）
- 桌面 hero 重做（16 型橫向滑輪做主角）、版本卡詳情長開、探索更多段距、香港分佈單欄唔重疊、百科 2×2。
- 衛星頁頂 bar 同主站 `#dtNav` 逐像素一致（含免費版＋主題掣，localStorage 互通）。
- **平板 768–1023 兩欄**：結果頁（分享卡＋分析入口）、類型頁（資料卡＋性格刻度）。
- **桌面**：結果頁分享卡 sticky；類型頁 ≥1280 攻略文兩欄。

### 付款（Play Billing）
- 商品 `hkmbti_full_analysis_unlocked` HK$18（商店頁顯示「應用程式內購買」）。
- 真機驗收 **4/4**：① 彈 Play 付款 ② 買完即時解鎖 ③ 剷 app 重裝再開仍然完整版 ④ 退款後自動降返免費。
- 退款降級修正：`restorePlayPurchases()` 查詢成功而 Play 話冇擁有 → `_setTierFree()`；查詢失敗（離線）保持現狀（commit `5b335b5`）。

### 商店／帳戶
- 商店頁 2026-11-22 更新（提交 #15，20:29 已發佈）：8 張手機截圖（1080×2160）＋新簡短／完整說明。**冇出新 AAB**（PWA 內容自動更新）。
- 稅務：W-8 BEN 已於 2026-10-17 提交（Ka Fung CHAN／香港地址）。
- 15% 服務費層級：已註冊（「你已註冊加入的計劃和服務」見綠色勾）。
- 付款設定檔＋銀行帳戶：已加。

### 工程品質
- 出貨閘 **11 組**（gate_refs／gate_design／preflight／jsdom UI 全套／question_audit／desktop_layout／desktop_gate／deeplink／record_view／voice／desktop_render）。
- 測試規模：jsdom 29 檔（約 1134 斷言）、真 Chrome 幾何 ~125 項、mobile_zero_impact 42 張截圖 0 pixel 差異。
- 無障礙：可縮放、`.option` 用 `<button>`＋`aria-pressed`、`#qProgress` `aria-live`、彈窗 focus trap／Escape、鍵盤答題；Roy 實機試過字體放到最大＋朗讀，冇問題（C1 收工）。

---

## 3. 未完成（等 Roy 開口）

| # | 項目 | 狀態／備註 |
|---|---|---|
| 1 | **Apple／iOS 上架** | 完全未開始；`docs/APPLE-STORE-CHECKLIST.md`、`APPLE-STORE-PREP.md` 有準備資料 |
| 2 | 心理測量驗證（認知訪談、item analysis、test-retest、因素結構） | 長期；**未有數據前唔可以聲稱「準確診斷／香港常模」** |
| 3 | 商店截圖再更新 | 每次 UI 大改要重拍；今次（2026-11-22）已經換咗 |
| 4 | Data safety 覆核 | 今次冇新增收集；將來加新 SDK／Billing 改動要再核 |
| 5 | C1 Service Worker 更新時序 | 無障礙部分已收工；只剩極端更新時序，未有實例，唔急 |

**唔好做**：未經 Roy 同意唔好 tag／backup／改商店正式資料／出新 AAB／改封測設定。

---

## 4. 鐵律（犯咗會整壞手機版或出貨閘）

1. **手機版（<768）任何排版都唔准郁。** 桌面規則一定要 `@media (min-width:…)`＋selector 以 `html.dt` 開頭；唯一例外 `#dtNav,#dtHeroCta,#dtTypeRows,#dtFoot{display:none}`。
2. **黑夜變體**：`html.dt.dk`；淺底新規則要喺 `<style id="dark-layer">` 有對應 dk 覆蓋（`dark_mode_test` 會捉）。
3. **`.hidden` 鐵律**：`#home` 同各 section 靠 Tailwind `.hidden`；唔准覆寫 `display`，要就寫 `:not(.hidden)`。
4. **禁字**：emoji、`↔` 等符號（preflight 硬紅；箭嘴用 `→`）。
5. **版本四處一致**：`VERSION`／`manifest.json`／`sw.js` CACHE／`index.html` chrome 文字（`版本 v2.1.0`）。preflight 而家**要求三段齊全**，亦會檢查 `privacy.html` 版本。
6. **出貨只准** `sh tools/ship.sh "msg"`（唔准自己 `git push`）；11 閘全綠先 commit＋push。
7. **改過桌面層**：另外跑 `CHROME=… python3 tools/mobile_zero_impact.py`（42 張 0 pixel 才收貨）。
8. **jsdom**：`export NODE_PATH="$PWD/tools/ui/node_modules"`。
9. **每次出貨後同步文件**：`docs/CHANGELOG-2026-11.md` 或 `AGENTS.md`／`DESKTOP-HANDOFF.md`，保持可交接。

---

## 5. 本機驗證指令（Linux 環境示例）

```bash
cd <repo>
export NODE_PATH="$PWD/tools/ui/node_modules"
export CHROME=/opt/data/profiles/apps/cache/pw/browsers/chromium-1243/chrome-linux64/chrome
export PWPY=/opt/data/profiles/apps/cache/pwpy/bin/python
export PLAYWRIGHT_BROWSERS_PATH=/opt/data/profiles/apps/cache/pw/browsers

python3 tools/preflight.py          # 禁字／語法／版本／版本卡詳情
node tools/question_audit.js        # 題庫 109
node tools/voice_test.js            # 朗讀 12
SHIP_DRY=1 sh tools/ship.sh x       # 11 組閘乾跑
sh tools/ship.sh "msg"              # 正式出貨（commit＋push＋live md5 比對）
$PWPY tools/mobile_zero_impact.py   # 改桌面層必跑（42 張 0 pixel）
python3 tools/audit_shots.py        # 快速截圖（要先 python3 -m http.server 8765）
```

Windows 環境：`CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe" PWPY=python3 sh tools/ship.sh "msg"`；`mobile_zero_impact` 有 1–8 pixel 渲染雜訊屬正常。

---

## 6. 已知陷阱（血例）

- **版本卡 1024**：2 欄 × 2 行，等高斷言要**逐行**比，唔可以要求四張跨行等高（字型 fallback 會令上下排差 22px）。
- **付款狀態**：`getTier()` 只讀 localStorage；Play 退款／撤銷後必須由 `restorePlayPurchases()` 降級；**查詢失敗唔可以降級**（否則離線誤降付費用戶）。
- **分享卡下載**：撳「儲存圖片」前要 `scrollIntoView`，否則 Playwright／真機細螢幕可能撳唔到。
- **答題節奏**：`selectOpt()` 有 280ms advancing 保護；自動化答題要等 ≥400ms，否則會被當重複點擊而停住。
- **Service Worker**：HTML／voice-data／premium-data／type-icons 係 network-first（`cache:"reload"`）；其他資產 cache-first，所以換版一定要換 CACHE 名。
- **衛星頁頂 bar**：popover 要 `flex:1 1 auto` 先推得右；record 768–1279 要收埋分隔線／清除掣，否則屈折。

---

## 7. 文件地圖

**權威（先讀）**
- `AGENTS.md` — 30 秒規則、出貨閘、禁字
- `docs/HANDOVER.md` — 本文（現況總覽）
- `docs/DESKTOP-HANDOFF.md` — 桌面層 v3.1 全部做法同坑
- `docs/CHANGELOG-2026-11.md` — 本月逐項改動

**主題文件**
- `docs/PREMIUM-CONTENT-PLAN.md` — 收費／Billing 設計（已驗收）
- `docs/FREE-VS-PAID.md` — 免費／付費界線
- `docs/APPLE-STORE-*.md` — Apple 上架準備（未做）
- `store-listing/` — 商店文案／截圖腳本（`whats-new.txt`、`full-desc-play.txt`）
- `tools/` — 閘同測試；`tools/ui/` — jsdom 測試

**歷史（只作背景，唔好當現況）**
- `docs/AI-HANDOFF-v2.0.1.md`／`v2.0.2`／`v2.1.0.md`
- `docs/LAUNCH-FINAL-2026-10-13.md`（上架期清單，大部分已完成）
- `docs/UI-TODO.md`、`docs/v2.0-release-pack.md`、`docs/freeze-log.md`、`docs/PROJECT-REPORT-v1.5–1.7.md`、`docs/SESSION-*.md`、`docs/MOBILE-DEBUG-REPORT.md`

---

## 8. 合作方式（Roy）

- 廣東話溝通；佢負責喺 **live** 睇效果同 Play Console 操作，我負責改 code／文件。
- **一次改一項**，改前 audit 舊 commit 為何 work；改後自己截圖睇（1920／1440／1280／1024／768／390）。
- 美學／收費／改名／版本號／商店資料：**先問後郁**。
- 出貨後簡短報告：改咗咩、commit、live 有冇更新、仲要佢確認咩。

---

## 9. 下一位最快上手路線

1. 讀 §1 現況 → `git log --oneline -10` → 確認 `VERSION`／sw／live md5 一致。
2. 跑 `SHIP_DRY=1 sh tools/ship.sh x` 確認環境 11 閘全綠。
3. 要改桌面：讀 `docs/DESKTOP-HANDOFF.md` → 改 `<style id="desktop-layer">` → 跑閘＋`mobile_zero_impact` → 出貨。
4. 要改內容／題目：讀 `docs/PREMIUM-CONTENT-PLAN.md`、跑 `question_audit`；改題後要補粵語錄音（`tools/gen_voice.py`）。
5. 要改付款：先睇 §6 付款狀態陷阱，再改 `restorePlayPurchases()`／`buyFull()`。
