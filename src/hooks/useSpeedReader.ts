import { useState, useEffect, useRef } from 'react';
import { parseTextToWords, isSentenceEnd } from '../utils/textUtils';

export function useSpeedReader(text: string) {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);

  // Flow Mode states
  const [flowModeEnabled, setFlowModeEnabled] = useState(false);
  const [flowStartWpm, setFlowStartWpm] = useState(300);
  const [flowMaxWpm, setFlowMaxWpm] = useState(900);
  const [flowAcceleration, setFlowAcceleration] = useState(10);
  const flowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Parse text into words whenever text changes
  useEffect(() => {
    const parsed = parseTextToWords(text);
    setWords(parsed);
    setCurrentIndex(0);
    setIsPlaying(false);
    // Clear flow mode interval on text change
    if (flowIntervalRef.current) {
      clearInterval(flowIntervalRef.current);
      flowIntervalRef.current = null;
    }
  }, [text]);

  // Handle word advancement with timing based on WPM
  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      return;
    }

    const currentWord = words[currentIndex];
    // Base duration: 60000 ms per minute / WPM
    const baseDuration = 60000 / wpm;
    // Add fixed 500ms pause for sentence ends
    const sentenceEndPause = isSentenceEnd(currentWord) ? 500 : 0;
    const duration = baseDuration + sentenceEndPause;

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex < words.length - 1) {
          return prevIndex + 1;
        } else {
          // Stop at the end
          setIsPlaying(false);
          return prevIndex;
        }
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, words, wpm]);

  // Flow Mode acceleration effect
  useEffect(() => {
    if (!isPlaying || !flowModeEnabled) {
      if (flowIntervalRef.current) {
        clearInterval(flowIntervalRef.current);
        flowIntervalRef.current = null;
      }
      return;
    }

    // Start flow mode at the start WPM
    if (wpm !== flowStartWpm) {
      setWpm(flowStartWpm);
    }

    // Set up acceleration interval
    flowIntervalRef.current = setInterval(() => {
      setWpm((currentWpm) => {
        const newWpm = currentWpm + flowAcceleration;
        if (newWpm >= flowMaxWpm) {
          // Cap at max WPM
          return flowMaxWpm;
        }
        return newWpm;
      });
    }, 1000);

    return () => {
      if (flowIntervalRef.current) {
        clearInterval(flowIntervalRef.current);
        flowIntervalRef.current = null;
      }
    };
  }, [isPlaying, flowModeEnabled, flowStartWpm, flowMaxWpm, flowAcceleration]);

  const play = () => {
    if (flowModeEnabled && wpm !== flowStartWpm) {
      setWpm(flowStartWpm);
    }
    setIsPlaying(true);
  };
  const pause = () => {
    if (flowIntervalRef.current) {
      clearInterval(flowIntervalRef.current);
      flowIntervalRef.current = null;
    }
    setIsPlaying(false);
  };
  const reset = () => {
    if (flowIntervalRef.current) {
      clearInterval(flowIntervalRef.current);
      flowIntervalRef.current = null;
    }
    setCurrentIndex(0);
    setIsPlaying(false);
    if (flowModeEnabled) {
      setWpm(flowStartWpm);
    }
  };

  return {
    words,
    currentIndex,
    currentWord: words[currentIndex] || '',
    isPlaying,
    wpm,
    setWpm,
    play,
    pause,
    reset,
    setCurrentIndex,
    // Flow Mode
    flowModeEnabled,
    setFlowModeEnabled,
    flowStartWpm,
    setFlowStartWpm,
    flowMaxWpm,
    setFlowMaxWpm,
    flowAcceleration,
    setFlowAcceleration,
  };
}
