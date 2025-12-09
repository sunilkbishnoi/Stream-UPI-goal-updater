# Freecharge Transaction Sync - Chrome Extension

Automatically sync your Freecharge transactions to your donation tracker.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select this `chrome-extension` folder
5. The extension icon will appear in your toolbar

## Usage

### Automatic Sync
Simply visit https://www.freecharge.in/transactions-history while logged in. The extension will automatically detect and sync your transactions.

### Manual Sync
1. Click the extension icon in your toolbar
2. Click "Open Freecharge & Sync" to open the transactions page
3. Or click "Sync Current Page" if you're already on the transactions page

## How It Works

1. When you visit Freecharge's transaction history page, the extension scans for transaction data
2. It extracts transaction IDs, amounts, dates, and status
3. Sends the data to your donation tracker's API
4. Your tracker updates in real-time with the new transactions

## Icons

You'll need to add icon files to the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

You can use any icon or generate simple ones. Without icons, the extension will still work but show a default icon.

## Troubleshooting

- **No transactions found**: Make sure you're logged in to Freecharge and on the transactions history page
- **Sync failed**: Check your internet connection and try again
- **Extension not loading**: Ensure Developer mode is enabled in Chrome extensions

## Privacy

This extension only runs on freecharge.in pages and only sends transaction data to your own tracker API. No data is stored externally.
