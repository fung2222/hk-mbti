# iOS 上架 · 詳細步驟流程 ＋ 資料清單（執行版）

> 姊妹文件：`APPLE-STORE-PREP.md`（規則／策略／決策）
> 呢份係**執行清單** —— 你可以逐項打勾。**現階段唔開工**，等你 Android 版完成先。
> 所有規格 2026-09-29 查 Apple 官方（App Store Connect Help）。

---

## Part 0 · 一頁睇晒

| | 邊個做 | 需時 | 幾時 |
|---|---|---|---|
| Phase 1 開 Apple Developer 帳號 | **你** | 30–45 分鐘（審批 1–3 日） | 你話開始之後 |
| Phase 2 App Store Connect 建 App | 你 + 我 | 30 分鐘 | 同上 |
| Phase 3 做 iOS 殼（Capacitor）＋ native 功能 | **我** | 約 3–7 個工作日 | Android 穩定後 |
| Phase 4 素材（截圖／文案／私隱） | 我起草，你審 | 1–2 日 | 同上 |
| Phase 5 TestFlight 內測（自己／朋友試） | **你**（要有 iPhone） | 1–3 日 | 同上 |
| Phase 6 送審 | 你撳，我 prep | 審核 1–3 日 | 同上 |
| Phase 7 上架 | 你撳 | — | — |

**總成本**：US$99/年（≈HK$770）＋ 你嘅時間。其他全部我做。
**關鍵前提**：借到一部 iPhone（身份驗證 + TestFlight + IAP 測試）。

---

## Part A · 你要準備嘅資料（打勾清單）

### A1. Apple ID（如果冇）
- [ ] 一個**你長期用**嘅 email（建議唔好用公司／會停用嘅）
- [ ] 密碼（Apple 要求強密碼）
- [ ] 可收 SMS 嘅電話號碼
- [ ] **開啟雙重認證**（Apple 強制；網頁 appleid.apple.com 可以做，Windows 都得）

### A2. 身份證明（報名時要）
- [ ] **香港身份證** 或 **護照**（要影相上載；Apple 會驗證法定姓名）
- [ ] 證件上嘅**英文姓名**要同 Apple ID 一致
- [ ] 地址（英文；**唔可以用郵政信箱**）
- [ ] ⚠️ 如果唔想提供證件相：官方講可以**聯絡 Apple 攞替代驗證方法**（但會慢）

### A3. 付款
- [ ] **你自己名下嘅信用卡**（官方明文：個人報名必須用自己張卡，用別人卡會延遲）
- [ ] 額度夠扣 US$99（一次過年費，之後每年自動續）

### A4. 要決定嘅內容（我幫你出選項，你揀）
- [ ] **App Store 上嘅 App 名**（30 字內；唔可以純 generic，例如淨係「MBTI 測試」唔得，容易撞名）
- [ ] **副標題**（30 字內）
- [ ] **開發者顯示名** = 你法定姓名（你已接受 ✓，冇得改）
- [ ] **賣唔賣 IAP**（HK$18 完整分析 → iOS 要另寫 StoreKit 一套）
- [ ] **支唔支援 iPad**（支援就要多做 iPad 截圖；唔支援可以設定為 iPhone-only）

### A5. 裝置
- [ ] **iPhone** —— **Roy 2026-09-30 決定：當長遠投資，自己買一部**（將來做其他 app 都用得，唔止呢個 app）
  - **型號門檻**：iOS 26 支援 **iPhone 11 或之後**（＋ iPhone SE 2／3）
  - ✅ **建議買 iPhone 13 或以上** —— iPhone 11 已經係 iOS 26 最低線，下年 iOS 27 可能跌出支援，長遠反而蝕
  - ❌ **唔好買 iPhone X／8／7 或更舊** —— 唔支援 iOS 26，Apple Developer app／TestFlight 可能裝唔到
  - **二手檢查清單（必做）**：
    - [ ] **iCloud 鎖已關**（設定 → 最頂 Apple ID → 尋找 → 「尋找我的 iPhone」= 關）← 唔關＝變磚，最緊要
    - [ ] 電池健康 > 80%（設定 → 電池 → 電池健康）
    - [ ] Face ID／Touch ID 正常、螢幕冇死點、鏡頭乾淨
    - [ ] IMEI 唔好係黑名單（要求賣家出示原盒／單）
    - [ ] 可以即場登入你自己 Apple ID 測試
  - 價位參考（2026-09 香港）：iPhone 13 二手約 **HK$1,800–2,800**（ezone 回收價表）；實際零售睇 Carousell／先達／翻新店
