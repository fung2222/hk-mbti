# 港式 MBTI · 廣東話性格測試

廣東話／港式情境 MBTI 16 型人格測試 PWA。

- **Live**：<https://fung2222.github.io/hk-mbti/>
- **版本**：`VERSION` 檔（現時 2.1.0）
- **技術**：單一 `index.html` SPA + `data.js`／`social.js`／`voice-data.js`，GitHub Pages 發佈，Service Worker 離線快取

## 檔案
| 檔案 | 用途 |
|---|---|
| `index.html` | 主 SPA（測驗、16 型、結果、相處／拍拖、設定）|
| `record.html` `stats.html` `privacy.html` | 獨立頁（紀錄／統計／私隱）|
| `data.js` `social.js` `voice-data.js` | 題庫＋型格資料／場景內容／預錄語音 |
| `sw.js` `manifest.json` `icon-*.png` | PWA |
| `tools/` | 測試（jsdom）＋檢查腳本 |
| `demo/` | 版式示範頁（`noindex`，唔影響 live）|
| `docs/` | 報告、上架資料、**交接文件** |
| `store-listing/` | Google Play 上架文案／素材 |

## 給 AI 接手：睇呢兩份
1. [`AGENTS.md`](AGENTS.md) — 30 秒版規則
2. [`docs/AI-HANDOFF-v2.1.0.md`](docs/AI-HANDOFF-v2.1.0.md) — **最新學生／在職情境分流、驗證、部署同後續工作**（2026-11-10；內含 v2.0.2／v2.0.1 文件連結）
3. [`docs/DESKTOP-HANDOFF.md`](docs/DESKTOP-HANDOFF.md) — 桌面版主頁原有規則

## 本機測試
```bash
export NODE_PATH=<jsdom node_modules>
node tools/desktop_layout_test.js && node tools/desktop_gate_test.js
python3 tools/preflight.py
python3 tools/desktop_render_test.py     # 真 Chrome：桌面實際位置（需要 playwright）
python3 tools/mobile_zero_impact.py      # 真 Chrome：手機零影響 pixel diff
```
