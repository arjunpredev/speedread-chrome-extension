import { useState, useEffect, useRef, useCallback } from 'react'
import { parseTextToWords, isSentenceEnd, calculateORP } from '../utils/textUtils'

// Icons as inline SVGs for the extension
const Icons = {
  X: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Play: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Pause: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  ),
  RotateCcw: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  Settings: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  ChevronUp: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Plus: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Minus: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
}

interface SpeedReaderOverlayProps {
  text: string
  title: string
  onClose: () => void
}

export function SpeedReaderOverlay({ text, title, onClose }: SpeedReaderOverlayProps) {
  // Parse words
  const words = parseTextToWords(text)

  // Speed reader state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wpm, setWpm] = useState(300)

  // Flow mode state
  const [flowModeEnabled, setFlowModeEnabled] = useState(false)
  const [flowStartWpm, setFlowStartWpm] = useState(300)
  const [flowMaxWpm, setFlowMaxWpm] = useState(900)
  const [flowAcceleration, setFlowAcceleration] = useState(10)
  const flowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // UI state
  const [showFlowSettings, setShowFlowSettings] = useState(false)
  const [minimapMinimized, setMinimapMinimized] = useState(false)
  const [minimapZoom, setMinimapZoom] = useState(1)

  // Refs
  const minimapContentRef = useRef<HTMLDivElement>(null)
  const currentWordRef = useRef<HTMLDivElement>(null)

  const currentWord = words[currentIndex] || ''

  // Word advancement effect
  useEffect(() => {
    if (!isPlaying || words.length === 0) return

    const currentW = words[currentIndex]
    const baseDuration = 60000 / wpm
    const sentenceEndPause = isSentenceEnd(currentW) ? 500 : 0
    const duration = baseDuration + sentenceEndPause

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev < words.length - 1) {
          return prev + 1
        } else {
          setIsPlaying(false)
          return prev
        }
      })
    }, duration)

    return () => clearTimeout(timer)
  }, [isPlaying, currentIndex, words, wpm])

  // Flow mode acceleration effect
  useEffect(() => {
    if (!isPlaying || !flowModeEnabled) {
      if (flowIntervalRef.current) {
        clearInterval(flowIntervalRef.current)
        flowIntervalRef.current = null
      }
      return
    }

    flowIntervalRef.current = setInterval(() => {
      setWpm((current) => {
        const newWpm = current + flowAcceleration
        return newWpm >= flowMaxWpm ? flowMaxWpm : newWpm
      })
    }, 1000)

    return () => {
      if (flowIntervalRef.current) {
        clearInterval(flowIntervalRef.current)
        flowIntervalRef.current = null
      }
    }
  }, [isPlaying, flowModeEnabled, flowAcceleration, flowMaxWpm])

  // Scroll minimap to current word
  useEffect(() => {
    if (!currentWordRef.current || !minimapContentRef.current) return

    const parent = minimapContentRef.current
    const child = currentWordRef.current
    const childRect = child.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()

    const isVisible = childRect.top >= parentRect.top && childRect.bottom <= parentRect.bottom

    if (!isVisible) {
      const scrollTop = child.offsetTop - parent.clientHeight / 2 + child.clientHeight / 2
      parent.scrollTop = Math.max(0, scrollTop)
    }
  }, [currentIndex])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFlowSettings) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          setIsPlaying((p) => !p)
          break
        case 'ArrowLeft':
          e.preventDefault()
          setCurrentIndex((prev) => Math.max(0, prev - 1))
          break
        case 'ArrowRight':
          e.preventDefault()
          setCurrentIndex((prev) => Math.min(words.length - 1, prev + 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setWpm((prev) => Math.min(1000, prev + 50))
          break
        case 'ArrowDown':
          e.preventDefault()
          setWpm((prev) => Math.max(100, prev - 50))
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleReset()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [words.length, showFlowSettings])

  const handlePlay = useCallback(() => {
    if (flowModeEnabled) {
      setWpm(flowStartWpm)
    }
    setIsPlaying(true)
  }, [flowModeEnabled, flowStartWpm])

  const handlePause = useCallback(() => {
    if (flowIntervalRef.current) {
      clearInterval(flowIntervalRef.current)
      flowIntervalRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const handleReset = useCallback(() => {
    if (flowIntervalRef.current) {
      clearInterval(flowIntervalRef.current)
      flowIntervalRef.current = null
    }
    setCurrentIndex(0)
    setIsPlaying(false)
    if (flowModeEnabled) {
      setWpm(flowStartWpm)
    }
  }, [flowModeEnabled, flowStartWpm])

  const handleNavigate = useCallback(
    (index: number) => {
      setCurrentIndex(Math.min(index, words.length - 1))
    },
    [words.length]
  )

  // Calculate ORP for word display
  const orpIndex = calculateORP(currentWord)
  const leftPart = currentWord.substring(0, orpIndex)
  const orpChar = currentWord[orpIndex] || ''
  const rightPart = currentWord.substring(orpIndex + 1)

  // Calculate slider background
  const sliderPercent = ((wpm - 100) / 900) * 100
  const sliderStyle = {
    background: `linear-gradient(to right, #fff 0%, #fff ${sliderPercent}%, #374151 ${sliderPercent}%, #374151 100%)`,
  }

  return (
    <div className="speedread-overlay">
      {/* Close button */}
      <button className="speedread-close" onClick={onClose}>
        <Icons.ArrowLeft />
        <span>Close</span>
      </button>

      {/* Title */}
      <div className="speedread-title">{title}</div>

      {/* Minimap */}
      {minimapMinimized ? (
        <button className="speedread-minimap-minimized" onClick={() => setMinimapMinimized(false)}>
          <Icons.ChevronUp />
          <span>Map</span>
        </button>
      ) : (
        <div className="speedread-minimap">
          <div className="speedread-minimap-header">
            <div className="speedread-minimap-controls">
              <button
                className="speedread-minimap-btn"
                onClick={() => setMinimapZoom((z) => Math.max(0.5, z - 0.1))}
              >
                <Icons.Minus />
              </button>
              <span className="speedread-minimap-zoom">{Math.round(minimapZoom * 100)}%</span>
              <button
                className="speedread-minimap-btn"
                onClick={() => setMinimapZoom((z) => Math.min(2.4, z + 0.1))}
              >
                <Icons.Plus />
              </button>
            </div>
            <button className="speedread-minimap-btn" onClick={() => setMinimapMinimized(true)}>
              <Icons.ChevronDown />
            </button>
          </div>
          <div className="speedread-minimap-content" ref={minimapContentRef}>
            <div className="speedread-minimap-words" style={{ transform: `scale(${minimapZoom})` }}>
              {words.map((word, index) => (
                <div
                  key={index}
                  ref={index === currentIndex ? currentWordRef : undefined}
                  className={`speedread-minimap-word ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => handleNavigate(index)}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
          <div className="speedread-minimap-footer">
            {currentIndex + 1}/{words.length}
          </div>
        </div>
      )}

      {/* Word display */}
      <div className="speedread-word-container">
        {currentWord ? (
          <div className="speedread-word">
            <span className="speedread-word-left">{leftPart}</span>
            <span className="speedread-word-orp">{orpChar}</span>
            <span className="speedread-word-right">{rightPart}</span>
          </div>
        ) : (
          <div className="speedread-placeholder">---</div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="speedread-controls">
        {/* Flow toggle */}
        <div className="speedread-flow-toggle">
          <label
            className="speedread-flow-label"
            onClick={() => setFlowModeEnabled(!flowModeEnabled)}
          >
            Flow
          </label>
          <button
            className={`speedread-flow-switch ${flowModeEnabled ? 'active' : ''}`}
            onClick={() => setFlowModeEnabled(!flowModeEnabled)}
          >
            <div className="speedread-flow-switch-knob" />
          </button>
          <button className="speedread-flow-settings" onClick={() => setShowFlowSettings(true)}>
            <Icons.Settings />
          </button>
        </div>

        {/* WPM Slider */}
        <div className="speedread-wpm">
          <span className="speedread-wpm-label">WPM</span>
          <input
            type="range"
            className="speedread-wpm-slider"
            min={100}
            max={1000}
            step={50}
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            style={sliderStyle}
          />
          <span className="speedread-wpm-value">{wpm}</span>
        </div>

        {/* Playback buttons */}
        <div className="speedread-playback">
          <button
            className="speedread-btn speedread-btn-primary"
            onClick={isPlaying ? handlePause : handlePlay}
          >
            {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button className="speedread-btn speedread-btn-secondary" onClick={handleReset}>
            <Icons.RotateCcw />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="speedread-hint">
        Press <kbd>Space</kbd> to play/pause, <kbd>Esc</kbd> to close
      </div>

      {/* Branding */}
      <a
        href="https://pre.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="speedread-branding"
      >
        <span className="speedread-branding-text">built on</span>
        <img src="https://pre.dev/predev.png" alt="pre.dev" className="speedread-branding-logo" />
        <span className="speedread-branding-name">pre.dev</span>
      </a>

      {/* Flow settings modal */}
      {showFlowSettings && (
        <>
          <div className="speedread-modal-backdrop" onClick={() => setShowFlowSettings(false)} />
          <div className="speedread-modal">
            <div className="speedread-modal-header">
              <h2 className="speedread-modal-title">Flow Mode Settings</h2>
              <button className="speedread-modal-close" onClick={() => setShowFlowSettings(false)}>
                <Icons.X />
              </button>
            </div>
            <div className="speedread-modal-content">
              <div className="speedread-setting">
                <div className="speedread-setting-header">
                  <label className="speedread-setting-label">Start WPM</label>
                  <span className="speedread-setting-value">{flowStartWpm}</span>
                </div>
                <input
                  type="range"
                  className="speedread-setting-slider"
                  min={100}
                  max={500}
                  step={10}
                  value={flowStartWpm}
                  onChange={(e) => setFlowStartWpm(Number(e.target.value))}
                />
              </div>
              <div className="speedread-setting">
                <div className="speedread-setting-header">
                  <label className="speedread-setting-label">Max WPM</label>
                  <span className="speedread-setting-value">{flowMaxWpm}</span>
                </div>
                <input
                  type="range"
                  className="speedread-setting-slider"
                  min={500}
                  max={1200}
                  step={10}
                  value={flowMaxWpm}
                  onChange={(e) => setFlowMaxWpm(Number(e.target.value))}
                />
              </div>
              <div className="speedread-setting">
                <div className="speedread-setting-header">
                  <label className="speedread-setting-label">Acceleration</label>
                  <span className="speedread-setting-value">{flowAcceleration} WPM/s</span>
                </div>
                <input
                  type="range"
                  className="speedread-setting-slider"
                  min={5}
                  max={50}
                  step={1}
                  value={flowAcceleration}
                  onChange={(e) => setFlowAcceleration(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="speedread-modal-footer">
              <button className="speedread-modal-done" onClick={() => setShowFlowSettings(false)}>
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function getReaderStyles(): string {
  return `
    .speedread-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      display: flex;
      flex-direction: column;
      z-index: 2147483647;
    }

    .speedread-close {
      position: absolute;
      top: 16px;
      left: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      z-index: 10;
      transition: color 0.2s;
    }

    .speedread-close:hover { color: #9ca3af; }
    .speedread-close svg { width: 16px; height: 16px; }

    .speedread-title {
      position: absolute;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      color: #6b7280;
      font-size: 12px;
      max-width: 400px;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      z-index: 10;
    }

    .speedread-minimap {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 200px;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      z-index: 10;
    }

    .speedread-minimap-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .speedread-minimap-controls { display: flex; align-items: center; gap: 4px; }

    .speedread-minimap-btn {
      padding: 4px;
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .speedread-minimap-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }
    .speedread-minimap-btn svg { width: 14px; height: 14px; }

    .speedread-minimap-zoom {
      color: #9ca3af;
      font-size: 11px;
      font-family: monospace;
      min-width: 32px;
      text-align: center;
    }

    .speedread-minimap-content {
      padding: 12px;
      max-height: 120px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .speedread-minimap-words {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      transform-origin: top left;
      transition: transform 0.1s;
    }

    .speedread-minimap-word {
      font-size: 5px;
      font-family: monospace;
      padding: 1px 2px;
      border-radius: 2px;
      color: #9ca3af;
      cursor: pointer;
      transition: all 0.1s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .speedread-minimap-word:hover { background: #fff; color: #000; }
    .speedread-minimap-word.active { background: #fff; color: #000; font-weight: 600; }

    .speedread-minimap-footer {
      padding: 6px 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: #6b7280;
      font-size: 11px;
      font-family: monospace;
    }

    .speedread-minimap-minimized {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #9ca3af;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      z-index: 10;
    }

    .speedread-minimap-minimized:hover { color: #fff; background: rgba(255, 255, 255, 0.15); }

    .speedread-word-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
    }

    .speedread-word {
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }

    .speedread-word-left,
    .speedread-word-right {
      font-size: clamp(48px, 8vw, 96px);
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .speedread-word-orp {
      font-size: clamp(48px, 8vw, 96px);
      font-weight: 700;
      color: #dc2626;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .speedread-placeholder {
      font-size: clamp(36px, 6vw, 64px);
      color: #374151;
    }

    .speedread-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px 24px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      z-index: 10;
    }

    .speedread-flow-toggle { display: flex; align-items: center; gap: 8px; }

    .speedread-flow-label {
      color: #9ca3af;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s;
    }

    .speedread-flow-label:hover { color: #fff; }

    .speedread-flow-switch {
      position: relative;
      width: 44px;
      height: 24px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .speedread-flow-switch.active {
      background: #fff;
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }

    .speedread-flow-switch-knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: #000;
      border-radius: 50%;
      transition: transform 0.3s;
    }

    .speedread-flow-switch.active .speedread-flow-switch-knob { transform: translateX(20px); }

    .speedread-flow-settings {
      padding: 6px;
      background: transparent;
      border: none;
      color: #6b7280;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .speedread-flow-settings:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }
    .speedread-flow-settings svg { width: 16px; height: 16px; }

    .speedread-wpm {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      max-width: 320px;
    }

    .speedread-wpm-label { color: #fff; font-size: 13px; font-weight: 500; }

    .speedread-wpm-slider {
      flex: 1;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: #374151;
      border-radius: 2px;
      cursor: pointer;
      outline: none;
    }

    .speedread-wpm-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .speedread-wpm-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .speedread-wpm-value {
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      min-width: 40px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .speedread-playback { display: flex; gap: 8px; }

    .speedread-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px 28px;
      border: none;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .speedread-btn svg { width: 18px; height: 18px; }

    .speedread-btn-primary {
      background: #fff;
      color: #000;
      box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
    }

    .speedread-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(255, 255, 255, 0.3);
    }

    .speedread-btn-secondary {
      background: linear-gradient(to bottom right, #374151, #1f2937);
      color: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .speedread-btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .speedread-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100;
    }

    .speedread-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      max-width: 400px;
      background: linear-gradient(to bottom, #111827, #000);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      z-index: 101;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }

    .speedread-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .speedread-modal-title { color: #fff; font-size: 18px; font-weight: 700; }

    .speedread-modal-close {
      padding: 4px;
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .speedread-modal-close:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }
    .speedread-modal-close svg { width: 20px; height: 20px; }

    .speedread-modal-content { display: flex; flex-direction: column; gap: 20px; }

    .speedread-setting { display: flex; flex-direction: column; gap: 8px; }

    .speedread-setting-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .speedread-setting-label { color: #fff; font-size: 13px; font-weight: 500; }

    .speedread-setting-value {
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .speedread-setting-slider {
      width: 100%;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: #374151;
      border-radius: 2px;
      cursor: pointer;
      outline: none;
    }

    .speedread-setting-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
    }

    .speedread-setting-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    .speedread-modal-footer { margin-top: 24px; }

    .speedread-modal-done {
      width: 100%;
      padding: 12px;
      background: #fff;
      color: #000;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .speedread-modal-done:hover { box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3); }

    .speedread-hint {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      color: #4b5563;
      font-size: 11px;
    }

    .speedread-hint kbd {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }

    .speedread-branding {
      position: absolute;
      bottom: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
      z-index: 10;
    }

    .speedread-branding:hover {
      background: rgba(30, 30, 30, 0.9);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .speedread-branding-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }

    .speedread-branding-logo {
      height: 14px;
      width: auto;
    }

    .speedread-branding-name {
      font-size: 13px;
      color: #fff;
      font-weight: 500;
    }
  `
}
