
interface WPMSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function WPMSlider({ value, onChange, min = 100, max = 1000, step = 50 }: WPMSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="wpm-control" className="text-white font-medium text-sm tracking-wide">
        WPM
      </label>
      <div className="flex items-center gap-2 flex-1">
        <input
          id="wpm-control"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer transition-shadow hover:shadow-md hover:shadow-white/50"
          style={{
            background: `linear-gradient(to right, #ffffff 0%, #ffffff ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
          }}
          aria-label="Words per minute"
          title="Adjust reading speed"
        />
        <span className="text-white font-bold text-sm w-12 text-right tabular-nums">
          {value}
        </span>
      </div>
    </div>
  );
}
