import { Settings } from 'lucide-react';

interface FlowToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onSettings: () => void;
}

export function FlowToggle({ enabled, onToggle, onSettings }: FlowToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="flow-mode" className="text-gray-300 font-medium text-xs sm:text-sm tracking-wide hover:text-white transition-colors cursor-pointer">
        Flow
      </label>
      <button
        id="flow-mode"
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
          enabled
            ? 'bg-white shadow-lg shadow-white/50'
            : 'bg-gray-700/50 shadow-sm shadow-gray-900/50 hover:bg-gray-700'
        }`}
        aria-label={enabled ? 'Disable Flow Mode' : 'Enable Flow Mode'}
        title={enabled ? 'Disable Flow Mode' : 'Enable Flow Mode'}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-black transition-transform duration-300 ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
      <button
        onClick={onSettings}
        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200"
        aria-label="Flow Mode settings"
        title="Flow Mode settings"
      >
        <Settings size={16} />
      </button>
    </div>
  );
}