- [ ] Mac（**非必須** —— 雲端 build 一樣得）

---

## Part B · 逐步流程

### Phase 1 · 開 Apple Developer Program 帳號【你做】

**步驟**
1. 用 Windows／任何電腦開 https://developer.apple.com/programs/enroll/
2. 揀 **Individual（個人）**（唔係 Organization —— 個人唔需要 D-U-N-S、唔需要公司）
3. 登入 Apple ID（未開先開，開雙重認證）
4. 填**法定姓名（英文）／地址（英文）／電話**
5. 上載**身份證明**（可能要用 Apple Developer app 做，要 iPhone／iPad／Mac）
6. 畀 US$99（自己信用卡）
7. 等審批（通常 1–3 個工作日；有時要補文件）

**注意**
- ⚠️ 姓名一定要同證件**完全一致**（用別名／暱稱會延遲甚至拒）
- ⚠️ 官方：身份驗證**全程要同一部裝置**（唔好中途換機）
- ⚠️ 香港個人開發者**唔需要**公司註冊、商業登記
- ✅ 之後每年自動續 US$99；唔續 = app 落架

**做完嘅結果**：你會有 App Store Connect 登入權 + 可以出憑證。

---

### Phase 2 · App Store Connect 建 App【你 + 我】

1. 我幫你定 **Bundle ID**（例如 `hk.funggy.mbti`，唔可以同別人撞；一經設定**唔可以改**）
2. App Store Connect → My Apps → 新增 App（揀 iOS、填 App 名、語言：繁體中文）
3. 設定類別（建議 **Lifestyle**／Entertainment）、年齡分級問卷
4. 我先幫你填好所有文字欄位（你可以審）

---

### Phase 3 · 技術：做 iOS 殼【我做】

- 用 **Capacitor**（業界標準：一個 web 專案 → iOS／Android 原生殼）
- **共用你而家同一份網頁**（唔會 fork 兩個版本）
- 加 native 功能（見 Part C）
- 雲端 build（唔需要你部電腦做任何嘢）

**呢個階段我可以獨立做，唯獨「上真機試」需要你借 iPhone。**

---

### Phase 4 · 素材【我起草，你審】

- 截圖（見 Part D 規格）— 我用真機 render 或者你借到 iPhone 自己影都可以
- App 描述、關鍵字、promo text
- 隱私政策（**已有** `privacy.html` ✓ 但要確認涵蓋 App Store 要求）
- Support URL（可以先用 GitHub Pages 嘅頁）
- App Privacy 問卷（收集咩資料 → 我哋基本上「唔收集」）

---

### Phase 5 · TestFlight 內測【你做】

1. 我出 build → 上傳 App Store Connect
2. **內部測試**：最多 100 人（你自己 + 朋友團隊），**免 Apple 審核**，即刻試得
3. **外部測試**：要 Apple 審一次（通常 24 小時內），最多 10,000 人
4. 你（借 iPhone）用 TestFlight app 裝我哋個 app，試：
   - [ ] 首次開 app（要 cache 好，之後飛航模式都開到）
   - [ ] 答完 60 題、睇結果、分享卡
   - [ ] 語音朗讀有冇聲
   - [ ] 黑夜模式切換
   - [ ] 「我的記錄」保存
   - [ ] IAP 買完整分析（如果有做）

---

### Phase 6 · 送審【你撳，我 prep】

- 我預備好所有 metadata + 送審備註（**要寫明點解呢個唔係純網站**，見 Part E）
- 你撳 Submit
- 審核：新 app 通常 **1–3 日**（2026 統計：平均 8.6 小時；新上架通常耐啲）
- 可能會被拒 → 我睇拒稿原因 + 改 + 重交（Apple 有專門嘅拒稿原因代碼）

---

### Phase 7 · 上架後

