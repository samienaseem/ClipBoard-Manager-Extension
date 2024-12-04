// background.js
let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;

function initializeBackgroundScript() {
  try {
    if (chrome?.runtime) {
      chrome.runtime.onInstalled.addListener(() => {
        console.log('Extension installed/updated');
        initializeStorage();
      });

      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'SAVE_CLIPBOARD') {
          handleClipboardSave(request, sender, sendResponse);
          return true; // Will respond asynchronously
        }
      });

      // Keep alive connection
      // chrome.runtime.onConnect.addListener((port) => {
      //   console.log('New connection established');
      //   port.onDisconnect.addListener(() => {
      //     console.log('Connection lost, attempting reconnect...');
      //     reconnect();
      //   });
      // });

      chrome.runtime.onConnect.addListener((port) => {
        console.log(`New connection established: ${port.name}`);
        port.onMessage.addListener((msg) => {
          console.log('Message from content script:', msg);
        });

        port.onDisconnect.addListener(() => {
          console.log(`Connection ${port.name} lost, attempting reconnect...`);
          reconnect(port.name);
        });
      });

      
    }
  } catch (error) {
    console.error('Background script initialization error:', error);
    reconnect();
  }
}

function initializeStorage() {
  chrome.storage.local.set({ clipboardHistory: [] }, () => {
    console.log('Storage initialized');
    if (chrome.runtime.lastError) {
      console.error('Storage initialization error:', chrome.runtime.lastError);
    }
  });
}

function handleClipboardSave(request, sender, sendResponse) {
  chrome.storage.local.get('clipboardHistory', (data) => {
    try {
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

      chrome.storage.local.set({ clipboardHistory: history }, () => {
        if (chrome.runtime.lastError) {
          throw chrome.runtime.lastError;
        }
        sendResponse({ success: true });
      });
    } catch (error) {
      console.error('Error saving clipboard:', error);
      sendResponse({ success: false, error: error.message });
    }
  });
}

function reconnect() {
  if (connectionAttempts < MAX_ATTEMPTS) {
    connectionAttempts++;
    console.log(`Reconnection attempt ${connectionAttempts}/${MAX_ATTEMPTS}`);
    setTimeout(() => {
      initializeBackgroundScript();
    }, 1000 * connectionAttempts); // Exponential backoff
  } else {
    console.error('Max reconnection attempts reached');
  }
}

// Initial setup
initializeBackgroundScript();
