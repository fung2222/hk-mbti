# 香港 MBTI（港MBTI）專案結構報告 · v1.5

> **凍結版本：** v1.5.0（用戶確認「暫時滿意」里程碑）  
> **報告日期：** 2026-07-29  
> **用途：** 日後編輯 / 續做 / 上架 Play 時嘅單一真相來源（SSOT）  
> **Live URL：** https://fung2222.github.io/hk-mbti  
> **Repo：** https://github.com/fung2222/hk-mbti（public · branch `main`）  
> **工作目錄：** `/opt/data/repos/hk-mbti/`  
> **備份：** `/opt/data/backups/hk-mbti-v1.5-20260729/`  
> **Git tag：** `v1.5.0`

---

## 1. 產品定位

| 項目 | 內容 |
|------|------|
| 中文名 | 香港 MBTI / 港MBTI |
| 一句話 | 60 題廣東話版港式性格測試 |
| 副標（定稿） | 5 分鐘知道你是茶餐廳、港鐵、7-11 三種情景裡面，邊一種人 |
| 語言 | **繁中 + 廣東話為主**；類型名可「中文 + 英文並列」（如 INTJ 建築師 / Architect） |
| 差異化 | 港式情境題（非 16P 抽象翻譯）+ 社交/戀愛場景攻略 + 本地語氣 |
| 定位聲明 | **娛樂性測試**，非臨床/學術診斷 |
| 商標注意 | 對外避免寫成 Myers-Briggs 官方；可用「16 型性格參考 / 港式性格測試」 |

**刻意唔做嘅事：** 唔 clone 16Personalities UI；唔靠全球英文內容硬譯。

---

## 2. 版本時間線（濃縮）

| 版本 | 重點 |
|------|------|
| v1.0–1.1 | 60 題 prototype、GitHub Pages 上線、修復 orphan script / startTest |
| v1.2 | 副標「廣東話版」；社交 + 戀愛攻略；PWA icon「港」 |
| v1.3–1.4 | 分享卡真 PNG、結果頁 bugfix、繁中化 data.js、3 版本測試 |
| **v1.5（而家）** | 雙擊確認版本、字體加大、題目分層 shuffle+變體、16 型統計、Share 圖+網址、滿意凍結 |

---

## 3. 檔案結構

```
/opt/data/repos/hk-mbti/
├── index.html          # UI + 60 題庫 + app 邏輯（主檔）
├── data.js             # LETTERS（8 維度）+ TYPES_FULL（16 型長文）
├── social.js           # SOCIAL + ROMANCE（場景 × 16 型）
├── manifest.json       # PWA · version 1.5.0
├── sw.js               # Service Worker · cache hk-mbti-v1.5
├── VERSION             # 1.5.0
├── icon-192.png / icon-512.png / icon-maskable.png
├── apple-touch-icon.png / favicon.png
└── .git/
```

**相關但非 runtime：**
- `/opt/data/reports/hk-mbti-market-analysis.md` — 早期市場報告  
- `/opt/data/reports/strategy.md` — 早期執行方案  
- `/opt/data/prototype/hk-mbti/` — 早期 prototype（以 repos 為準）

---

## 4. 功能地圖（v1.5）

### 4.1 測試核心
- **3 個版本（雙擊確認：一按著燈 → 再按進入）**
  - 🌟 生活版 60 題 · 5 分鐘  
  - 🎯 進階版 30 題 · 3 分鐘  
  - 🍼 BB 版 10 題 · 1 分鐘  
- **出題引擎 `buildDeck()`**
  - 5 軸分層：E/I · S/N · T/F · J/P · T/A（每軸 12 題庫）  
  - 按版本每軸抽 12 / 6 / 2 題  
  - **題序 shuffle + 選項 A–D 順序 shuffle**（分數向量跟住走）  
  - 部分題幹 `Q_ALTS` 港式變體  
- **計分 `calcScore()`**  
  - 跟答案向量 key（E/I/S/N/T/F/J/P/A），**唔靠題序分段**  
  - 輸出 4 字母 + `-T` / `-A`  
