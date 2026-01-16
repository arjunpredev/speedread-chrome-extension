<p align="center">
  <img src="public/logo.svg" alt="SpeedRead Logo" width="80" height="80">
</p>

<h1 align="center">SpeedRead</h1>

<p align="center">
  <strong>Speed read any article on the web with RSVP technology</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Chrome-Extension-4285f4?style=flat-square&logo=googlechrome" alt="Chrome Extension">
</p>

<p align="center">
  <a href="https://pre.dev">
    <img src="https://img.shields.io/badge/Built%20on-pre.dev-black?style=flat-square" alt="Built on pre.dev">
  </a>
</p>

---

## Overview

SpeedRead is a Chrome extension that transforms how you consume web content. Using RSVP (Rapid Serial Visual Presentation) technology, it displays one word at a time with intelligent ORP (Optimal Recognition Point) highlighting, allowing you to read 2-5x faster than traditional reading.

**Select exactly what you want to read** - highlight content blocks, edit individual words, then launch into a distraction-free fullscreen reading experience.

## Features

- **Smart Content Selection** - Automatically detects article content and lets you select/deselect paragraphs with drag-to-select
- **Word-Level Editing** - Fine-tune your selection by toggling individual words within any block
- **Fullscreen RSVP Display** - Immersive black background with white text and red ORP highlight
- **Flow Mode** - Gradually accelerate reading speed to train your brain over time
- **Manual WPM Control** - Adjust from 100 to 1000 words per minute
- **Text Minimap** - See your progress and jump to any position
- **Keyboard Controls**:
  - `Space` - Play/Pause
  - `←/→` - Navigate words
  - `↑/↓` - Adjust WPM
  - `R` - Reset to beginning
  - `Esc` - Close overlay

## How It Works

### Content Selection

1. Click the extension icon to overlay the page with selectable content blocks
2. Blocks are automatically highlighted - click to toggle selection
3. Drag across multiple blocks to select/deselect in bulk
4. Click the edit (pencil) icon to toggle individual words
5. Hit "Start Reading" to begin

### Optimal Recognition Point (ORP)

Each word displays with its ORP (approximately 30% into the word) highlighted in red. This is where your eye naturally fixates, eliminating eye movement and dramatically increasing reading speed.

### Flow Mode

When enabled, your reading speed gradually increases from your starting WPM to your target maximum, training your brain to process text faster over time.

## Installation

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-username/speedread.git
cd speedread

# Install dependencies
npm install

# Build the extension
npm run build
```

This creates a `dist/` folder with the built extension.

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right corner)
3. Click **Load unpacked**
4. Select the `dist/` folder from the project directory
5. The SpeedRead extension icon will appear in your toolbar

### Development

```bash
# Watch mode - rebuilds on file changes
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

After making changes in watch mode, go to `chrome://extensions/` and click the refresh icon on the SpeedRead extension to reload.

## Usage

1. Navigate to any article or webpage you want to speed read
2. Click the **SpeedRead** extension icon in your toolbar
3. The page will display with content blocks highlighted
4. Adjust your selection:
   - Click blocks to select/deselect
   - Drag to select multiple blocks
   - Click the pencil icon to edit individual words
5. Click **Start Reading** to launch the RSVP reader
6. Press `Space` to start, `Esc` to exit

**Pro tip:** Select text on the page before clicking the extension to skip directly to the reader with your selection.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Components |
| TypeScript | Type Safety |
| Vite 7 | Build Tool |
| Chrome Extension MV3 | Platform |
| Shadow DOM | Style Isolation |

## Project Structure

```
src/
├── extension/
│   ├── background.ts         # Service worker (icon click handler)
│   ├── content.tsx           # Content script (mode management)
│   ├── contentExtractor.ts   # Smart content extraction
│   ├── SelectionOverlay.tsx  # Content selection UI
│   └── SpeedReaderOverlay.tsx # RSVP reader UI
└── utils/
    └── textUtils.ts          # ORP calculation, text parsing
```

## Privacy

SpeedRead runs entirely locally in your browser. No data is collected, stored, or transmitted. The extension only accesses the content of the current tab when activated.

---

<p align="center">
  <a href="https://pre.dev">
    <img src="https://img.shields.io/badge/Built%20on-pre.dev-black?style=for-the-badge" alt="Built on pre.dev">
  </a>
</p>

<p align="center">
  MIT License
</p>
