chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ clipboardHistory: [] });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SAVE_CLIPBOARD') {
    chrome.storage.local.get('clipboardHistory', (data) => {
      const history = data.clipboardHistory || [];
      const newItem = {
        id: Date.now(),
        content: request.content,
        html: request.html,
        timestamp: new Date().toISOString(),
        url: sender.tab?.url || 'Unknown source',
      };

      if (history.length >= 100) history.pop();
      history.unshift(newItem);

      chrome.storage.local.set({ clipboardHistory: history });
    });
  }
});
