# Stream-UPI-Goal-Updater

A tool for streamers to **auto-update donation goals using Freecharge UPI payments**, view transaction history, track top donors, and display live overlays on OBS.
Created by **[Sunil Bishnoi](https://github.com/sunilkbishnoi)**.

---

## 📌 Overview

Stream-UPI-Goal-Updater consists of **two parts**:

1. **Website**
2. **Freecharge Browser Extension**

When used together, donations received via Freecharge UPI are fetched automatically and reflected on the website with goal tracking and donor information.

---

## 🔧 How It Works

### 🧩 Freecharge Extension

* Login to Freecharge in Chrome/Edge/Brave browser.
* Open this link: **[https://www.freecharge.in/transactions-history](https://www.freecharge.in/transactions-history)**
* The extension automatically fetches transactions in real-time.
* Donations of **₹10 or more are auto-added to your goal**.
* A **notification sound alerts the streamer** each time a donation is captured.

> **⚠ Important:**
> Keep the transactions page open and active.
> If placed in background or switched to another tab, **auto-sync will pause**.

---
### 📥 Download Extension

Click below to download the Freecharge Extension ZIP file:

👉 **[Download Extension (.zip)](Freecharge-extension.zip)**

> After download → extract the zip → install manually using *Load Unpacked* in Chrome.

---



### 🌐 Website Features

🔹 Automatically receives donation transactions from extension
🔹 Add UPI ID manually *(use `@freecharge` UPI for auto goal update)*
🔹 Change goal amount anytime
🔹 Reset collected amount to zero
🔹 Add or delete donation manually
🔹 View top donor list
🔹 Customize notification sound

---

## 🎥 Streaming Overlay Links

| Feature                     | URL                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| QR/Donation Overlay for OBS | **[https://upigoalupdate.vercel.app/qr](https://upigoalupdate.vercel.app/qr)**                 |
| Top Donors Display          | **[https://upigoalupdate.vercel.app/top-donors](https://upigoalupdate.vercel.app/top-donors)** |

---

## 🚀 Getting Started

1. Install and open the extension (Freecharge Extension).
2. Log in to your Freecharge account.
3. Open `https://www.freecharge.in/transactions-history` (must remain open).
4. Open the website and set your UPI ID & Goal.
5. Start streaming — donations will now update automatically!

---

## 🧑‍💻 Author

**Sunil Bishnoi**
🔗 GitHub: [https://github.com/sunilkbishnoi](https://github.com/sunilkbishnoi)

If you find this useful, consider giving a ⭐ on GitHub!

