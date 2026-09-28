# AGENTS.md — 給接手嘅 AI／開發者

呢個 repo 係 **港式 MBTI**（廣東話 MBTI PWA）：live <https://fung2222.github.io/hk-mbti/>
**現況、鐵律、驗證方法，全部寫喺 → [`docs/DESKTOP-HANDOFF.md`](docs/DESKTOP-HANDOFF.md)（先睇呢份）**

## 30 秒版
- **桌面層 v3**（2026-09-28 全面重做）：`index.html` 嘅 `<style id="desktop-layer">`（line ~541）。
  ≥1024：sticky 導覽 → hero（左文案／右 16 型 4×4 色牌）→ 版本卡 → 全闊情景帶 → 探索更多 4×2 → 頁尾。768–1023：乾淨單欄。
- **唔可以碰**：手機版任何排版 ✗。所有桌面規則必須 `@media (min-width:…)` **＋** `html.dt`；
  唯一例外：`#dtNav,#dtHeroCta,#dtTypeRows,#dtFoot{display:none}`。
- **`.hidden` 鐵律**：`#home` 同各 section 係靠 Tailwind `.hidden` 收埋；**唔准覆寫佢哋嘅 `display`**，要覆寫就一定寫 `:not(.hidden)`（舊版就係咁令主頁永遠收唔埋）。
- **永久禁止**：無條件 zoom／`.dm` 補償、`calc(50% - 50vw)` 全闊色帶（v3 桌面 `#app` 本身全闊，內容用 `--dt-w` 置中）。
- **一定要用真瀏覽器睇**：1920 / 1440 / 1280 / 1024 / 768 / 390px。

## 改完一定要跑
```bash
export NODE_PATH=<jsdom node_modules>
node tools/desktop_layout_test.js   # 37 項（鐵律 + DOM）
node tools/desktop_gate_test.js     # 34 項
node tools/deeplink_test.js && node tools/record_view_test.js && node tools/voice_test.js
python3 tools/preflight.py          # 20 項
python3 tools/desktop_render_test.py   # 45 項，真 Chrome 位置
python3 tools/mobile_zero_impact.py    # 手機零影響：54 張截圖 0 pixel 差異
```
「手機零影響」嘅基準係 **現行 index.html 剝走桌面層**（唔係 v2.0.0 —— 之後有好多同桌面無關嘅改動）。

## 美學（用戶要求）
app 感、唔係文件感：少卡框、少金標、大字、留空；首頁主角係 16 型色牌。**唔准加 emoji** ✗。唔准改 app 名做淨「16型人格測試」✗。
