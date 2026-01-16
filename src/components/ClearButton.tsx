import { Trash2 } from 'lucide-react';

interface ClearButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function ClearButton({ onClick, disabled }: ClearButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      aria-label="Clear text"
    >
      <Trash2 size={18} />
      <span>Clear</span>
    </button>
  );
}
