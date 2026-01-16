import { Play, Pause, RotateCcw } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  disabled: boolean;
  wpm: number;
  onWpmChange: (wpm: number) => void;
}

export function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  disabled,
  wpm,
  onWpmChange,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex justify-center gap-4">
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-gray-500 rounded-lg transition-colors font-semibold"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <>
              <Pause size={20} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={20} />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
          aria-label="Reset"
        >
          <RotateCcw size={20} />
          <span>Reset</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-4">
        <label htmlFor="wpm" className="text-white font-semibold">
          WPM:
        </label>
        <input
          id="wpm"
          type="range"
          min="100"
          max="1000"
          step="50"
          value={wpm}
          onChange={(e) => onWpmChange(Number(e.target.value))}
          disabled={disabled}
          className="w-48 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Words per minute"
        />
        <span className="text-white font-semibold min-w-12 text-right">{wpm}</span>
      </div>
    </div>
  );
}