- 上架後我哋可以揀**分階段發佈**（7 日內逐步推）
- 日後改內容 = 出新版（1–3 日審核）↔ Android 就係即時生效
- 每年續 US$99

---

## Part C · 我要做嘅技術清單（你唔需要理細節）

**C1 · 專案結構**
- `ios/` 資料夾（Capacitor 專案），唔會影響 `main` 上嘅網頁
- 一份 web code 兩個平台：網頁（GitHub Pages）／Android（TWA）／iOS（Capacitor）

**C2 · 內容打包（關鍵：要離線開得到）**
- 將 `index.html`＋CSS／JS＋16 型資料＋icons **打包入 app**（唔靠網絡）
- 語音檔（~7,660 字 mp3）：**兩個方案** →（a）打包入 app（app 會大好多）（b）用網絡攞（要上網先有聲）（c）iOS 原生 TTS 做後備。我會計清楚大小先建議
- 跑飛航模式測試（Apple 審核員一定會試）

**C3 · 加 native 功能（過 4.2 嘅彈藥）**
- [ ] 震動回饋（Haptics）— 答題／撳掣
- [ ] iOS 原生 Share Sheet — 分享成績卡
- [ ] 本地通知（Local Notification）— 例如「你上次未做完測試」
- [ ] StoreKit IAP — 解鎖完整分析（如果做）
- [ ] 開 app 動畫／啟動畫面（Splash Screen）— 令感覺似 app

**C4 · iOS 特有處理（WKWebView 差異）**
- [ ] Safe Area（iPhone 劉海／動態島）留白
- [ ] localStorage 喺 WKWebView 可能被系統清除 → 要防（改存 native storage 或加提示）
- [ ] Service Worker 喺 WKWebView 行為唔同 → 要驗證離線
- [ ] `100vh` 問題（iOS Safari／WKWebView 有工具列）→ 用 `dvh` 或 native 高度
- [ ] 音頻播放要 user gesture（同現在一樣 ✓）
- [ ] 分享卡 canvas 解像度／上載

**C5 · 雲端 build**
- 用 **Codemagic**（免費 tier 每月 500 分鐘）／Bitrise／GitHub Actions
- 憑證（Certificates／Provisioning Profiles）→ App Store Connect API Key 自動管理
- 唔需要 Mac

**C6 · 測試**
- 我部機冇 Mac／iOS → **唔可以本地跑 iOS**
- 我要靠：Capacitor 專案結構靜態檢查 + 你借 iPhone 用 TestFlight 試
- ⚠️ 呢個係唯一「我唔可以自己驗證晒」嘅環節，要你配合

---

## Part D · App Store 素材硬性規格（Apple 官方，2026-09-29 查）

### 截圖（1–10 張，`.jpeg`／`.jpg`／`.png`，**唔可以有透明／alpha channel**）
| 機種 | 尺寸（portrait） | 幾時必須 |
|---|---|---|
| **6.9"**（iPhone Air／18 Pro Max／17 Pro Max／16 Pro Max…） | **1320 × 2868** 或 1290×2796 或 1260×2736 | iPhone app 必須有 6.9" **或** 6.5" |
| 6.5"（14 Plus／13 Pro Max／12 Pro Max…） | 1284 × 2778 或 1242×2688 | 冇 6.9" 就要呢個 |
| **13" iPad**（iPad Pro M5／M4／Air） | **2064 × 2752** | **如果支援 iPad 就必須** |
| 12.9" iPad Pro | 2048 × 2732 | — |

- 冇提供細機尺寸 → Apple 會**自動縮放**（OK）
- App Preview 影片（可選）：15–30 秒，6.9" 用 **886 × 1920**

### 文字
| 欄位 | 上限 |
|---|---|
| App 名 | 30 字元 |
| 副標題 | 30 字元 |
| Promotional Text | 170 字元 |
| 描述 | 4,000 字元 |
| 關鍵字 | 100 字元（逗號分隔） |
| Support URL | 必須 |
| **Privacy Policy URL** | **iOS app 必須**（我哋有 `privacy.html` ✓ 要確認內容夠） |

### App Icon
- **1024 × 1024**，PNG，**冇 alpha**（Apple 自動產生其他尺寸）

