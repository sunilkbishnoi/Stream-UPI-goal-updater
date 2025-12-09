# 🚀 Stream-UPI-Goal-Updater

A tool for streamers to **auto-update donation goals using Freecharge UPI payments**, store transactions in Supabase & display goal overlays on OBS or browser.

Made by **[Sunil Bishnoi](https://github.com/sunilkbishnoi)**

---

## 📌 Features

* Auto reads Freecharge transaction history
* Stores only **new transactions** to Supabase
* Tracks goal progress and donors
* OBS/Streaming overlays supported
* Can be self-hosted with your own Supabase
* No old duplicate transactions synced

---

# 🧩 Project Structure

```
📦 Stream-UPI-Goal-Updater
├─ 🌐 Web Frontend (Goal Display + Donor List)
└─ 🧩 Freecharge Chrome Extension (Syncs transactions)
```

Works together like this:

Freecharge → Chrome Extension → Supabase → Website → OBS Overlay

---

# 🔧 Setup Guide (Run with your own Supabase)

Follow step by step ↓

---

## 1️⃣ Clone & Install

```bash
git clone https://github.com/sunilkbishnoi/Stream-UPI-goal-updater
cd Stream-UPI-Goal-Updater
npm install
```

---

## 2️⃣ Create Supabase Project

Go to [https://supabase.com](https://supabase.com) → create project

Copy your:

✔ Project ID
✔ URL
✔ Anon Key
✔ Service Role Key

---

## 3️⃣ Setup `.env`

Create `.env` inside project root and fill with your project details:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb-pub-xxxxxxxxxxxx"
```

---

## 4️⃣ Update Chrome Extension Endpoint

Open file:

```
extension/content.js
```

Replace:

```js
const API_ENDPOINT = "https://your-project-id.supabase.co/functions/v1/sync-freecharge";
```

---

## 5️⃣ Update Supabase Config

Open:

```
supabase/config.toml
```

Replace project id:

```
project_id = "your-project-id"
```

---

## 6️⃣ Link DB & Create Tables Automatically

```bash
npx supabase link --project-ref your-project-id
npx supabase db push
```

This creates table automatically:

| Column         | Type      | Notes            |
| -------------- | --------- | ---------------- |
| id             | uuid      | Primary key      |
| transaction_id | text      | Unique ref ID    |
| name           | text      | Sender/Merchant  |
| date           | text      | Transaction date |
| status         | text      | Always Success   |
| amount         | numeric   | Amount           |
| created_at     | timestamp | Auto             |

---

## 7️⃣ Deploy Sync Function

```bash
npx supabase functions deploy sync-freecharge
```

Go to Supabase Dashboard → Functions → `sync-freecharge`
Add env:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Save → Redeploy if needed.

---

## 8️⃣ Load Chrome Extension

1. Open Google Chrome
2. Go to `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select `extension/` folder

---

# 🚀 Start Using

1. Open **Freecharge login**
2. Visit page:
   [https://www.freecharge.in/transactions-history](https://www.freecharge.in/transactions-history)
3. Extension auto detects transactions

### First time:

🟡 Baseline saved → No old sync

### New donations:

🟢 Auto sync → stored in Supabase

---

# 🏠 Run Website Locally

```bash
npm run dev
```

Open in browser:

```
http://localhost:8080
```

You will see:

✔ Goal Progress
✔ Transactions list
✔ Overlay links

---

# 🎥 OBS Overlay URLs

| Display     | URL                         |
| ----------- | --------------------------- |
| Donation QR | `http://localhost:8080/qr`         |
| Top Donors  | `http://localhost:8080/top-donors` |

(Replace with your hosted domain if deployed)

---

# 🔥 Hosting

Deploy easily:

### Vercel (Recommended)


# Troubleshooting

| Issue                | Solution                                    |
| -------------------- | ------------------------------------------- |
| No data syncing      | Check API_ENDPOINT & deployed function      |
| Sync failed          | Supabase CORS/env missing in function       |
| Old data syncing     | This extension saves baseline automatically |
| Want to resync fresh | Run `chrome.storage.local.clear()`          |

---

# Author

**Sunil Bishnoi**

📌 GitHub: [https://github.com/sunilkbishnoi](https://github.com/sunilkbishnoi)

⭐ If this helped you — star the repo!

---

# Future Upgrades (possible)

* Live donation popup on OBS
* Telegram/Discord bot notifications
* Admin panel for transaction editing
* Donor leaderboard animations
* Custom Sound/voice alerts
* Multi-UPI support
---
