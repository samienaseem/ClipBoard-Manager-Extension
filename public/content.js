document.addEventListener('copy', async () => {
  const text = await navigator.clipboard.readText();
  console.log("Text copied")

  // Send copied text to the background script
  chrome.runtime.sendMessage({ type: 'COPY_EVENT', text }, (response) => {
    console.log('Response from background script:', response);
  });
});
