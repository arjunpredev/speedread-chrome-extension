import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

interface TextMinimapProps {
  words: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function TextMinimap({ words, currentIndex, onNavigate }: TextMinimapProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const currentWordRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isTouching, setIsTouching] = useState(false);
  const [touchDistance, setTouchDistance] = useState(0);

  const baseSize = 5; // Base font size in pixels
  const minZoom = 0.5;
  const maxZoom = 2.4;

  // Handle click to navigate
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const content = contentRef.current;
    if (!content) return;

    // Calculate which word was clicked
    const totalChildren = content.children.length;
    let wordIndex = 0;

    for (let i = 0; i < totalChildren; i++) {
      const child = content.children[i] as HTMLElement;
      const childRect = child.getBoundingClientRect();

      if (childRect.top <= e.clientY && e.clientY <= childRect.bottom &&
          childRect.left <= e.clientX && e.clientX <= childRect.right) {
        wordIndex = i;
        break;
      }
    }

    onNavigate(Math.min(wordIndex, words.length - 1));
  }, [words.length, onNavigate]);

  // Handle zoom button clicks - memoized to prevent unnecessary renders
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.max(minZoom, Math.min(maxZoom, prev + 0.1)));
  }, [minZoom, maxZoom]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(minZoom, Math.min(maxZoom, prev - 0.1)));
  }, [minZoom, maxZoom]);

  // Handle touch pinch zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      setIsTouching(true);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setTouchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && isTouching) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const newDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const delta = (newDistance - touchDistance) * 0.01;
      setZoomLevel((prev) => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
      setTouchDistance(newDistance);
    }
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
  };

  // Keep viewport indicator centered on current word
  useEffect(() => {
    if (!currentWordRef.current || !contentRef.current) return;

    const currentChild = currentWordRef.current;
    const parentContainer = contentRef.current.parentElement;
    if (!parentContainer) return;

    const childRect = currentChild.getBoundingClientRect();
    const parentRect = parentContainer.getBoundingClientRect();

    // Check if current word is visible
    const isVisible = childRect.top >= parentRect.top && childRect.bottom <= parentRect.bottom &&
                      childRect.left >= parentRect.left && childRect.right <= parentRect.right;

    if (!isVisible) {
      // Scroll to show current word
      const scrollTop = currentChild.offsetTop - parentContainer.clientHeight / 2 + currentChild.clientHeight / 2;
      parentContainer.scrollTop = Math.max(0, scrollTop);
    }
  }, [currentIndex]);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="group relative flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors text-xs font-mono border border-gray-700"
        aria-label="Show minimap"
      >
        <ChevronUp size={14} />
        Map
        {/* Custom tooltip - instant appearance */}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap font-medium">
          Show minimap
        </span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-56 bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/30 relative flex flex-col shadow-xl shadow-black/50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pinch-zoom' }}
    >
      {/* Header with zoom controls */}
      <div className="flex items-center justify-between bg-transparent px-2 py-1.5 border-b border-gray-700/20 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="group relative p-0.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            aria-label="Zoom out"
          >
            <Minus size={14} />
            {/* Custom tooltip - instant appearance */}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap font-medium">
              Zoom out
            </span>
          </button>
          <span className="text-xs text-gray-300 font-mono w-8 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="group relative p-0.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            aria-label="Zoom in"
          >
            <Plus size={14} />
            {/* Custom tooltip - instant appearance */}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap font-medium">
              Zoom in
            </span>
          </button>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="group relative p-0.5 text-gray-400 hover:text-white transition-colors ml-auto"
          aria-label="Hide minimap"
        >
          <ChevronDown size={14} />
          {/* Custom tooltip - instant appearance */}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-0 pointer-events-none whitespace-nowrap font-medium">
            Hide map
          </span>
        </button>
      </div>

      {/* Minimap container with wrapped grid layout */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden cursor-default select-none p-3 scroll-smooth bg-gradient-to-b from-white/5 to-transparent"
        style={{
          minHeight: '100px',
          maxHeight: '120px',
        }}
        onClick={handleClick}
        title="Scroll to zoom"
      >
        {/* Content with wrapped words in flex layout - using CSS transform for zoom */}
        <div
          ref={contentRef}
          className="flex flex-wrap gap-1 content-start"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            transition: 'transform 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {words.map((word, index) => (
            <div
              key={index}
              ref={index === currentIndex ? currentWordRef : undefined}
              className={`inline-block rounded font-mono transition-colors ${
                index === currentIndex
                  ? 'bg-white text-black font-semibold shadow-lg shadow-white/50'
                  : 'text-gray-400 hover:bg-white hover:text-black'
              }`}
              style={{
                fontSize: `${baseSize}px`,
                lineHeight: '1.2',
                padding: '0.5px 1px',
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={word}
            >
              {word}
            </div>
          ))}
        </div>
      </div>

      {/* Position indicator */}
      <div className="bg-transparent px-2 py-1 text-xs text-gray-400 pointer-events-none font-mono border-t border-gray-700/20">
        {currentIndex + 1}/{words.length}
      </div>
    </div>
  );
}