- 場景題方向：茶餐廳、港鐵、7-11（O Camp 已從主標/主題抽走，部分攻略或舊字可能仍有）

### 4.2 結果頁
- 真實 **PNG 分享卡**（canvas → `<img id="shareCardImg">`，可長按儲存）  
- 左上 **logo icon**（非純文字「港」）  
- 下載 / Share  
- **Share（v1.5）：** 優先 `navigator.share({ files: [PNG], text: 網址 })`；唔支援則下載圖 + copy 網址  
- 詳細描述、場景配對、相容類型、看完整分析  
- localStorage 儲存上次結果；主頁可查看/清除  

### 4.3 性格百科 Knowledge Hub
- 4 字母維度解釋  
- 16 型 grid → type 詳情頁（`TYPES_FULL`）  
- 性格比較工具（相似度 + 維度中文解釋）  

### 4.4 社交 / 戀愛
- `social.js`：多場景 × 16 型攻略  
- 格式慣例：性格 → 最忌 → 最有效 → punchline  
- Section 切換必須用完整 `show()` id 列表，**唔好**用 section 級 `innerHTML` 洗 container  

### 4.5 PWA
- manifest · theme `#D4A95F` · standalone  
- icons：192 / 512 / maskable / apple-touch / favicon  
- install banner（約第 2 次 visit）  
- SW cache-first：`hk-mbti-v1.5`  

### 4.6 首頁統計
- 16 型排名 bar：% · 人數 · 約等於香港人口（750 萬 × 佔比）  
- **基線：** 常見分佈 × 143,021 量級 + **本機**每次完成 +1（`localStorage hkmbti_type_counts`）  
- 註明：唔係全港實時普查（無後端）  

### 4.7 UX / 視覺
- Mobile-first · 金 `#D4A95F` · 紙色 `#FAF7F0`  
- v1.5 全局字體加大（xs / 10px / sm / 選項）  
- Logo 全站統一用 `icon-192.png`  

---

## 5. 技術約定（改 code 前必讀）

1. **靜態站** — HTML + vanilla JS + Tailwind CDN；GitHub Pages `main` `/`  
2. **資料掛 `window.*`** — `QUESTIONS` / `TYPES` / `TYPES_FULL` / `LETTERS` / `SOCIAL` / `ROMANCE`  
3. **`show(id)`** 必須列出全部 section id，否則頁疊頁  
4. **結果卡 = `<img>`**，唔好再寫死依賴 `#shareCard` / `#mbtiBig` / `#bar1` 等已刪 DOM  
5. **`TYPES_FULL` 可能缺 `friend`/`conflict`** — 用 `(F.friend \|\| F.love)` fallback  
6. **Hard reload / cache-buster** — Pages CDN + SW；改版要 bump `sw.js` CACHE  
7. **Git 身份：** `fung2222` / `fung2222@users.noreply.github.com`  
8. **用戶信號：**「唔好亂改」→ 先 audit 再改；silent fail → 先 console/browser 驗證  

---

## 6. 已修過嘅重要 Bug（防止回歸）

| 症狀 | 根因 | 修法方向 |
|------|------|----------|
| 按鈕完全無反應 | orphan `<script>` / 未 hoist `window.*` | 單 script、函式掛 window |
| 最後一題無反應 | `renderResult` 寫已刪 DOM | 只寫仍存在嘅 node + generateCardImage |
| 看完整分析無反應 | `F.friend.join` undefined | fallback love |
| 分享只有 link | share 無 files | File + text 網址 |
| 題序固定好悶 | 固定 QUESTIONS 序 | buildDeck 分層 shuffle |
| BB/進階維度失衡 | 截前 N 題 | 每軸抽樣再 shuffle |
| 英文技能/標籤 | data.js 英字 | 繁中化（類型名保留中英並列） |

---

## 7. 內容與文案定稿（用戶拍板）

- 副標：三種情景「裡面，邊一種人」  
- 主場景：**茶餐廳 · 港鐵 · 7-11**（唔再用 O Camp 做主宣傳）  
- 完整分析頁：**技能/標籤/工作等用繁中或廣東話**；類型標題可英文+繁中  
- Share：**圖 + 網址**，唔好淨 link 長文  
- 版本入口：**雙擊確認**有立體感  

