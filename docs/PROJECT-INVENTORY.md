# 港式 MBTI — 專案總索引（所有對話及資料）

> 由 Roy 2026-09-26 要求「完整 backup + 整理所有對話及資料」生成。
> 呢份係 SSOT 索引，任何檔案／狀態／歷史都可以由呢度追到。

---

## 1. 網站基本資料

| 項目 | 值 |
|---|---|
| Live | https://fung2222.github.io/hk-mbti |
| Repo | https://github.com/fung2222/hk-mbti · branch `main` |
| 工作目錄 | `/opt/data/repos/hk-mbti/`（唯一，禁止改 `/opt/data/pwa-source/`） |
| 包名（Play） | `com.fung2222.hkmbti` |
| 商店標題 | 港式 MBTI（唔好改成「16型人格測試」） |
| 聯絡／登入電郵 | fung22222@gmail.com（五個 2） |

---

## 2. 版本歷史（tag → commit）

| tag | commit | 備註 |
|---|---|---|
| v1.5.0 | 44540d3 | 2026-07-29 |
| v1.6.0 | 709df3d | 2026-07-29 |
| v1.7.0 | 4a5a47c | 2026-07-30 新 icon + 正名「港式 MBTI」 |
| v1.7.9 | a427b9c | 2026-08-05 三頁 + 9 廣告位 + IAP + T 恤 mockup |
| v1.7.11 | e15da05 | 2026-08-07 版本全線對齊 |
| v1.7.12 | 9d999bf | 2026-08-09 Play Internal Testing 上線 |
| v1.7.14 | afd56c6 | 2026-09-17 首頁 UI 打磨 |
| v1.9.0 | d599b20 | 2026-09-26 題庫準確度 freeze（112 題 2:2） |
| v2.0.0 | 31b7166 | 2026-09-26 正式推 v2.0.0（四 surface 一致） |
| （未 tag） | 346bab7 | 2026-09-26 題庫 A/B/C 徹底修復（109 題） |

完整 commit 歷史：`git log --oneline --all --decorate`

---

## 3. 題庫現狀（HEAD 346bab7）

- **109 題**：E/I 19 · S/N 20 · T/F 19 · J/P 31 · T/A 20
- **全自平衡**（每題兩極等重 → 隨機作答唔偏）
- **0 死重選項**（無 `{1,1}` 中性選項）
- 抽題：`buildDeck('bb'|'advanced'|'life')` → 10 / 30 / 60 題（每軸抽 2 / 6 / 12）
- 計分：分數 → 頻密度 → 亂數（memoised，同一答案集結果恆定）

**今次 A/B/C 修復（commit 346bab7）**：
- A 計分錯配：T/F 道歉 C↔D、E/I 帶朋友走軸重寫、S/N 揀科 B 去 F 味
- B 死重 `{1,1}`→弱極：S/N 7 題、T/F 4 題、J/P 旅行、T/A 7 題
- C 重複刪 3 題：E/I 返工MTR、T/F 立場、J/P 假期；走軸／文法／label 修復

---

## 4. 審計工具（入 repo）

- `tools/question_audit.js` — 題庫審計（結構／計分／文法／走軸／重複／變體撞 key／簡體字）
- `tools/preflight.py` — 15 項 deploy 前檢查（inline JS syntax、版本一致、onclick 存在、emoji 殘留）
- `tools/sync-version.sh` — `VERSION` 作單一來源同步 manifest/sw/UI
- `.githooks/pre-push` — push 前自動跑 preflight

---

## 5. 題庫資料檔案（scratch，唔入 repo）

- `/opt/data/profiles/apps/cache/scratch/question_bank_full.json` — 完整題庫 dump
- `/opt/data/profiles/apps/cache/scratch/bank/E_I.md` `S_N.md` `T_F.md` `J_P.md` `T_A.md` — 分軸審查檔
- `/opt/data/profiles/apps/cache/scratch/final_audit.js` — scratch 版審計（同 repo 版同步）
- `/opt/data/profiles/apps/cache/delegation/live/deleg_9f7dfbba/task-{0..4}.log` — 5 軸 sub-agent 審核 transcript

---

## 6. Skills（apps profile）

- `hk-mbti-webapp` — 主站維護（freeze、導航、字體、app-feel、題庫審計）
- `github-pages-push-helper` — Pages legacy deploy + stuck-build 應對
- `hk-mbti-play-store-launch` — Play 上架流程
- `web-pwa-design` — PWA 設計規範

位置：`/opt/data/profiles/apps/skills/development/<name>/`

---

## 7. Play 上架狀態

- **上載金鑰重設**：已提交 Google 審批（Play App Signing 啟用，新 .pem 註冊，指紋匹配）→ **等 Google 審批**（未完成）
- **keystore**：`/opt/data/backups/hk-mbti-uploadkey-20260926/`（`.p12` alias `upload`）
- **封閉測試 Alpha**：未達 12 testers × 連續 14 日 → **禁止申請正式版**
- **商店 listing**：`store-listing/`（changelog、full-desc、data-safety、feature-graphic-v2）
- **對外 SSOT**：`docs/v2.0-release-pack.md`

---

## 8. Backup 清單（/opt/data/backups/）

| 檔 | 說明 |
|---|---|
| hk-mbti-full-`<stamp>`.tar.gz + `.gitbundle` | 完整 backup（工作樹 + 全 git 歷史；精確 stamp 見同名 `.meta.txt`） |
| hk-mbti-v2.0.0-freeze-20260926-135002.tar.gz | v2.0.0 freeze |
| hk-mbti-v1.9.0-freeze-20260926-103718.tar.gz | v1.9.0 freeze |
| hk-mbti-v1.7.14-freeze-20260917-005106.tar.gz | v1.7.14 freeze |
| hk-mbti-v1.7.12-freeze-20260809-061650.tar.gz | v1.7.12 |
| hk-mbti-v1.7.11-freeze-20260807-031825.tar.gz | v1.7.11 |
| hk-mbti-v1.7.9-freeze-20260805-150427.tar.gz | v1.7.9 |
| hk-mbti-grammar-fix-20260920-013515.tar.gz | 文法修復快照 |
| hk-mbti-uploadkey-20260926/ | Play 上載金鑰（.p12） |
| hk-mbti-v1.5 / v1.6 / v1.7 / v1.7.8 / play-prep | 早期版本 |

---

## 9. 統計／私隱

- GoatCounter：帳戶 `fung2222` · dashboard `fung2222.goatcounter.com`（私人）
- 5 頁落碼（index/privacy/record/stats/tee）；「累積樣本 143,022 人」係參考基線，非 app 收集
- 私隱聲明見 `privacy.html`（App 活動：頁面瀏覽）

---

## 10. 關鍵路徑速查

- 主站單一檔：`/opt/data/repos/hk-mbti/index.html`（234KB，含 `window.QUESTIONS`/`window.Q_ALTS`/`buildDeck`/`calcScore`/`renderResult`）
- 分享卡字體：`CARD_FONT_ID = "archivo-ta3"`；四字母 Archivo Black（唔改）
- 字型：iPhone PingFang HK／Android Noto Sans HK；分享卡 canvas 字暫唔跟 webfont
- freeze 記錄：`docs/freeze-log.md`
- 資料儲存 key：`docs/data-storage.md`
