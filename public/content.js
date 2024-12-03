// content.js
function setupCopyListener() {
  try {
    document.addEventListener('copy', async (e) => {
      try {
        const selection = window.getSelection();
        const container = document.createElement('div');

        for (let i = 0; i < selection.rangeCount; i++) {
          const range = selection.getRangeAt(i);
          container.appendChild(range.cloneContents());
        }

        console.log('Content Script - Copying:', selection.toString());

        try {
          const response = await chrome.runtime.sendMessage({
            type: 'SAVE_CLIPBOARD',
            content: selection.toString(),
            html: container.innerHTML,
          });
          console.log('Message sent successfully:', response);
        } catch (error) {
          if (chrome.runtime.lastError) {
            console.log('Chrome runtime error:', chrome.runtime.lastError);
            // Reload the content script if extension was reloaded
            if (error.message.includes('Extension context invalidated')) {
              console.log('Extension context invalid, reloading...');
              window.location.reload();
            }
          }
        }
      } catch (error) {
        console.error('Error in copy event handler:', error);
      }
    });

    console.log('Copy listener setup complete');
  } catch (error) {
    console.error('Error setting up copy listener:', error);
  }
}

// Initial setup
setupCopyListener();

// Listen for extension updates
chrome.runtime.onConnect.addListener(() => {
  console.log('Extension connected');
});

// Handle disconnection
window.addEventListener('unload', () => {
  console.log('Content script unloading');
});
