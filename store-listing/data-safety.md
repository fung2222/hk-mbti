# Google Play · Data Safety Form 答案（v1.7.0 · 2026-07-31 更新）

> **狀態**：✅ 站內私隱頁已完成（Step 1b-C · index.html `#privacy` section）
> **狀態**：✅ 獨立 Privacy URL 已上線（Step 2a · `privacy.html`）
> **Play Console 入口**：應用內容 → Data safety

最終 Privacy URL：
```
https://fung2222.github.io/hk-mbti/privacy.html
```

---

## 一、Data collected（資料收集）

| 問題 | 答案 |
|------|------|
| App 是否收集或分享用戶資料？ | **是** |
| 收集嘅資料會加密傳輸？ | **不適用**（本地儲存） |
| 用戶可否要求刪除資料？ | **是** |

---

## 二、詳細資料類別

| 類別 | 收集？ | 說明 |
|------|--------|------|
| 📍 位置 | ❌ 否 | |
| 💬 個人資料（Personal info） | ✅ 是 | 姓名 / 稱呼（用戶可選） |
| 💰 財務資料 | ❌ 否 | |
| 🏥 健康資料 | ❌ 否 | 性格測試唔屬於醫療健康 |
| 📱 訊息 | ❌ 否 | 聊天內容無；姓名屬「個人資料」 |
| 🖼 媒體檔案 | ❌ 否 | |
| 📂 檔案 / 文件 | ❌ 否 | |
| 📅 行事曆 | ❌ 否 | |
| 👥 聯絡人 | ❌ 否 | |
| 📊 App 活動 | ✅ 是 | 測試結果、版本、稱呼（localStorage） |
| 🌐 Web 瀏覽 | ❌ 否 | |
| 📈 App 資訊 / 效能 | ❌ 否 | |
| 🆔 裝置 ID | ❌ 否 | |

---

## 三、Data handling（資料處理）

| 項目 | 答案 |
|------|------|
| 收集 | ✅ 是（localStorage） |
| 分享 | ❌ 否 |
| 加密傳輸 | 不適用（本地） |
| 加密儲存 | ✅ 是（瀏覽器管理 localStorage） |
| 用戶可要求刪除 | ✅ 是（App 內「歷史紀錄」） |

---

## 四、Play Console 填表指引（直接 copy）

### Step 1 · 「Does your app collect or share any of the required user data types?」

```
☑ Yes
```

### Step 2 · 「Is all of the user data collected by your app encrypted in transit?」

```
☑ No (not applicable — local storage only, no transmission)
```

### Step 3 · 「Do you provide a way for users to request that their data is deleted?」

```
☑ Yes
```

### Step 4 · 個別資料類別勾選

**Personal info**：

```
☑ Name  (Optional, user-provided nickname / display name)
  → Collected: Yes
  → Shared: No
  → User can delete: Yes
  → Purpose: App functionality (display on share card, history prefill)
```

**App activity**：

```
☑ App interactions  (Test results, version, timestamp)
  → Collected: Yes
  → Shared: No
  → User can delete: Yes
  → Purpose: App functionality (history recall, last-5 record)
```

其他所有類別：**☑ No**

### Step 5 · Privacy policy URL

```
https://fung2222.github.io/hk-mbti/privacy.html
```

### Step 6 · 確認資料用途

```
App functionality: Display user nickname on share card, recall test history
```

---

## 五、提交前 checklist

- [ ] Data safety form 填妥（跟 Step 1–6）
- [ ] Privacy URL 已經可以瀏覽：
      `https://fung2222.github.io/hk-mbti/privacy.html`
- [ ] 站內 `#privacy` section（風琴）已經可以開到
- [ ] App 內「歷史紀錄」風琴可以逐筆刪除
- [ ] 全部按鈕喺實機測試 OK（唔好只信 HTTP 200）

---

## 六、⚠️ 重要陷阱（Play Console）

1. **唔好聲稱收集「Health data」** — 性格測試唔屬於醫療，聲稱會被要求醫療器械註冊
2. **唔好聲稱「Device ID」** — 我哋冇用，但 Play 預設有時會高亮，注意 uncheck
3. **「App interactions」** — Play 預設「否」，要主動勾選並描述清楚
4. **Privacy URL** — 必須係 HTTPS，加載成功（200），唔可以係 hash anchor
5. **Data deletion 選項** — 必須有實際 in-app 機制（我哋嘅歷史紀錄刪除掣 ✓）

---

## 七、審核後可能 follow-up

Play 審核員可能會 email 問：

- 「點解你哋收集 personal info 但唔上傳？」
  - 答：本地儲存用於歷史紀錄 recall；無 server-side collection

- 「點解 user 可以 delete data？」
  - 答：App 內主頁「歷史紀錄」風琴每筆都有 🗑 掣

- 「你哋嘅 Privacy URL 點解用 GitHub Pages？」
  - 答：完全 self-contained，無第三方追蹤，符合 minimal data collection 原則

預備呢啲答案喺心中，審核時間可由 7 日縮到 1–3 日。