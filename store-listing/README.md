# 港式 MBTI · Google Play Store 上架文案

> **用途**：將本文案直接複製到 Play Console。
> **狀態**：v1.7.0 / 2026-07-31 起草。
> **語言**：zh-HK（繁體中文），Play 接受 zh-HK / zh-TW。

---

## 文檔索引

### 對外（Play Console 引用）

| 檔案 | 字數上限 | Play Console 欄位 |
|------|---------|-------------------|
| `app-name.txt` | 30 | 應用名稱 |
| `short-desc.txt` | 80 | 簡短描述 |
| `full-desc.md` | 4000 | 完整描述（Play 唔支援 markdown，貼嘅時候要去掉 `**` 等格式） |
| `content-rating.md` | — | Content rating 問卷答案 |
| `changelog.md` | 500 | 「新版內容」欄 |
| `data-safety.md` | — | Data safety form 答案 |
| `keywords.txt` | — | 自用，Play 唔收呢欄（僅 ASO 參考） |

### 對內（開發記錄 · **唔入 Play Console**）

| 檔案 | 用途 |
|------|------|
| `PHASE-LOG.md` | Phase-by-phase 開發記錄（包括今次嘅 Play 上架 phase） |
| `privacy-url-strategy.md` | Step 2a 嘅 Privacy URL 策略決定記錄 |

### 視覺素材（Play Console 必填）

| 檔案 | 規格 |
|------|------|
| `feature-graphic.png` | 1024×500 PNG |
| `screenshots/01-hero.png` ~ `05-explore.png` | 1170×2300 PNG · 9:16 |

### 站內對應

| 站內 | Play Console |
|------|--------------|
| `index.html` `#privacy` section | 「應用程式內容」內部 |
| `privacy.html` | **Privacy policy URL** 欄位 |

---

## 上架次序 checklist

1. 揀 `app-name.txt` 入面其中一個 name
2. 揀 `short-desc.txt` 入面其中一個 short
3. `full-desc.md` 主稿微調 + 去 markdown 貼到 Play
4. 填 `content-rating.md` 答案
5. 填 `data-safety.md` 答案
6. `changelog.md` 最近版本拎一段
7. 上載 `feature-graphic.png`
8. 上載 `screenshots/01-hero.png` ~ `05-explore.png`
9. 填 Privacy URL = `https://fung2222.github.io/hk-mbti/privacy.html`
10. **唔好貼 `keywords.txt`**（Play 冇呢欄）
11. **唔好貼 `PHASE-LOG.md` / `privacy-url-strategy.md`**（純內部記錄）

---

## ⚠️ Play Store 唔接受 markdown

完整描述貼入 Play Console 時，要將 `**bold**` 改做 `*bold*`（Play 用單星做粗體），
或者直接清走 markdown 格式。建議貼之前用純文字編輯器開一次。