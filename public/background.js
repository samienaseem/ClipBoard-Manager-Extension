let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;

function initializeBackgroundScript() {
  try {
    if (chrome?.runtime) {
      chrome.runtime.onInstalled.addListener(() => {
        console.log('Extension installed/updated ');
        initializeStorage();
      });

      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'SAVE_CLIPBOARD') {
          handleClipboardSave(request, sender, sendResponse);
          return true; // Will respond asynchronously
        }
      });

      // Handle persistent connections from content scripts
      chrome.runtime.onConnect.addListener((port) => {
        console.log(`New connection established: ${port.name}`);
        port.onMessage.addListener((msg) => {
          if (msg.type==='SAVE_CLIPBOARD'){
          console.log('Message from content script:', msg);
          handleClipboardSave1(msg,port)
          }
          if (msg.type==="PASTE_EVENT"){
            console.log("Message from content script:", msg)
          }
        });

        port.onDisconnect.addListener(() => {
          console.log(`Connection ${port.name} lost, attempting reconnect...`);
          reconnect(port.name);
        });
      });

      console.log('Background script initialized');
    }
  } catch (error) {
    console.error('Background script initialization error:', error);
    reconnect();
  }
}

function initializeStorage() {
  chrome.storage.local.get('clipboardHistory', (data) => {
    if (!data.clipboardHistory) {
      chrome.storage.local.set({ clipboardHistory: [] }, () => {
        console.log('Storage initialized with an empty history');
        if (chrome.runtime.lastError) {
          console.error(
            'Storage initialization error:',
            chrome.runtime.lastError
          );
        }
      });
    }
  });
}

function handleClipboardSave1(request,port) {
  chrome.storage.local.get('clipboardHistory', (data) => {
    try {
      const history = data.clipboardHistory || [];
      const newItem = {
        id: Date.now(),
        content: request.content,
        html: request.html,
        timestamp: new Date().toISOString(),
        url: request.url || 'Unknown source',
      };

      // Limit history to 100 items
      if (history.length >= 100) history.pop();
      history.unshift(newItem);

      chrome.storage.local.set({ clipboardHistory: history }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving to storage:', chrome.runtime.lastError);
          port.postMessage({
            type: 'SAVE_CLIPBOARD_ACK',
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else {
          console.log('Clipboard saved successfully:', newItem);
          port.postMessage({
            type: 'SAVE_CLIPBOARD_ACK',
            success: true,
            message: 'Clipboard item saved successfully!',
          });
        }
        
      });
    } catch (error) {
      console.error('Error saving clipboard:', error);
      port.postMessage({
        type: 'SAVE_CLIPBOARD_ACK',
        success: false,
        error: error.message,
      });
     
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

      // Limit history to 100 items
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

function reconnect(portName) {
  if (connectionAttempts < MAX_ATTEMPTS) {
    connectionAttempts++;
    console.log(
      `Reconnection attempt ${connectionAttempts}/${MAX_ATTEMPTS} for ${portName}`
    );
    setTimeout(() => {
      initializeBackgroundScript();
    }, 1000 * connectionAttempts); // Exponential backoff
  } else {
    console.error(`Max reconnection attempts reached for ${portName}`);
  }
}

// Utility to clear clipboard history (if needed)
function clearClipboardHistory() {
  chrome.storage.local.set({ clipboardHistory: [] }, () => {
    console.log('Clipboard history cleared');
  });
}

// Initial setup
initializeBackgroundScript();
