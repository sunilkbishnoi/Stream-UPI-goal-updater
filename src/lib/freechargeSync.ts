// Freecharge Sync Script - Copy this to browser console on Freecharge page
// Or create a bookmarklet

export const FREECHARGE_SYNC_KEY = 'freecharge_sync_data';

export interface SyncData {
  transactions: {
    id: string;
    name: string;
    date: string;
    transactionId: string;
    status: string;
    amount: number;
  }[];
  timestamp: number;
}

// Script to run on Freecharge page (as bookmarklet or console)
export const getFreechargeScraperScript = (): string => {
  return `(function() {
  try {
    function scrapeTransactions() {
      var transactions = [];
      var rows = document.querySelectorAll('table tbody tr, [class*="transaction"], [class*="history"] > div');
      
      rows.forEach(function(row, index) {
        var text = row.innerText || row.textContent || '';
        
        var nameMatch = text.match(/Received from\\s+([^\\t\\n]+)/i);
        var amountMatch = text.match(/₹([\\d,]+(?:\\.\\d{2})?)/);
        var dateMatch = text.match(/(\\d{1,2}\\s+\\w+\\s+\\d{4},?\\s+\\d{1,2}:\\d{2}\\s*[AP]M)/i);
        var txIdMatch = text.match(/(AXI[a-f0-9]{20,})/i);
        var isSuccess = text.toLowerCase().includes('success');
        
        if (amountMatch && nameMatch) {
          var amount = parseFloat(amountMatch[1].replace(/,/g, ''));
          if (amount > 0) {
            transactions.push({
              id: txIdMatch ? txIdMatch[1] : 'tx_' + Date.now() + '_' + index,
              name: nameMatch[1].trim(),
              date: dateMatch ? dateMatch[1] : new Date().toLocaleString(),
              transactionId: txIdMatch ? txIdMatch[1] : '',
              status: isSuccess ? 'Success' : 'Pending',
              amount: amount
            });
          }
        }
      });
      
      return transactions;
    }
    
    function doSync() {
      var transactions = scrapeTransactions();
      var data = {
        transactions: transactions,
        timestamp: Date.now()
      };
      localStorage.setItem('freecharge_sync_data', JSON.stringify(data));
      console.log('Synced ' + transactions.length + ' transactions');
      return transactions.length;
    }
    
    var count = doSync();
    setInterval(doSync, 10000);
    alert('Freecharge Sync Active! Found ' + count + ' transactions. Keep this tab open.');
  } catch(e) {
    alert('Error: ' + e.message);
    console.error(e);
  }
})();`;
};

// Parse sync data from localStorage
export const parseSyncData = (data: string | null): SyncData | null => {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};
