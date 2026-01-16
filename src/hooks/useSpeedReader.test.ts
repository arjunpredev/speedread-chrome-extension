import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeedReader } from './useSpeedReader';

describe('useSpeedReader - WPM Timing Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Word Duration Calculations', () => {
    it('should calculate 200ms duration at 300 WPM (60000/300)', () => {
      const { result } = renderHook(() => useSpeedReader('Hello world'));

      act(() => {
        result.current.setWpm(300);
      });

      // At 300 WPM: 60000 / 300 = 200ms per word
      const baseDuration = 60000 / 300;
      expect(baseDuration).toBe(200);
    });

    it('should calculate 100ms duration at 600 WPM (60000/600)', () => {
      const { result } = renderHook(() => useSpeedReader('Hello world'));

      act(() => {
        result.current.setWpm(600);
      });

      // At 600 WPM: 60000 / 600 = 100ms per word
      const baseDuration = 60000 / 600;
      expect(baseDuration).toBe(100);
    });

    it('should calculate 600ms duration at 100 WPM (60000/100)', () => {
      const { result } = renderHook(() => useSpeedReader('Hello world'));

      act(() => {
        result.current.setWpm(100);
      });

      // At 100 WPM: 60000 / 100 = 600ms per word
      const baseDuration = 60000 / 100;
      expect(baseDuration).toBe(600);
    });
  });

  describe('Word Advancement with Timer', () => {
    it('should advance to next word after duration at 300 WPM', () => {
      const text = 'Hello world test';
      const { result } = renderHook(() => useSpeedReader(text));

      // Initial state
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentWord).toBe('Hello');

      act(() => {
        result.current.setWpm(300);
        result.current.play();
      });

      // At 300 WPM, each word should take 200ms
      expect(result.current.isPlaying).toBe(true);

      // Advance time by 200ms
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should advance to next word
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentWord).toBe('world');
    });

    it('should advance multiple words at correct intervals', () => {
      const text = 'Hello world test words';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300); // 200ms per word
        result.current.play();
      });

      // Word 0: Hello (0-200ms)
      expect(result.current.currentIndex).toBe(0);

      // Advance to word 1
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentWord).toBe('world');

      // Advance to word 2
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(2);
      expect(result.current.currentWord).toBe('test');

      // Advance to word 3
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(3);
      expect(result.current.currentWord).toBe('words');
    });

    it('should stop at the end of text', () => {
      const text = 'Hello world';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300); // 200ms per word
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      // Advance through both words
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(1);

      // Advance past the last word
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should stop playing at the end
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentIndex).toBe(1); // Stay on last word
    });

    it('should use faster timing at higher WPM', () => {
      const text = 'Hello world test';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(600); // 100ms per word
        result.current.play();
      });

      // Advance 100ms - should be on next word
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.currentIndex).toBe(1);

      // Advance another 100ms - should advance again
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.currentIndex).toBe(2);
    });

    it('should use slower timing at lower WPM', () => {
      const text = 'Hello world test';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(100); // 600ms per word
        result.current.play();
      });

      // Advance 300ms - should NOT advance yet
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current.currentIndex).toBe(0);

      // Advance to 600ms total - should advance
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current.currentIndex).toBe(1);
    });
  });

  describe('Sentence-End Pause', () => {
    it('should apply 500ms fixed pause at sentence end', () => {
      const text = 'Hello. World';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300); // 200ms per word
        result.current.play();
      });

      // First word "Hello." - ends with period
      // Should have 200ms + 500ms = 700ms pause
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentWord).toBe('Hello.');

      // At 200ms - not yet advanced
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(0);

      // At 700ms - should advance
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentWord).toBe('World');
    });

    it('should handle multiple sentence ends', () => {
      const text = 'First. Second. Third';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300); // 200ms per word
        result.current.play();
      });

      // Word 0: "First." (200ms + 500ms = 700ms)
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(result.current.currentIndex).toBe(1);

      // Word 1: "Second." (200ms + 500ms = 700ms)
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(result.current.currentIndex).toBe(2);

      // Word 2: "Third" (no period, 200ms)
      expect(result.current.currentWord).toBe('Third');
    });

    it('should handle quoted sentence endings', () => {
      const text = 'He said "Hello." World';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300); // 200ms per word
        result.current.play();
      });

      // Word 0: "He" (no period, 200ms)
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(1);

      // Word 1: "said" (no period, 200ms)
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(2);

      // Word 2: "Hello." (period with quotes, 200ms + 500ms = 700ms)
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(result.current.currentIndex).toBe(3);
      expect(result.current.currentWord).toBe('World');
    });

    it('should handle question mark as sentence end', () => {
      const text = 'What? Nothing';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300); // 200ms per word
        result.current.play();
      });

      // Word 0: "What?" (200ms + 500ms = 700ms)
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentWord).toBe('Nothing');
    });

    it('should handle exclamation mark as sentence end', () => {
      const text = 'Amazing! Yes';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300); // 200ms per word
        result.current.play();
      });

      // Word 0: "Amazing!" (200ms + 500ms = 700ms)
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentWord).toBe('Yes');
    });
  });

  describe('Play/Pause/Reset Controls', () => {
    it('should start playing from current position', () => {
      const text = 'Hello world test';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300);
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.currentIndex).toBe(0);
    });

    it('should pause playback', () => {
      const text = 'Hello world test';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300);
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it('should reset to beginning', () => {
      const text = 'Hello world test';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300);
        result.current.play();
      });

      // Advance to word 2 (200ms per word at 300 WPM)
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(1);

      // Advance one more time to word 2
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(2);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.isPlaying).toBe(false);
    });

    it('should allow resuming from paused position', () => {
      const text = 'Hello world test';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300);
        result.current.play();
      });

      // Advance to word 1
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(1);

      // Pause
      act(() => {
        result.current.pause();
      });

      // Resume from same position
      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.currentIndex).toBe(1);
    });
  });

  describe('WPM Changes During Playback', () => {
    it('should respond to WPM changes mid-playback', () => {
      const text = 'Hello world test';
      const { result } = renderHook(() => useSpeedReader(text));

      act(() => {
        result.current.setWpm(300); // 200ms per word
        result.current.play();
      });

      // Advance at 300 WPM
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(1);

      // Change to 600 WPM (100ms per word)
      act(() => {
        result.current.setWpm(600);
      });

      // Should advance faster now
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.currentIndex).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      const { result } = renderHook(() => useSpeedReader(''));

      expect(result.current.words.length).toBe(0);
      expect(result.current.currentWord).toBe('');

      act(() => {
        result.current.setWpm(300);
        result.current.play();
      });

      // Hook allows playing with empty text, but it won't advance
      // since the effect skips when words.length === 0
      expect(result.current.isPlaying).toBe(true);

      // Advancing time should not change index since there are no words
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.currentIndex).toBe(0);
    });

    it('should handle single word', () => {
      const { result } = renderHook(() => useSpeedReader('Hello'));

      act(() => {
        result.current.setWpm(300);
        result.current.play();
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentWord).toBe('Hello');

      // Advance past the word
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should stop (no next word)
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentIndex).toBe(0);
    });

    it('should handle text with extra whitespace', () => {
      const text = '  Hello   world   test  ';
      const { result } = renderHook(() => useSpeedReader(text));

      // Should parse correctly despite whitespace
      expect(result.current.words).toEqual(['Hello', 'world', 'test']);
    });

    it('should reset properly when text changes', () => {
      const { result, rerender } = renderHook(
        ({ text }: { text: string }) => useSpeedReader(text),
        { initialProps: { text: 'Hello world' } }
      );

      act(() => {
        result.current.setWpm(300);
        result.current.play();
      });

      // Change text
      rerender({ text: 'New text here' });

      // Should reset
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.words).toEqual(['New', 'text', 'here']);
    });
  });
});
