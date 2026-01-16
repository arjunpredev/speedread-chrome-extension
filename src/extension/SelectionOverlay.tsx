import { useState, useEffect, useCallback } from 'react';
import { ContentBlock, WordItem, extractContentBlocks, getSelectedText, getSelectedWordCount } from './contentExtractor';

interface SelectionOverlayProps {
  onStartReading: (text: string, title: string) => void;
  onClose: () => void;
}

export function SelectionOverlay({ onStartReading, onClose }: SelectionOverlayProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [highlightPositions, setHighlightPositions] = useState<Map<string, DOMRect>>(new Map());
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect' | null>(null);
  const [draggedBlocks, setDraggedBlocks] = useState<Set<string>>(new Set());

  // Extract content blocks on mount
  useEffect(() => {
    const extracted = extractContentBlocks();
    setBlocks(extracted);
    updatePositions(extracted);

    const handleUpdate = () => {
      setBlocks(current => {
        updatePositions(current);
        return current;
      });
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, []);

  // Global mouse up handler for drag
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragMode(null);
        setDraggedBlocks(new Set());
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]);

  const updatePositions = useCallback((currentBlocks: ContentBlock[]) => {
    const positions = new Map<string, DOMRect>();
    currentBlocks.forEach(block => {
      const rect = block.element.getBoundingClientRect();
      positions.set(block.id, rect);
    });
    setHighlightPositions(positions);
  }, []);

  // Toggle entire block selection (for toggle button)
  const toggleBlock = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, selected: !block.selected } : block
    ));
  }, []);

  // Start drag selection on mouse down
  const handleBlockMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    // Don't start drag if clicking any button
    if ((e.target as HTMLElement).closest('.speedread-highlight-toggle')) return;
    if ((e.target as HTMLElement).closest('.speedread-highlight-edit')) return;

    e.preventDefault();
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    // Determine drag mode based on current state (toggle on first block)
    const newState = !block.selected;
    setDragMode(newState ? 'select' : 'deselect');
    setIsDragging(true);
    setDraggedBlocks(new Set([id]));

    // Apply to first block
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, selected: newState } : b
    ));
  }, [blocks]);

  // Handle mouse enter during drag
  const handleBlockMouseEnter = useCallback((id: string) => {
    if (!isDragging || dragMode === null) return;
    if (draggedBlocks.has(id)) return;

    setDraggedBlocks(prev => new Set(prev).add(id));
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, selected: dragMode === 'select' } : block
    ));
  }, [isDragging, dragMode, draggedBlocks]);

  // Expand block via edit button
  const handleEditClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedBlockId(prev => prev === id ? null : id);
  }, []);

  // Toggle individual word
  const toggleWord = useCallback((blockId: string, wordId: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;

      const newWords = block.words.map(word =>
        word.id === wordId ? { ...word, selected: !word.selected } : word
      );

      // If all words are deselected, deselect the block
      const anySelected = newWords.some(w => w.selected);

      return {
        ...block,
        words: newWords,
        selected: anySelected ? block.selected : false,
      };
    }));
  }, []);

  // Handle start reading
  const handleStartReading = useCallback(() => {
    const text = getSelectedText(blocks);
    if (text.trim().length === 0) return;
    onStartReading(text, document.title || 'Untitled');
  }, [blocks, onStartReading]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expandedBlockId) {
          setExpandedBlockId(null);
        } else {
          onClose();
        }
      } else if (e.key === 'Enter' && !expandedBlockId) {
        handleStartReading();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleStartReading, expandedBlockId]);

  const selectedCount = blocks.filter(b => b.selected).length;
  const totalCount = blocks.length;
  const wordCount = getSelectedWordCount(blocks);

  // Find expanded block
  const expandedBlock = expandedBlockId ? blocks.find(b => b.id === expandedBlockId) : null;
  const expandedRect = expandedBlockId ? highlightPositions.get(expandedBlockId) : null;

  return (
    <div className={`speedread-selection-container ${isDragging ? 'is-dragging' : ''}`}>
      {/* Dark overlay */}
      <div className="speedread-selection-backdrop" />

      {/* Highlight overlays for each block */}
      {blocks.map(block => {
        const rect = highlightPositions.get(block.id);
        if (!rect || rect.width === 0 || rect.height === 0) return null;

        const isExpanded = expandedBlockId === block.id;

        return (
          <div
            key={block.id}
            className={`speedread-highlight ${block.selected ? 'selected' : 'deselected'} ${block.type} ${isExpanded ? 'expanded' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width,
              height: rect.height,
            }}
            onMouseDown={(e) => handleBlockMouseDown(block.id, e)}
            onMouseEnter={() => handleBlockMouseEnter(block.id)}
          >
            {/* Toggle button - top right */}
            <button
              className={`speedread-highlight-toggle ${block.selected ? 'on' : 'off'}`}
              onClick={(e) => toggleBlock(block.id, e)}
              title={block.selected ? 'Deselect block' : 'Select block'}
            >
              {block.selected ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </button>

            {/* Edit button - bottom right */}
            {block.selected && (
              <button
                className="speedread-highlight-edit"
                onClick={(e) => handleEditClick(block.id, e)}
                title="Edit words"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </div>
        );
      })}

      {/* Word editor modal */}
      {expandedBlock && expandedRect && (
        <>
          <div className="speedread-word-editor-backdrop" onClick={() => setExpandedBlockId(null)} />
          <div
            className="speedread-word-editor"
            style={{
              top: Math.min(expandedRect.top + window.scrollY, window.innerHeight - 300 + window.scrollY),
              left: expandedRect.left + window.scrollX,
              maxWidth: Math.max(expandedRect.width, 400),
            }}
          >
            <div className="speedread-word-editor-header">
              <span>Click words to toggle</span>
              <button onClick={() => setExpandedBlockId(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="speedread-word-editor-content">
              {expandedBlock.words.map(word => (
                <span
                  key={word.id}
                  className={`speedread-word-item ${word.selected ? 'selected' : 'deselected'}`}
                  onClick={() => toggleWord(expandedBlock.id, word.id)}
                >
                  {word.text}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom bar */}
      <div className="speedread-selection-bar">
        <div className="speedread-selection-info">
          <span className="speedread-selection-count">
            {selectedCount} of {totalCount} blocks
          </span>
          <span className="speedread-selection-words">
            {wordCount.toLocaleString()} words
          </span>
        </div>
        <div className="speedread-selection-actions">
          <button className="speedread-selection-cancel" onClick={onClose}>
            Cancel
          </button>
          <div className="speedread-selection-start-wrapper">
            <a href="https://pre.dev" target="_blank" rel="noopener noreferrer" className="speedread-branding">
              <span className="speedread-branding-text">built on</span>
              <img src="https://pre.dev/predev.png" alt="pre.dev" className="speedread-branding-logo" />
              <span className="speedread-branding-name">pre.dev</span>
            </a>
            <button
              className="speedread-selection-start"
              onClick={handleStartReading}
              disabled={wordCount === 0}
            >
              Start Reading
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Instructions tooltip */}
      <div className="speedread-selection-tooltip">
        Drag to select/deselect multiple &middot; Click to edit words &middot; <kbd>Enter</kbd> to start
      </div>
    </div>
  );
}

export function getSelectionStyles(): string {
  return `
    .speedread-selection-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      min-height: 100%;
      z-index: 2147483646;
      pointer-events: none;
    }

    .speedread-selection-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      pointer-events: auto;
      z-index: -1;
    }

    .speedread-highlight {
      position: absolute;
      border-radius: 4px;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s ease-out;
      box-sizing: border-box;
    }

    .speedread-highlight.heading {
      border-radius: 6px;
    }

    .speedread-highlight.selected {
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7);
    }

    .speedread-highlight.selected:hover {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 1);
    }

    .speedread-highlight.deselected {
      background: rgba(0, 0, 0, 0.4);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15);
      opacity: 0.6;
    }

    .speedread-highlight.deselected:hover {
      opacity: 0.8;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
    }

    .speedread-highlight.dragging {
      transition: all 0.1s ease-out;
      cursor: grabbing !important;
    }

    .speedread-selection-container.is-dragging {
      cursor: grabbing;
    }

    .speedread-highlight-toggle,
    .speedread-highlight-edit {
      position: absolute;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      opacity: 0;
    }

    .speedread-highlight:hover .speedread-highlight-toggle,
    .speedread-highlight:hover .speedread-highlight-edit {
      opacity: 1;
    }

    .speedread-highlight-toggle {
      top: -10px;
      right: -10px;
    }

    .speedread-highlight-toggle.on {
      background: #22c55e;
      color: white;
    }

    .speedread-highlight-toggle.off {
      background: #ef4444;
      color: white;
    }

    .speedread-highlight-toggle svg {
      width: 14px;
      height: 14px;
    }

    .speedread-highlight-edit {
      top: -10px;
      left: -10px;
      background: #3b82f6;
      color: white;
    }

    .speedread-highlight-edit:hover {
      background: #2563eb;
      transform: scale(1.1);
    }

    .speedread-highlight-edit svg {
      width: 13px;
      height: 13px;
    }

    /* Word editor modal */
    .speedread-word-editor-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.3);
      pointer-events: auto;
      z-index: 100;
    }

    .speedread-word-editor {
      position: absolute;
      background: #1a1a1a;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      padding: 12px;
      pointer-events: auto;
      z-index: 101;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      max-height: 250px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .speedread-word-editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .speedread-word-editor-header span {
      color: rgba(255,255,255,0.6);
      font-size: 12px;
    }

    .speedread-word-editor-header button {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .speedread-word-editor-header button:hover {
      color: white;
      background: rgba(255,255,255,0.1);
    }

    .speedread-word-editor-header button svg {
      width: 16px;
      height: 16px;
    }

    .speedread-word-editor-content {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .speedread-word-item {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
      user-select: none;
    }

    .speedread-word-item.selected {
      background: rgba(255,255,255,0.15);
      color: white;
    }

    .speedread-word-item.selected:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .speedread-word-item.deselected {
      background: rgba(239, 68, 68, 0.2);
      color: rgba(255,255,255,0.4);
      text-decoration: line-through;
    }

    .speedread-word-item.deselected:hover {
      background: rgba(34, 197, 94, 0.3);
      color: rgba(255,255,255,0.7);
    }

    /* Bottom bar */
    .speedread-selection-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.9));
      backdrop-filter: blur(20px);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: auto;
      z-index: 10;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .speedread-selection-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .speedread-selection-count {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    }

    .speedread-selection-words {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
    }

    .speedread-selection-actions {
      display: flex;
      align-items: flex-end;
      gap: 12px;
    }

    .speedread-selection-start-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .speedread-branding {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #000;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .speedread-branding:hover {
      background: #1f1f1f;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .speedread-branding-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
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

    .speedread-selection-cancel {
      padding: 10px 20px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .speedread-selection-cancel:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .speedread-selection-start {
      padding: 10px 24px;
      background: #fff;
      border: none;
      border-radius: 8px;
      color: #000;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .speedread-selection-start:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
    }

    .speedread-selection-start:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .speedread-selection-start svg {
      width: 14px;
      height: 14px;
    }

    .speedread-selection-tooltip {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      padding: 10px 16px;
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;
      pointer-events: none;
      z-index: 10;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .speedread-selection-tooltip kbd {
      background: rgba(255, 255, 255, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 11px;
    }
  `;
}
