// Freecharge Transaction Sync - Background Service Worker

// Listen for sync completion messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_COMPLETE') {
    console.log('Sync completed:', message.result);
    
    // Update badge to show sync status
    if (message.result.success) {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    } else {
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    }
    
    // Clear badge after 5 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 5000);
  }
});

// Handle extension icon click - open Freecharge transactions page
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'https://www.freecharge.in/transactions-history' });
});

console.log('Freecharge Sync background service worker started');
