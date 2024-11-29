document.addEventListener('copy', (e) => {
  const selection = window.getSelection();
  const container = document.createElement('div');

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    container.appendChild(range.cloneContents());
  }

  chrome.runtime.sendMessage({
    type: 'SAVE_CLIPBOARD',
    content: selection.toString(),
    html: container.innerHTML,
  });
});
