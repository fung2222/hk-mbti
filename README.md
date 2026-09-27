# 港式 MBTI · 廣東話性格測試

廣東話／港式情境 MBTI 16 型人格測試 PWA。

- **Live**：<https://fung2222.github.io/hk-mbti/>
- **版本**：`VERSION` 檔（現時 2.0.0）
- **技術**：單一 `index.html` SPA + `data.js`／`social.js`／`voice-data.js`，GitHub Pages 發佈，Service Worker 離線快取

## 檔案
| 檔案 | 用途 |
|---|---|
| `index.html` | 主 SPA（測驗、16 型、結果、相處／拍拖、設定）|
| `record.html` `stats.html` `tee.html` `privacy.html` | 獨立頁（紀錄／統計／TEE 解鎖／私隱）|
| `data.js` `social.js` `voice-data.js` | 題庫＋型格資料／場景內容／預錄語音 |
| `sw.js` `manifest.json` `icon-*.png` | PWA |
| `tools/` | 測試（jsdom）＋檢查腳本 |
| `demo/` | 版式示範頁（`noindex`，唔影響 live）|
| `docs/` | 報告、上架資料、**交接文件** |
| `store-listing/` | Google Play 上架文案／素材 |

## 給 AI 接手：睇呢兩份
1. [`AGENTS.md`](AGENTS.md) — 30 秒版規則
2. [`docs/DESKTOP-HANDOFF.md`](docs/DESKTOP-HANDOFF.md) — **桌面版主頁交接文件**（現況、做過咩、鐵律、驗證方法）

## 本機測試
```bash
export NODE_PATH=<jsdom node_modules>
node tools/desktop_layout_test.js && node tools/desktop_gate_test.js
python3 tools/preflight.py
```
