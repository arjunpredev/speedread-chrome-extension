/**
 * Splits text into an array of words
 */
export function parseTextToWords(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/**
 * Calculates the Optimal Recognition Point (ORP) index in a word
 * ORP is typically at 30-35% into the word length
 */
export function calculateORP(word: string): number {
  if (word.length <= 1) {
    return 0;
  }
  // Calculate ORP at approximately 30% of word length
  const orpIndex = Math.round(word.length * 0.3);
  return Math.max(0, Math.min(orpIndex, word.length - 1));
}

/**
 * Checks if a word ends with sentence-ending punctuation
 * Handles multiple punctuation marks and quoted text
 */
export function isSentenceEnd(word: string): boolean {
  if (word.length === 0) {
    return false;
  }

  // Remove trailing quotes and parentheses to check the actual punctuation
  let cleanWord = word.trimEnd();
  while (
    cleanWord.length > 0 &&
    (cleanWord[cleanWord.length - 1] === '"' ||
      cleanWord[cleanWord.length - 1] === "'" ||
      cleanWord[cleanWord.length - 1] === ')' ||
      cleanWord[cleanWord.length - 1] === ']' ||
      cleanWord[cleanWord.length - 1] === '}')
  ) {
    cleanWord = cleanWord.slice(0, -1);
  }

  if (cleanWord.length === 0) {
    return false;
  }

  const lastChar = cleanWord[cleanWord.length - 1];
  return lastChar === '.' || lastChar === '!' || lastChar === '?';
}
