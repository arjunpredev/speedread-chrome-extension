import { useState } from 'react';
import { ReaderView } from './components/ReaderView';
import { useSpeedReader } from './hooks/useSpeedReader';
import { Loader } from 'lucide-react';

function App() {
  const [text, setText] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'website'>('text');
  const [wikiUrl, setWikiUrl] = useState('');
  const [isLoadingWiki, setIsLoadingWiki] = useState(false);
  const [wikiError, setWikiError] = useState('');
  const speedReader = useSpeedReader(text);

  const fetchWebsiteContent = async (url: string) => {
    setWikiError('');
    setIsLoadingWiki(true);
    try {
      // Check if it's a Wikipedia URL
      if (url.includes('wikipedia.org')) {
        const title = url.split('/wiki/')[1];
        if (!title) {
          setWikiError('Could not fetch content from this URL');
          setIsLoadingWiki(false);
          return;
        }

        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&explaintext=true&format=json&origin=*`;
        const response = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pages[pageId].extract) {
          setText(pages[pageId].extract);
          setWikiUrl('');
          setIsReading(true);
          setTimeout(() => speedReader.play(), 100);
        } else {
          setWikiError('Could not fetch content from this URL');
        }
      } else {
        // For any other URL, use our server-side proxy
        const response = await fetch(`/api/fetch-url?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(10000) });
        const data = await response.json();
        const html = data.contents;

        // Parse HTML and extract text
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove scripts, styles, nav, footer, header, aside, iframe, noscript
        const elementsToRemove = doc.querySelectorAll(
          'script, style, nav, footer, header, aside, iframe, noscript'
        );
        elementsToRemove.forEach((el) => el.remove());

        // Get main content (try article, main, or body)
        const mainContent =
          doc.querySelector('article') ||
          doc.querySelector('main') ||
          doc.querySelector('body');
        const text = mainContent?.textContent?.trim() || '';

        // Clean up whitespace
        const cleanText = text.replace(/\s+/g, ' ').trim();

        if (cleanText.length < 50) {
          setWikiError('Could not extract enough text from this page');
          setIsLoadingWiki(false);
          return;
        }

        setText(cleanText);
        setWikiUrl('');
        setIsReading(true);
        setTimeout(() => speedReader.play(), 100);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setWikiError('Request timed out. Please try a different URL.');
      } else {
        setWikiError('Could not fetch content from this URL');
      }
    } finally {
      setIsLoadingWiki(false);
    }
  };

  const handleExampleClick = () => {
    setWikiUrl('https://en.wikipedia.org/wiki/Large_language_model');
  };

  const handleStartReading = () => {
    if (text.trim().length > 0) {
      setIsReading(true);
      speedReader.play();
    }
  };

  const handleBackToInput = () => {
    setIsReading(false);
    speedReader.pause();
  };

  return (
    <div className="min-h-dvh w-screen bg-gradient-to-br from-black via-gray-950 to-black flex flex-col relative">
      {/* Subtle gradient accent in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-900/5 rounded-full blur-3xl"></div>
      </div>

      {isReading ? (
        <ReaderView
          speedReader={speedReader}
          onBack={handleBackToInput}
        />
      ) : (
        <div className="relative z-10 flex flex-col h-full">
          {/* Top bar - minimal header */}
          <div className="flex items-center justify-between px-6 sm:px-12 py-4 sm:py-6 border-b border-gray-900">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="SpeedRead" className="h-7 sm:h-9 w-auto" />
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">SpeedRead</h1>
            </div>
          </div>

          {/* Hero Section with Explainer */}
          <div className="px-6 sm:px-12 pt-8 sm:pt-12 pb-6 sm:pb-8 text-center">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight leading-tight">
              Read Faster.
              <br />
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Comprehend More.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              One word at a time, perfectly centered. Speed reading backed by science.
            </p>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex gap-2 bg-gray-900/50 backdrop-blur-sm rounded-full p-1.5 border border-gray-800">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-6 sm:px-8 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'text'
                      ? 'bg-white text-black shadow-lg shadow-red-900/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Paste Text
                </button>
                <button
                  onClick={() => setActiveTab('website')}
                  className={`px-6 sm:px-8 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'website'
                      ? 'bg-white text-black shadow-lg shadow-red-900/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Website
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex items-center justify-center px-6 sm:px-12 pb-6 sm:pb-8">
            {activeTab === 'text' ? (
              <div className="w-full max-w-2xl">
                <div className="relative group">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your text here..."
                    className="w-full h-40 sm:h-56 bg-gray-900/60 backdrop-blur-sm text-white p-6 sm:p-8 text-base sm:text-lg resize-none border border-gray-800 rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-gray-700/50 focus:border-gray-700/50 placeholder-gray-600 font-normal transition-all duration-200"
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl space-y-5">
                <div className="relative group">
                  <input
                    type="text"
                    value={wikiUrl}
                    onChange={(e) => setWikiUrl(e.target.value)}
                    placeholder="Enter any website URL..."
                    className="w-full px-6 py-4 bg-gray-900/60 backdrop-blur-sm text-white border border-gray-800 rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-gray-700/50 focus:border-gray-700/50 placeholder-gray-600 font-normal transition-all duration-200"
                    disabled={isLoadingWiki}
                  />
                </div>
                <div className="text-center text-sm text-gray-500">
                  Try:{' '}
                  <button
                    onClick={handleExampleClick}
                    className="text-gray-300 hover:text-white underline transition-colors font-medium"
                  >
                    Large Language Model (Wikipedia)
                  </button>
                </div>
                {wikiError && (
                  <div className="text-red-300 text-sm p-4 bg-red-950/40 rounded-lg border border-red-900/50 backdrop-blur-sm">
                    {wikiError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Button at bottom */}
          <div className="pb-6 sm:pb-8 px-6 sm:px-12 flex justify-center flex-shrink-0">
            {activeTab === 'text' ? (
              <button
                onClick={handleStartReading}
                disabled={text.trim().length === 0}
                className="px-10 sm:px-14 py-3 sm:py-4 bg-gradient-to-r from-white to-gray-200 text-black text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 hover:shadow-2xl hover:shadow-red-900/30 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 disabled:shadow-none active:scale-95"
              >
                Start Reading
              </button>
            ) : (
              <button
                onClick={() => fetchWebsiteContent(wikiUrl)}
                disabled={!wikiUrl.trim() || isLoadingWiki}
                className="px-10 sm:px-14 py-3 sm:py-4 bg-gradient-to-r from-white to-gray-200 text-black text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 hover:shadow-2xl hover:shadow-red-900/30 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 disabled:shadow-none active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoadingWiki ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  'Start Reading'
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* pre.dev badge - appears on both views */}
      <a
        href="https://pre.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-400 transition-colors text-xs sm:text-sm z-50"
      >
        <span className="hidden sm:inline">designed by</span>
        <img src="https://pre.dev/predev.png" alt="pre.dev" className="h-3 sm:h-4 w-auto" />
        <span>pre.dev</span>
      </a>
    </div>
  );
}

export default App;
