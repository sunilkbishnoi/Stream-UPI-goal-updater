// Freecharge Transaction Sync - Content Script
// This script runs on https://www.freecharge.in/transactions-history

const API_ENDPOINT = 'https://tbgqyxhgkhtirxuccipd.supabase.co/functions/v1/sync-freecharge';

// --- NEW: Helpers for saving seen transaction IDs ---
function storageGet(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}
function storageSet(data) {
  return new Promise(resolve => chrome.storage.local.set(data, resolve));
}

// --- NEW: Return only transactions not seen before ---
async function filterNewTransactions(transactions) {
  const data = await storageGet(['seenTransactionIds', 'initializedBaseline']);
  const seenIds = new Set(data.seenTransactionIds || []);

  // First time → store baseline only, do NOT sync old history
  if (!data.initializedBaseline) {
    const allIds = transactions.map(t => t.transactionId);
    await storageSet({
      seenTransactionIds: allIds,
      initializedBaseline: true
    });
    return { newTransactions: [], baselineCaptured: true };
  }

  // Later runs → only return new transactions
  const fresh = [];
  for (const tx of transactions) {
    if (!seenIds.has(tx.transactionId)) {
      fresh.push(tx);
      seenIds.add(tx.transactionId);
    }
  }

  await storageSet({ seenTransactionIds: Array.from(seenIds) });
  return { newTransactions: fresh, baselineCaptured: false };
}

// Parse transaction amount from string like "₹500" or "₹1,000"
function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const cleaned = amountStr.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

// Extract transactions from the page (unchanged)
function scrapeTransactions() {
  const transactions = [];
  const transactionElements = document.querySelectorAll('[class*="transaction"], [class*="history-item"], .txn-row, .transaction-card');

  if (transactionElements.length === 0) {
    const rows = document.querySelectorAll('table tbody tr, .list-item, [data-transaction-id]');
    rows.forEach(processRow);
  } else {
    transactionElements.forEach(processRow);
  }

  function processRow(element) {
    try {
      const txnId = element.getAttribute('data-transaction-id') ||
        element.querySelector('[class*="txn-id"], [class*="transaction-id"]')?.textContent?.trim() ||
        element.querySelector('td:nth-child(1), .id')?.textContent?.trim();

      const name = element.querySelector('[class*="name"], [class*="description"], [class*="merchant"], td:nth-child(2)')?.textContent?.trim() ||
        'Freecharge Transaction';

      const date = element.querySelector('[class*="date"], [class*="time"], td:nth-child(3)')?.textContent?.trim() ||
        new Date().toLocaleDateString('en-IN');

      const statusEl = element.querySelector('[class*="status"], .badge, td:nth-child(4)');
      const statusText = statusEl?.textContent?.trim()?.toLowerCase() || '';
      const status = (statusText.includes('success') || statusText.includes('complet')) ? 'Success' : 'Success';

      const amountEl = element.querySelector('[class*="amount"], [class*="price"], td:last-child');
      const amount = parseAmount(amountEl?.textContent);

      if (txnId && amount > 0) {
        transactions.push({
          transactionId: txnId,
          name,
          date,
          status,
          amount
        });
      }
    } catch (err) {
      console.error('Error parsing row:', err);
    }
  }

  return transactions;
}

// Alternative scan (unchanged)
function scrapeTransactionsAlternative() {
  const transactions = [];
  const containers = document.querySelectorAll('div, tr, li');

  containers.forEach((container, index) => {
    const text = container.textContent || '';

    const amountMatch = text.match(/₹\s*([\d,]+(?:\.\d{2})?)/);
    const idMatch = text.match(/(?:TXN|ID|#)[\s:]*([A-Z0-9]{8,})/i);

    if (amountMatch) {
      const amount = parseAmount(amountMatch[0]);
      if (amount >= 10 && amount <= 100000) {
        const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})/);
        transactions.push({
          transactionId: idMatch?.[1] || `FC_${Date.now()}_${index}`,
          name: 'Freecharge Transaction',
          date: dateMatch?.[0] || new Date().toLocaleDateString('en-IN'),
          status: text.toLowerCase().includes('success') ? 'Success' : 'Completed',
          amount
        });
      }
    }
  });

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

// Send transactions (unchanged)
async function syncTransactions(transactions) {
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions })
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// UI Notification (unchanged)
function showNotification(msg, ok=true) {
  const div = document.createElement('div');
  div.style.cssText = `
    position:fixed;top:20px;right:20px;padding:12px 20px;
    background:${ok?'#10b981':'#ef4444'};color:white;font-size:14px;
    border-radius:8px;z-index:9999;
  `;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(()=>div.remove(),3500);
}

// ⭐ UPDATED performSync — only sync NEW transactions ⭐
async function performSync() {
  console.log('Scanning Freecharge...');

  let tx = scrapeTransactions();
  if (tx.length === 0) tx = scrapeTransactionsAlternative();
  if (tx.length === 0) return showNotification('No transactions found',false);

  const { newTransactions, baselineCaptured } = await filterNewTransactions(tx);

  if (baselineCaptured) {
    showNotification('Baseline saved. Only new transactions will sync now.');
    return;
  }

  if (newTransactions.length === 0) {
    return showNotification('No new transactions');
  }

  showNotification(`Syncing ${newTransactions.length} new...`);
  const result = await syncTransactions(newTransactions);

  if(result.success) showNotification(`Synced ${newTransactions.length} 🎉`);
  else showNotification('Sync failed: '+result.error,false);
}

// Auto-sync loop (unchanged)
function initAutoSync(){
  setTimeout(performSync,2000);
  setInterval(()=>location.reload(),5000);
}
initAutoSync();

console.log('Freecharge sync extension active');