---

## 8. 刻意未做 / 已知限制

| 項目 | 狀態 |
|------|------|
| 全站真實多人即時統計 | 無後端；只有基線+本機 |
| Premium 深度報告收費 | UI 概念有，未接支付 |
| 題庫大幅擴充（每軸 >12） | 有變體機制，庫仍 60 |
| 心理測量學信度研究 | 娛樂定位，未做 |
| Google Play 上架 | 討論過可行；**未實施** |
| iOS App Store | 未做 |
| GitHub PAT 長期存放 | 用完應 revoke；勿寫入 repo |

---

## 9. 未來方向（傾過，未開工）

### 9.1 產品
- 更多港式場景題庫（保持計分向量穩定）  
- 雙人互測 / 型 vs 型對照表  
- 香港公眾人物「估型」社區向內容（注意誹謗/商標）  
- Premium 解讀（若做：條款+私隱+支付）  

### 9.2 上架 Google Play（建議序）
1. 定對外名稱（減 MBTI 商標風險）+ 私隱政策 / 條款頁  
2. TWA 或 Capacitor 包殼  
3. Play 截圖、分級、閉測  
4. 若要「全港排行」→ Firebase 等後端  
5. 原生重寫非優先  

### 9.3 技術債（有空先做）
- `index.html` 過大 → 拆 `questions.js` / `app.js`  
- OG 圖專用 1200×630  
- `data.js` 再掃一次殘餘英文  
- E2E 煙霧測試（BB 完卷 + share canShare）  

---

## 10. 本地儲存 Key

| Key | 用途 |
|-----|------|
| `hkmbti_last_result` | 上次 MBTI + timestamp |
| `hkmbti_type_counts` | 本機各型完成次數 |
| `hkmbti_visits` | 訪次（install banner） |
| `hkmbti_install_dismissed` | 關閉安裝提示 |

---

## 11. 部署與備份

### 部署
```bash
cd /opt/data/repos/hk-mbti
# 改完
git add -A
git -c user.name="fung2222" -c user.email="fung2222@users.noreply.github.com" commit -m "..."
git push origin main
# 用戶端 hard reload；SW cache 名已係 hk-mbti-v1.5
```

### 還原 v1.5 備份
```bash
# 檔案備份
ls /opt/data/backups/hk-mbti-v1.5-20260729/
# 或 git
cd /opt/data/repos/hk-mbti && git checkout v1.5.0
```

### 報告與策略舊檔
- 本報告：`/opt/data/reports/hk-mbti-project-report-v1.5.md`  
- 市場：`/opt/data/reports/hk-mbti-market-analysis.md`  
- 策略：`/opt/data/reports/strategy.md`  

---

## 12. 編輯速查（俾未來嘅你 / Agent）

**改題目** → `index.html` 內 `window.QUESTIONS`；保持每軸約 12 題；新題加 `d:"軸 - 場景"`；可選 `Q_ALTS`。  

**改 16 型長文** → `data.js` `TYPES_FULL`（繁中）。  

**改短描述/slogan** → `index.html` `window.TYPES`。  

**改社交戀愛** → `social.js`；唔好洗掉 scenario container。  

**改版本號** → `VERSION` + 首頁 badge + `sw.js` CACHE + `manifest.json` version 一齊 bump。  

**改 brand icon** → 重 gen PNG 全套 + 分享卡 drawImage 用 `icon-192.png`。  

**用戶偏好** → 廣東話短答；一次做一批；「唔好亂改」；URL 優先於檔案下載；手機 hard reload 常要。  

---

## 13. 一頁總結

港MBTI v1.5 係一個 **GitHub Pages 靜態 PWA**：廣東話 60 題（可 30/10）、港式場景、16 型百科 + 社交戀愛攻略、真圖分享、本機紀錄與統計示意。用戶 2026-07-29 表示暫時滿意並凍結此版。下一步若續做，優先參考本報告 §8–9，唔好無計劃重寫 apps 主幹。

---

*End of report · v1.5.0*
