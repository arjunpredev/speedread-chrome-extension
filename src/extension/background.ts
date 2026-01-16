// Background service worker for SpeedRead extension

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  // Don't run on chrome:// or extension pages
  if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
    return;
  }

  // Send message to content script to toggle speed reader
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'toggleSpeedReader' });
  } catch (error) {
    // Content script might not be loaded yet, inject it
    console.log('SpeedRead: Content script not ready, injecting...');
  }
});
