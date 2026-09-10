import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Zap } from 'lucide-react';
import { BreakingNewsItem } from '../types';

interface BreakingNewsTickerProps {
  items: BreakingNewsItem[];
  onSelectBreakingNews?: (item: BreakingNewsItem) => void;
  speed?: number; // seconds
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  items,
  onSelectBreakingNews,
  speed = 5,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!items || items.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [items, isPaused, speed]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div
      id="breaking-news-ticker-container"
      className="breaking-ticker-bar bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white shadow-xs border-y border-red-900"
    >
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-2">
        {/* Left: Badge */}
        <div className="flex items-center gap-1.5 bg-white text-red-700 px-2.5 py-0.5 rounded font-black text-xs uppercase tracking-wider shrink-0 shadow-xs select-none">
          <Zap className="w-3.5 h-3.5 fill-red-600 animate-bounce" />
          <span>ব্রেকিং নিউজ</span>
        </div>

        {/* Middle: Headline Text */}
        <div
          className="flex-1 overflow-hidden cursor-pointer group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={() => onSelectBreakingNews && onSelectBreakingNews(currentItem)}
        >
          <div className="truncate text-xs sm:text-sm font-semibold tracking-wide text-white/95 group-hover:text-amber-200 transition-colors">
            {currentItem.title}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 shrink-0 text-white/80">
          <button
            onClick={handlePrev}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="পূর্ববর্তী ব্রেকিং"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title={isPaused ? 'চালু করুন' : 'থামান'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="পরবর্তী ব্রেকিং"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
