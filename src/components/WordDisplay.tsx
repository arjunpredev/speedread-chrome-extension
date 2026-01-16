import { calculateORP } from '../utils/textUtils';

interface WordDisplayProps {
  word: string;
}

export function WordDisplay({ word }: WordDisplayProps) {
  if (!word) {
    return (
      <div className="text-6xl font-bold text-slate-500 text-center">
        —
      </div>
    );
  }

  const orpIndex = calculateORP(word);
  const leftPart = word.substring(0, orpIndex);
  const orpChar = word[orpIndex];
  const rightPart = word.substring(orpIndex + 1);

  return (
    <div className="flex items-center justify-center gap-0">
      <span className="text-6xl font-bold text-white text-right">
        {leftPart}
      </span>
      <span className="text-6xl font-bold text-red-500 mx-0">
        {orpChar}
      </span>
      <span className="text-6xl font-bold text-white text-left">
        {rightPart}
      </span>
    </div>
  );
}
