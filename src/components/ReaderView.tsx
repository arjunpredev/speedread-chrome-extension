import { ArrowLeft, Play, Pause, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { TextMinimap } from './TextMinimap';
import { WPMSlider } from './WPMSlider';
import { FlowToggle } from './FlowToggle';

interface ReaderViewProps {
  speedReader: {
    currentWord: string;
    currentIndex: number;
    words: string[];
    isPlaying: boolean;
    wpm: number;
    play: () => void;
    pause: () => void;
    reset: () => void;
    setWpm: (wpm: number) => void;
    setCurrentIndex: (index: number) => void;
    // Flow Mode
    flowModeEnabled: boolean;
    setFlowModeEnabled: (enabled: boolean) => void;
    flowStartWpm: number;
    setFlowStartWpm: (wpm: number) => void;
    flowMaxWpm: number;
    setFlowMaxWpm: (wpm: number) => void;
    flowAcceleration: number;
    setFlowAcceleration: (acceleration: number) => void;
  };
  onBack: () => void;
}

export function ReaderView({ speedReader, onBack }: ReaderViewProps) {
  const [showFlowSettingsModal, setShowFlowSettingsModal] = useState(false);

  const calculateORP = (word: string): number => {
    if (word.length <= 1) return 0;
    if (word.length === 2) return 0;

    // Approximate relative widths for visual centering
    const getCharWidth = (char: string): number => {
      const narrow = 'iltfjr.,;:!|\' ';
      const wide = 'mwMW';
      const c = char.toLowerCase();
      if (narrow.includes(c)) return 0.6;
      if (wide.includes(c)) return 1.4;
      return 1;
    };

    // Calculate total width and find center
    let totalWidth = 0;
    const widths: number[] = [];
    for (const char of word) {
      const w = getCharWidth(char);
      widths.push(w);
      totalWidth += w;
    }

    const centerTarget = totalWidth / 2;
    let cumulative = 0;
    for (let i = 0; i < widths.length; i++) {
      cumulative += widths[i];
      if (cumulative >= centerTarget) {
        return i;
      }
    }
    return Math.floor(word.length / 2);
  };

  const word = speedReader.currentWord;
  const orpIndex = calculateORP(word);
  const leftPart = word.substring(0, orpIndex);
  const orpChar = word[orpIndex];
  const rightPart = word.substring(orpIndex + 1);

  return (
    <div className="h-dvh w-screen bg-black flex flex-col relative">
      {/* Back button - TOP LEFT with custom tooltip */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-6 z-10">
        <button
          onClick={onBack}
          className="group relative flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-white hover:text-gray-300 transition-colors text-xs sm:text-sm font-medium"
          aria-label="Back to text input"
        >
          <ArrowLeft size={16} className="sm:size-4.5" />
          <span className="hidden sm:inline">Back</span>
          {/* Custom tooltip - instant appearance */}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap font-medium">
            Back to text input
          </span>
        </button>
      </div>

      {/* TOP RIGHT: Minimap (floating, no box) - positioned fixed for better mobile space */}
      <div className="fixed top-3 right-3 sm:top-6 sm:right-6 z-10 w-48 sm:w-56">
        <TextMinimap
          words={speedReader.words}
          currentIndex={speedReader.currentIndex}
          onNavigate={(index) => {
            speedReader.setCurrentIndex(index);
          }}
        />
      </div>

      {/* Word display - centered */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-20">
        {word ? (
          <div className="flex items-center pb-8 whitespace-nowrap">
            {/* Left part */}
            <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-relaxed tracking-tight">
              {leftPart}
            </span>
            {/* ORP letter */}
            <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-red-600 leading-relaxed tracking-tight">
              {orpChar}
            </span>
            {/* Right part */}
            <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-relaxed tracking-tight">
              {rightPart}
            </span>
          </div>
        ) : (
          <div className="text-3xl sm:text-4xl md:text-5xl text-gray-700">—</div>
        )}
      </div>

      {/* Bottom controls - centered stacked layout on all screen sizes */}
      <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-6 pb-3 sm:pb-6 flex flex-col items-center gap-3 sm:gap-4 z-10">
        {/* Flow Toggle - centered at top */}
        <FlowToggle
          enabled={speedReader.flowModeEnabled}
          onToggle={(enabled) => speedReader.setFlowModeEnabled(enabled)}
          onSettings={() => setShowFlowSettingsModal(true)}
        />

        {/* WPM Slider */}
        <div className="w-full max-w-xs px-2 sm:px-0">
          <WPMSlider
            value={speedReader.wpm}
            onChange={(value) => speedReader.setWpm(value)}
            min={100}
            max={1000}
            step={50}
          />
        </div>

        {/* Playback buttons - centered at bottom */}
        <div className="flex gap-2">
          <button
            onClick={speedReader.isPlaying ? speedReader.pause : speedReader.play}
            className="group relative flex items-center justify-center gap-1 px-4 sm:px-7 py-2 sm:py-3 bg-white text-black hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors font-semibold text-xs sm:text-base min-h-10 sm:min-h-12 shadow-lg hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5"
            aria-label={speedReader.isPlaying ? 'Pause' : 'Play'}
          >
            {speedReader.isPlaying ? (
              <>
                <Pause size={16} className="sm:size-5" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play size={16} className="sm:size-5" />
                <span className="hidden sm:inline">Play</span>
              </>
            )}
            {/* Custom tooltip - instant appearance */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap font-medium">
              {speedReader.isPlaying ? 'Pause' : 'Play'}
            </span>
          </button>

          <button
            onClick={speedReader.reset}
            className="group relative flex items-center justify-center gap-1 px-4 sm:px-7 py-2 sm:py-3 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-full transition-colors font-semibold text-xs sm:text-base min-h-10 sm:min-h-12 shadow-lg hover:shadow-lg hover:shadow-gray-900/50 hover:-translate-y-0.5"
            aria-label="Reset to beginning"
          >
            <RotateCcw size={16} className="sm:size-5" />
            <span className="hidden sm:inline">Reset</span>
            {/* Custom tooltip - instant appearance */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap font-medium">
              Reset
            </span>
          </button>
        </div>
      </div>

      {/* Flow Mode Settings Modal */}
      {showFlowSettingsModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowFlowSettingsModal(false)}
            aria-label="Close modal"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-700/50 rounded-xl w-full max-w-md p-6 shadow-2xl shadow-red-500/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">Flow Mode</h2>
                <button
                  onClick={() => setShowFlowSettingsModal(false)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                  aria-label="Close settings modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Settings content */}
              <div className="flex flex-col gap-5">
                {/* Start WPM */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="modal-flow-start" className="text-white font-medium text-sm tracking-wide">
                      Start WPM
                    </label>
                    <span className="text-white font-bold text-sm tabular-nums">{speedReader.flowStartWpm}</span>
                  </div>
                  <input
                    id="modal-flow-start"
                    type="range"
                    min="100"
                    max="500"
                    step="10"
                    value={speedReader.flowStartWpm}
                    onChange={(e) => speedReader.setFlowStartWpm(Number(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer transition-shadow hover:shadow-md hover:shadow-white/50"
                    style={{
                      background: `linear-gradient(to right, #ffffff 0%, #ffffff ${((speedReader.flowStartWpm - 100) / 400) * 100}%, #374151 ${((speedReader.flowStartWpm - 100) / 400) * 100}%, #374151 100%)`
                    }}
                    aria-label="Start WPM"
                  />
                </div>

                {/* Max WPM */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="modal-flow-max" className="text-white font-medium text-sm tracking-wide">
                      Max WPM
                    </label>
                    <span className="text-white font-bold text-sm tabular-nums">{speedReader.flowMaxWpm}</span>
                  </div>
                  <input
                    id="modal-flow-max"
                    type="range"
                    min="500"
                    max="1200"
                    step="10"
                    value={speedReader.flowMaxWpm}
                    onChange={(e) => speedReader.setFlowMaxWpm(Number(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer transition-shadow hover:shadow-md hover:shadow-white/50"
                    style={{
                      background: `linear-gradient(to right, #ffffff 0%, #ffffff ${((speedReader.flowMaxWpm - 500) / 700) * 100}%, #374151 ${((speedReader.flowMaxWpm - 500) / 700) * 100}%, #374151 100%)`
                    }}
                    aria-label="Max WPM"
                  />
                </div>

                {/* Acceleration */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="modal-flow-accel" className="text-white font-medium text-sm tracking-wide">
                      Acceleration
                    </label>
                    <span className="text-white font-bold text-sm tabular-nums">{speedReader.flowAcceleration} WPM/s</span>
                  </div>
                  <input
                    id="modal-flow-accel"
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={speedReader.flowAcceleration}
                    onChange={(e) => speedReader.setFlowAcceleration(Number(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer transition-shadow hover:shadow-md hover:shadow-white/50"
                    style={{
                      background: `linear-gradient(to right, #ffffff 0%, #ffffff ${((speedReader.flowAcceleration - 5) / 45) * 100}%, #374151 ${((speedReader.flowAcceleration - 5) / 45) * 100}%, #374151 100%)`
                    }}
                    aria-label="Acceleration per second"
                  />
                </div>
              </div>

              {/* Done button */}
              <button
                onClick={() => setShowFlowSettingsModal(false)}
                className="w-full mt-6 px-4 py-2 bg-white text-black hover:bg-gray-200 hover:shadow-lg hover:shadow-white/50 rounded-lg transition-all font-semibold text-sm tracking-wide"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
