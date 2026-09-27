# AGENTS.md — 給接手嘅 AI／開發者

呢個 repo 係 **港式 MBTI**（廣東話 MBTI PWA）：live <https://fung2222.github.io/hk-mbti/>
**你要做嘅事同鐵律，全部寫喺 → [`docs/DESKTOP-HANDOFF.md`](docs/DESKTOP-HANDOFF.md)（先睇呢份）**

## 30 秒版
- **任務**：重做**桌面版（Windows ~1920px）主頁排版**。之前 5–6 輪都未滿意（用戶話「排序錯亂、唔靚」）。
- **唔可以碰**：手機版任何排版 ✗；所有桌面規則必須 `@media (min-width:…)` **＋** `html.dt`（唯一例外：`#dtNav,#dtHeroCta{display:none}`）。
- **永久禁止**：無條件 zoom／`.dm` 補償、`calc(50% - 50vw)` 做全闊色帶（用 `--sbw` 修正）。
- **改動位置**：`index.html` 嘅 `<style id="desktop-layer">`（line ~549）為主；`#dtNav`（~707）、`#dtHeroCta`（~1567）、`<head>` gate script（~648）。
- **有瀏覽器就贏**：先開 live + `demo/desktop-full.html`，用 1920 / 1440 / 1024 / 768 / 390px 睇清楚**邊個斷點邊個元素錯位**，再改。

## 改完一定要跑
```bash
export NODE_PATH=<jsdom node_modules>
node tools/desktop_layout_test.js   # 41 項
node tools/desktop_gate_test.js     # 34 項
python3 tools/preflight.py          # 20 項
node tools/deeplink_test.js && node tools/record_view_test.js && node tools/voice_test.js
```
＋「手機零影響」diff 驗證（做法見 handoff §6）。

## 美學（用戶要求）
app 感、唔係文件感：少卡框、少金標、大字、留空。**唔准加 emoji** ✗。唔准改 app 名做淨「16型人格測試」✗。