### 年齡分級（新制，2025-07 起；2026-07 加咗 social media 問題）
- 值：**4+ / 9+ / 13+ / 16+ / 18+**
- 要答：In-App Controls、Capabilities（**Unrestricted Web Access**／UGC／Social Media／Messaging／Advertising）、Mature Themes、Medical or Wellness、Sexuality/Nudity、Violence、Chance-Based Activities
- **我哋預計**：
  - ⚠️ **唔可以填「Unrestricted Web Access」**（因為我哋只載入自己網站）→ 否則會變 16+
  - 「Health or Wellness Topics」（性格／心理相關）→ 可能被歸 9+；保守起見**填 9+ 最安全**（唔好搏 4+）
  - 冇 social media、冇 UGC、冇 ads（現階段）→ 唔會升高
- 分區：香港冇額外要求；中國區唔上就唔理（韓國、巴西、澳洲有地區附加級別）

### App Privacy（必須填問卷）
- 我哋情況：**唔收集個人資料**（記錄全部存喺用戶手機）
- ⚠️ 但要用 GoatCounter（匿名統計，cookieless）→ 睇下要唔要聲明「Usage Data」。**保守做法：如實聲明「Diagnostics／Usage Data 匿名、唔連結到你」**，唔好漏報（漏報係常見拒稿／落架原因）

---

## Part E · 常見拒稿原因 + 我哋點避

| 條文 | Apple 原文重點 | 我哋點避 |
|---|---|---|
| **4.2 Minimum Functionality** | 「elevate it beyond a repackaged website…not 'app-like' → doesn't belong on the App Store」 | 加 native 功能（C3）＋ 離線可玩 ＋ 送審備註要寫「有咩係 Safari 做唔到」 |
| **4.2.2** | 「apps shouldn't primarily be… web clippings, content aggregators」 | 內容打包入 app（唔係 remote 載入）＝ 唔似 web clipping |
| **4.2.6** | 「apps created from a commercialized template or app generation service will be rejected」 | ⚠️ **用 Capacitor 自己包（framework）冇問題，但唔好用「網站一鍵轉 app」嗰類代提交服務**，要**我哋自己名義提交** |
| **4.3(b) Spam** | 已有大量同類 app → 要「meaningfully different」 | 我哋差異化：**港式廣東話情景題**（市面 MBTI app 幾乎冇）＋ 香港統計數據 |
| **2.5.6** | 瀏覽網頁必須用 WebKit | Capacitor 用 WKWebView ✓ |
| **5.1.1(i)** | 每個 app 必須有 privacy policy | `privacy.html` ✓（送審前我會核對） |
| **1.4.1** | 唔可以聲稱醫療診斷 | 加免責（同 Play 版一樣）：MBTI 係性格參考，唔係心理診斷 |
| **2.1 App Completeness** | 唔可以有死 link／placeholder | 送審前我會全 app 掃一次 |

---

## Part F · 時間表（配合你 Android）

```
而家 ──────────────────────────────────────────────
  │ 你：Play 封閉測試 12×14（跑到 ≈ 10-12/13）
  │ 你：睇 GoatCounter 數據（iPhone 訪客佔比）
  │ 我：（唔動 iOS，除非你叫我）
  ▼
Android 正式版上架
  │
  ├─ 你：開 Apple 帳號（1–3 日審批）
  ├─ 我：做 iOS 殼（3–7 日）
  ├─ 一齊：TestFlight 試（1–3 日）
  └─ 送審（1–3 日）→ 上架
```

**可以並行**：Apple 帳號申請（1–3 日審批）可以喺你 Play 14 日跑緊時做，唔會撞。

---

## Part G · 未決定／要你決定嘅（唔急）

1. **賣唔賣 IAP**（HK$18 完整分析）→ 要就要 iOS 另寫 StoreKit
2. **語音檔點處理**（打包／網絡／原生 TTS）→ 我計清楚再建議
3. **App Store 上嘅 App 名** → 我出 3 個候選你揀
4. **支唔支援 iPad** → 唔支援可以 iPhone-only（少做 iPad 截圖）
5. **上唔上中國區** → 我建議**唔上**（避 ICP 備案）
6. **GoatCounter 要唔要喺 iOS 版停用** → 停用最簡單（App Privacy 可以填「唔收集」）
