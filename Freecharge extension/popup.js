// Popup script for Freecharge Sync extension

document.addEventListener('DOMContentLoaded', () => {
  const syncBtn = document.getElementById('syncBtn');
  const manualSyncBtn = document.getElementById('manualSync');
  const lastSyncEl = document.getElementById('lastSync');
  const lastCountEl = document.getElementById('lastCount');
  
  // Load last sync info
  chrome.storage.local.get(['lastSync', 'lastCount'], (data) => {
    if (data.lastSync) {
      const date = new Date(data.lastSync);
      lastSyncEl.textContent = date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (data.lastCount) {
      lastCountEl.textContent = data.lastCount.toString();
    }
  });
  
  // Open Freecharge transactions page
  syncBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.freecharge.in/transactions-history' });
    window.close();
  });
  
  // Manual sync on current page
  manualSyncBtn.addEventListener('click', async () => {
    manualSyncBtn.disabled = true;
    manualSyncBtn.innerHTML = '<span class="spinner"></span>Syncing...';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url?.includes('freecharge.in')) {
        alert('Please navigate to Freecharge transactions page first');
        return;
      }
      
      chrome.tabs.sendMessage(tab.id, { type: 'MANUAL_SYNC' }, (response) => {
        manualSyncBtn.disabled = false;
        manualSyncBtn.textContent = 'Sync Current Page';
        
        // Reload sync info
        chrome.storage.local.get(['lastSync', 'lastCount'], (data) => {
          if (data.lastSync) {
            const date = new Date(data.lastSync);
            lastSyncEl.textContent = date.toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
          if (data.lastCount) {
            lastCountEl.textContent = data.lastCount.toString();
          }
        });
      });
    } catch (error) {
      console.error('Sync error:', error);
      manualSyncBtn.disabled = false;
      manualSyncBtn.textContent = 'Sync Current Page';
    }
  });
});
