# RSVP Speed Reader

A lightweight, single-page speed reading web application that transforms pasted text into an immersive RSVP (Rapid Serial Visual Presentation) experience. Read faster while maintaining comprehension through proven speed reading techniques.

## Features

- **RSVP Display**: Read one word at a time for maximum focus and speed
- **Optimal Recognition Point (ORP) Highlighting**: Each word is centered with the recognition point (typically at 30% of word length) highlighted in red at the exact screen center for optimal eye fixation
- **Adjustable Reading Speed**: Control words-per-minute (WPM) from 100 to 1000 WPM with an intuitive slider
- **Automatic Sentence Pauses**: Intelligent detection of sentence endings automatically applies 1.8x pause multiplier at periods, exclamation marks, and question marks for natural comprehension breaks
- **Simple Text Input**: Paste any text content and start reading immediately
- **Playback Controls**: Play, pause, and reset functionality for flexible reading sessions

## Tech Stack

- **React 19**: Modern UI library for interactive components
- **TypeScript 5.9**: Static typing for robust code quality
- **Vite 7**: Lightning-fast build tool with instant HMR (Hot Module Replacement)
- **Tailwind CSS 4**: Utility-first CSS framework for sleek, responsive design
- **Lucide React**: Clean, modern icon library
- **Netlify**: Deployment platform with continuous deployment

## Prerequisites

- **Node.js 18+** (verify with `node --version`)
- **npm or yarn** (comes with Node.js)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd speedread
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

The app will be available at **http://localhost:3000** with hot module replacement enabled. Code changes will instantly reflect in your browser without refreshing.

## Usage

### Basic Workflow

1. **Paste Text**: Copy any text and paste it into the "Paste text here..." text area
2. **Adjust Speed**: Use the WPM (Words Per Minute) slider to set your reading speed (100-1000 WPM)
3. **Play**: Click the Play button to start the RSVP display
4. **Control Playback**:
   - **Pause**: Pause at any time to reread or think
   - **Reset**: Return to the beginning of the text
5. **Clear**: Click the Clear button to remove text and start fresh

### Tips for Optimal Reading

- **Start slow** (300-400 WPM) to get comfortable with the RSVP format
- **Increase gradually** as your eye tracking improves
- **Focus on the red letter** - it's positioned at your natural focal point
- **Let pauses help you** - the automatic sentence breaks give your brain time to process

## Project Structure

```
src/
├── components/          # React components
│   ├── TextInput.tsx   # Text input area
│   ├── WordDisplay.tsx # ORP word display with red letter
│   ├── SpeedReaderDisplay.tsx # Main display container
│   ├── PlaybackControls.tsx    # Play/Pause/Reset/WPM controls
│   └── ClearButton.tsx  # Clear text button
├── hooks/
│   └── useSpeedReader.ts # Core speed reading state and logic
├── utils/
│   └── textUtils.ts     # Text parsing, ORP calculation, sentence detection
├── App.tsx              # Main app component
├── main.tsx             # React entry point
└── index.css            # Global styles
```

## Core Concepts

### Optimal Recognition Point (ORP)

The ORP is calculated at approximately **30% into each word's length**. This position aligns with where the human eye naturally fixates when reading. By centering all words with the ORP at the screen center and highlighting it in red, the reader's eyes stay fixed in one spot, dramatically improving reading speed while reducing eye strain.

**Calculation**: `orpIndex = Math.round(word.length * 0.3)`

### Auto-Pause Logic

Words ending with sentence punctuation (`.`, `!`, `?`) automatically receive a **1.8x pause multiplier**. This gives your brain time to process complete thoughts and provides natural reading rhythm.

**Example**:
- Word duration at 300 WPM = 200ms
- Sentence-end word duration = 200ms × 1.8 = 360ms

The algorithm intelligently handles quoted text and closing brackets by stripping them to detect the actual punctuation.

## Available Scripts

### Development
```bash
npm run dev
```
Starts the development server on port 3000 with hot module replacement.

### Build for Production
```bash
npm run build
```
Creates an optimized production build in the `dist/` directory. Runs TypeScript type-checking followed by Vite bundling.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally to test before deployment.

### Linting
```bash
npm run lint
```
Runs ESLint to check code quality and style consistency.

## Deployment

This app is optimized for deployment on Netlify.

### Prerequisites for Deployment

The Vite configuration includes `allowedHosts` to support deployment domains:

```typescript
// vite.config.ts
server: {
  host: "0.0.0.0",
  port: 3000,
  allowedHosts: [process.env.PREDEV_DEPLOYMENT_URL || 'speedread-6f0f.pre.dev']
}
```

### Deploy to Netlify

1. Push your repository to GitHub
2. Connect the repository to Netlify
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Deploy!

Netlify will automatically build and deploy on every push to the main branch.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES2020+ support
- Mobile-friendly responsive design

## Performance

- **Bundle Size**: ~250KB (gzipped)
- **First Paint**: <1 second on modern connections
- **HMR**: Instant updates during development
- **Production**: Fully optimized tree-shaken build

## Contributing

Feel free to fork, modify, and enhance this project. Some ideas for extensions:

- Dark/light theme toggle
- Text file upload (`.txt`, `.pdf`)
- Reading history and statistics
- Different playback modes (phrase-by-phrase, sentence-by-sentence)
- Text-to-speech integration
- Reading difficulty analysis

## License

MIT - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please check the GitHub issues page or contact the maintainers.

---

**Happy fast reading! 📖⚡**
