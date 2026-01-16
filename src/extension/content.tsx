import { createRoot, Root } from 'react-dom/client';
import { SpeedReaderOverlay, getReaderStyles } from './SpeedReaderOverlay';
import { SelectionOverlay, getSelectionStyles } from './SelectionOverlay';
import { getUserSelection } from './contentExtractor';

type Mode = 'closed' | 'selection' | 'reader';

let currentMode: Mode = 'closed';
let overlayRoot: Root | null = null;
let overlayContainer: HTMLDivElement | null = null;

function createContainer() {
  if (overlayContainer) return overlayContainer;

  overlayContainer = document.createElement('div');
  overlayContainer.id = 'speedread-container';
  document.body.appendChild(overlayContainer);

  return overlayContainer;
}

function renderSelectionMode() {
  const container = createContainer();

  // Create shadow DOM for style isolation
  let shadow = container.shadowRoot;
  if (!shadow) {
    shadow = container.attachShadow({ mode: 'open' });
  } else {
    shadow.innerHTML = '';
  }

  // Add styles
  const style = document.createElement('style');
  style.textContent = getBaseStyles() + getSelectionStyles();
  shadow.appendChild(style);

  // Create root element
  const root = document.createElement('div');
  root.id = 'speedread-root';
  shadow.appendChild(root);

  // Render selection overlay
  overlayRoot = createRoot(root);
  overlayRoot.render(
    <SelectionOverlay
      onStartReading={(text, title) => {
        renderReaderMode(text, title);
      }}
      onClose={closeOverlay}
    />
  );

  currentMode = 'selection';
}

function renderReaderMode(text: string, title: string) {
  const container = createContainer();

  // Clean up existing
  if (overlayRoot) {
    overlayRoot.unmount();
    overlayRoot = null;
  }

  // Create shadow DOM for style isolation
  let shadow = container.shadowRoot;
  if (!shadow) {
    shadow = container.attachShadow({ mode: 'open' });
  } else {
    shadow.innerHTML = '';
  }

  // Add styles
  const style = document.createElement('style');
  style.textContent = getBaseStyles() + getReaderStyles();
  shadow.appendChild(style);

  // Create root element
  const root = document.createElement('div');
  root.id = 'speedread-root';
  shadow.appendChild(root);

  // Render reader overlay
  overlayRoot = createRoot(root);
  overlayRoot.render(
    <SpeedReaderOverlay
      text={text}
      title={title}
      onClose={closeOverlay}
    />
  );

  // Prevent body scroll in reader mode
  document.body.style.overflow = 'hidden';
  currentMode = 'reader';
}

function closeOverlay() {
  if (overlayRoot) {
    overlayRoot.unmount();
    overlayRoot = null;
  }
  if (overlayContainer) {
    overlayContainer.remove();
    overlayContainer = null;
  }
  document.body.style.overflow = '';
  currentMode = 'closed';
}

function toggleSpeedReader() {
  if (currentMode !== 'closed') {
    closeOverlay();
    return;
  }

  // Check if user has text selected - skip to reader mode
  const userSelection = getUserSelection();
  if (userSelection && userSelection.length > 0) {
    renderReaderMode(userSelection, 'Selected Text');
    return;
  }

  // Otherwise, show selection mode
  renderSelectionMode();
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'toggleSpeedReader') {
    toggleSpeedReader();
    sendResponse({ success: true });
  }
  return true;
});

// Escape key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentMode !== 'closed') {
    closeOverlay();
  }
});

function getBaseStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    #speedread-root {
      font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
  `;
}
