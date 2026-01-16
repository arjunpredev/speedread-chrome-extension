/**
 * Content extraction logic for SpeedRead
 * Extracts readable article content blocks from any webpage
 */

export interface ContentBlock {
  id: string;
  element: Element;
  text: string;
  words: WordItem[];
  wordCount: number;
  type: 'paragraph' | 'heading' | 'list' | 'blockquote';
  selected: boolean;
}

export interface WordItem {
  id: string;
  text: string;
  selected: boolean;
}

// Elements to completely ignore
const IGNORE_SELECTORS = [
  'script', 'style', 'noscript', 'iframe', 'nav', 'footer', 'header', 'aside',
  'form', 'button', 'input', 'select', 'textarea', 'figure', 'figcaption',
  '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]', '[role="complementary"]',
  '.nav', '.navbar', '.navigation', '.menu', '.sidebar', '.footer', '.header',
  '.advertisement', '.ad', '.ads', '.social', '.share', '.comments', '.comment',
  '.related', '.recommended', '.cookie', '.popup', '.modal', '.toc', '.table-of-contents',
  '#toc', '#table-of-contents', '.infobox', '.navbox', '.metadata', '.mw-editsection',
];

// Content containers to search within
const CONTENT_SELECTORS = [
  'article', '[role="article"]', '[role="main"]', 'main',
  '.article', '.post', '.content', '.entry-content', '.post-content',
  '.article-content', '.article-body', '.story-body', '.story-content',
  '#content', '#main', '#article', '#mw-content-text',
];

// Elements that contain readable text
const TEXT_ELEMENTS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote'];

const MIN_WORD_COUNT_PARAGRAPH = 5;
const MIN_WORD_COUNT_HEADING = 1; // Headers can be short

function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function isVisible(element: Element): boolean {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         style.opacity !== '0';
}

function isInsideIgnored(element: Element): boolean {
  let current: Element | null = element;
  while (current && current !== document.body) {
    for (const selector of IGNORE_SELECTORS) {
      try {
        if (current.matches(selector)) return true;
      } catch { /* invalid selector */ }
    }
    current = current.parentElement;
  }
  return false;
}

function getElementType(element: Element): ContentBlock['type'] {
  const tag = element.tagName.toLowerCase();
  if (tag.startsWith('h')) return 'heading';
  if (tag === 'li') return 'list';
  if (tag === 'blockquote') return 'blockquote';
  return 'paragraph';
}

function isHeading(element: Element): boolean {
  return element.tagName.toLowerCase().startsWith('h');
}

function generateId(): string {
  return `sr-${Math.random().toString(36).substr(2, 9)}`;
}

function parseWords(text: string): WordItem[] {
  return text.split(/\s+/).filter(w => w.length > 0).map(word => ({
    id: generateId(),
    text: word,
    selected: true,
  }));
}

/**
 * Find the main content container on the page
 */
function findContentContainer(): Element | null {
  for (const selector of CONTENT_SELECTORS) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (isVisible(element)) {
        return element;
      }
    }
  }
  return document.body;
}

/**
 * Extract all content blocks from the page
 * Returns individual elements that can be selected/deselected
 */
export function extractContentBlocks(): ContentBlock[] {
  const container = findContentContainer();
  if (!container) return [];

  const blocks: ContentBlock[] = [];
  const seenTexts = new Set<string>();
  const seenElements = new Set<Element>();

  // First, get main page title (h1) - often outside content container
  const mainTitle = document.querySelector('h1');
  if (mainTitle && isVisible(mainTitle) && !isInsideIgnored(mainTitle)) {
    const text = cleanText(mainTitle.textContent || '');
    const wordCount = getWordCount(text);
    if (wordCount >= MIN_WORD_COUNT_HEADING) {
      seenTexts.add(text);
      seenElements.add(mainTitle);
      blocks.push({
        id: generateId(),
        element: mainTitle,
        text,
        words: parseWords(text),
        wordCount,
        type: 'heading',
        selected: true,
      });
    }
  }

  // Find all text elements within the container
  const elements = container.querySelectorAll(TEXT_ELEMENTS.join(', '));

  elements.forEach((element) => {
    // Skip if already added
    if (seenElements.has(element)) return;

    // Skip if inside ignored container
    if (isInsideIgnored(element)) return;

    // Skip if not visible
    if (!isVisible(element)) return;

    // Get clean text
    const text = cleanText(element.textContent || '');
    const wordCount = getWordCount(text);

    // Use different thresholds for headings vs paragraphs
    const minWords = isHeading(element) ? MIN_WORD_COUNT_HEADING : MIN_WORD_COUNT_PARAGRAPH;
    if (wordCount < minWords) return;

    // Skip duplicates (some text might be nested)
    if (seenTexts.has(text)) return;
    seenTexts.add(text);
    seenElements.add(element);

    blocks.push({
      id: generateId(),
      element,
      text,
      words: parseWords(text),
      wordCount,
      type: getElementType(element),
      selected: true,
    });
  });

  return blocks;
}

/**
 * Get combined text from selected blocks (respects word-level selection)
 */
export function getSelectedText(blocks: ContentBlock[]): string {
  return blocks
    .filter(b => b.selected)
    .map(b => b.words.filter(w => w.selected).map(w => w.text).join(' '))
    .filter(text => text.length > 0)
    .join(' ');
}

/**
 * Get total word count from selected blocks (respects word-level selection)
 */
export function getSelectedWordCount(blocks: ContentBlock[]): number {
  return blocks
    .filter(b => b.selected)
    .reduce((sum, b) => sum + b.words.filter(w => w.selected).length, 0);
}

/**
 * Check if user has text selected on the page
 */
export function getUserSelection(): string | null {
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    return selection.toString().trim();
  }
  return null;
}
