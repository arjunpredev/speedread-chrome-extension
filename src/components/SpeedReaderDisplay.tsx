import { WordDisplay } from './WordDisplay';

interface SpeedReaderDisplayProps {
  currentWord: string;
  hasText: boolean;
}

export function SpeedReaderDisplay({
  currentWord,
  hasText,
}: SpeedReaderDisplayProps) {
  return (
    <div className="bg-slate-950 rounded-xl p-12 shadow-2xl min-h-80 flex items-center justify-center mb-8">
      {hasText ? (
        <WordDisplay word={currentWord} />
      ) : (
        <div className="text-2xl text-slate-500 text-center">
          Paste or type text above to begin
        </div>
      )}
    </div>
  );
}
