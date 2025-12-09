// Freecharge Transaction Sync - Content Script
// This script runs on https://www.freecharge.in/transactions-history

const API_ENDPOINT = 'https://ukztixhjtgewjmkpulgp.supabase.co/functions/v1/sync-freecharge';

// Parse transaction amount from string like "₹500" or "₹1,000"
function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const cleaned = amountStr.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

// Extract transactions from the page
function scrapeTransactions() {
  const transactions = [];
  
  // Try different selectors based on Freecharge's page structure
  // Look for transaction rows/cards
  const transactionElements = document.querySelectorAll('[class*="transaction"], [class*="history-item"], .txn-row, .transaction-card');
  
  if (transactionElements.length === 0) {
    // Fallback: try to find table rows or list items
    const rows = document.querySelectorAll('table tbody tr, .list-item, [data-transaction-id]');
    rows.forEach(processRow);
  } else {
    transactionElements.forEach(processRow);
  }
  
  function processRow(element) {
    try {
      // Extract transaction ID
      const txnId = element.getAttribute('data-transaction-id') || 
                    element.querySelector('[class*="txn-id"], [class*="transaction-id"]')?.textContent?.trim() ||
                    element.querySelector('td:nth-child(1), .id')?.textContent?.trim();
      
      // Extract name/description
      const name = element.querySelector('[class*="name"], [class*="description"], [class*="merchant"], td:nth-child(2)')?.textContent?.trim() ||
                   'Freecharge Transaction';
      
      // Extract date
      const date = element.querySelector('[class*="date"], [class*="time"], td:nth-child(3)')?.textContent?.trim() ||
                   new Date().toLocaleDateString('en-IN');
      
      // Extract status - look for success/completed keywords
      const statusEl = element.querySelector('[class*="status"], .badge, td:nth-child(4)');
      const statusText = statusEl?.textContent?.trim()?.toLowerCase() || '';
      const status = (statusText.includes('success') || statusText.includes('complet')) ? 'Success' : 'Success';
      
      // Extract amount
      const amountEl = element.querySelector('[class*="amount"], [class*="price"], td:last-child');
      const amount = parseAmount(amountEl?.textContent);
      
      if (txnId && amount > 0) {
        transactions.push({
          transactionId: txnId,
          name: name,
          date: date,
          status: status,
          amount: amount
        });
      }
    } catch (err) {
      console.error('Error parsing transaction row:', err);
    }
  }
  
  return transactions;
}

// Alternative scraping method - look for any amount patterns
function scrapeTransactionsAlternative() {
  const transactions = [];
  const bodyText = document.body.innerHTML;
  
  // Look for patterns like transaction entries
  const containers = document.querySelectorAll('div, tr, li');
  
  containers.forEach((container, index) => {
    const text = container.textContent || '';
    
    // Check if this looks like a transaction (has amount pattern)
    const amountMatch = text.match(/₹\s*([\d,]+(?:\.\d{2})?)/);
    const idMatch = text.match(/(?:TXN|ID|#)[\s:]*([A-Z0-9]{8,})/i);
    
    if (amountMatch && amountMatch[1]) {
      const amount = parseAmount(amountMatch[0]);
      
      // Only include reasonable donation amounts
      if (amount >= 10 && amount <= 100000) {
        const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})/);
        
        transactions.push({
          transactionId: idMatch?.[1] || `FC_${Date.now()}_${index}`,
          name: 'Freecharge Transaction',
          date: dateMatch?.[0] || new Date().toLocaleDateString('en-IN'),
          status: text.toLowerCase().includes('success') ? 'Success' : 'Completed',
          amount: amount
        });
      }
    }
  });
  
  // Deduplicate by transaction ID
  const unique = [];
  const seen = new Set();
  
  for (const tx of transactions) {
    if (!seen.has(tx.transactionId)) {
      seen.add(tx.transactionId);
      unique.push(tx);
    }
  }
  
  return unique;
}

// Send transactions to the API
async function syncTransactions(transactions) {
  if (transactions.length === 0) {
    return { success: false, error: 'No transactions found' };
  }
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactions })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error: error.message };
  }
}

// Show notification on the page
function showNotification(message, isSuccess = true) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${isSuccess ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 4000);
}

// Main sync function
async function performSync() {
  console.log('🔄 Freecharge Sync: Starting transaction scan...');
  
  // Try primary scraping method first
  let transactions = scrapeTransactions();
  
  // If no transactions found, try alternative method
  if (transactions.length === 0) {
    console.log('🔄 Trying alternative scraping method...');
    transactions = scrapeTransactionsAlternative();
  }
  
  console.log(`📊 Found ${transactions.length} transactions`);
  
  if (transactions.length === 0) {
    showNotification('No transactions found on this page', false);
    return;
  }
  
  showNotification(`Syncing ${transactions.length} transactions...`);
  
  const result = await syncTransactions(transactions);
  
  if (result.success) {
    showNotification(`✅ Synced ${result.inserted} transactions!`);
    // Store last sync time
    chrome.storage.local.set({ lastSync: Date.now(), lastCount: result.inserted });
  } else {
    showNotification(`❌ Sync failed: ${result.error}`, false);
  }
  
  // Send result to background script
  chrome.runtime.sendMessage({ 
    type: 'SYNC_COMPLETE', 
    result: result,
    transactionCount: transactions.length
  });
}

// Auto-sync when page loads and refresh page every 5 seconds
let syncInterval = null;
let refreshInterval = null;

function initAutoSync() {
  // Wait for page to fully load
  const startSyncing = () => {
    // Initial sync after 2 seconds
    setTimeout(performSync, 2000);
    
    // Auto-refresh page every 5 seconds (F5 style)
    refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refresh triggered (5s interval)');
      location.reload();
    }, 5000);
  };

  if (document.readyState === 'complete') {
    startSyncing();
  } else {
    window.addEventListener('load', startSyncing);
  }
  
  // Stop refresh when page is hidden/closed
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
      console.log('⏸️ Auto-refresh paused (tab hidden)');
    } else if (!document.hidden && !refreshInterval) {
      refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refresh triggered (5s interval)');
        location.reload();
      }, 5000);
      console.log('▶️ Auto-refresh resumed');
    }
  });
}

// Listen for manual sync requests from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'MANUAL_SYNC') {
    performSync().then(() => sendResponse({ done: true }));
    return true; // Keep channel open for async response
  }
});

// Start auto-sync
initAutoSync();

console.log('✅ Freecharge Sync extension loaded - page auto-refreshes every 5 seconds');
