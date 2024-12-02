
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Listener for extension installation
  chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
  });

  // Listen for messages from content scripts
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.type === 'COPY_EVENT') {
        const text = message.text;

        // Get and update copied items in storage
        chrome.storage.local.get(['copiedItems'], (data) => {
          const items = data.copiedItems || [];
          items.push(text);
          chrome.storage.local.set({ copiedItems: items }, () => {
            console.log('Copied text saved:', text);
          });
        });

        sendResponse({ status: 'success' });
      }
    }
  );
}
