import React from 'react';
import { Eye, Clock, User, Flame } from 'lucide-react';
import { NewsArticle } from '../types';
import { getRelativeBengaliTime, toBengaliNumber } from '../utils/dateUtils';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'lead' | 'standard' | 'horizontal' | 'compact' | 'overlay';
  categoryName?: string;
  rank?: number;
  onClick: (article: NewsArticle) => void;
  className?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  variant = 'standard',
  categoryName,
  rank,
  onClick,
  className = '',
}) => {
  const timeString = getRelativeBengaliTime(article.publishDate || article.createdAt);
  const viewCount = toBengaliNumber(article.views || 0);

  // Variant 1: Lead Hero Story
  if (variant === 'lead') {
    return (
      <div
        id={`news-card-lead-${article.id}`}
        onClick={() => onClick(article)}
        className={`group cursor-pointer bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${className}`}
      >
        <div className="relative aspect-16/9 sm:aspect-16/10 overflow-hidden bg-gray-100">
          <img
            src={article.featuredImage}
            alt={article.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {categoryName && (
              <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs">
                {categoryName}
              </span>
            )}
            {article.isBreaking && (
              <span className="bg-amber-500 text-black text-xs font-bold px-2.5 py-1 rounded shadow-xs flex items-center gap-1">
                <Flame className="w-3 h-3 fill-black" /> ব্রেকিং
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-red-700 transition-colors leading-snug font-serif">
              {article.headline}
            </h2>
            {article.summary && (
              <p className="mt-2.5 text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                {article.summary}
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>{article.reporter || article.authorName}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{timeString}</span>
              </span>
            </div>
            <span className="flex items-center gap-1 text-gray-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{viewCount}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Variant 2: Horizontal Card
  if (variant === 'horizontal') {
    return (
      <div
        id={`news-card-horizontal-${article.id}`}
        onClick={() => onClick(article)}
        className={`group cursor-pointer bg-white rounded-lg p-3 border border-gray-200 hover:border-red-200 hover:shadow-xs transition-all flex gap-3.5 items-center ${className}`}
      >
        <div className="relative w-28 sm:w-36 h-20 sm:h-24 shrink-0 rounded-md overflow-hidden bg-gray-100">
          <img
            src={article.featuredImage}
            alt={article.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            {categoryName && (
              <span className="text-[11px] font-bold text-red-600 block mb-0.5">
                {categoryName}
              </span>
            )}
            <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2 font-serif">
              {article.headline}
            </h3>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timeString}</span>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{viewCount}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Variant 3: Compact / Trending List Card
  if (variant === 'compact') {
    return (
      <div
        id={`news-card-compact-${article.id}`}
        onClick={() => onClick(article)}
        className={`group cursor-pointer py-2.5 px-2 border-b border-gray-100 hover:bg-red-50/50 rounded transition-colors flex items-start gap-3 ${className}`}
      >
        {rank !== undefined && (
          <span className="text-lg font-black text-red-600/80 font-serif w-5 text-right shrink-0">
            {toBengaliNumber(rank)}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
            {article.headline}
          </h4>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
            <span>{timeString}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" /> {viewCount}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default: Standard Vertical Grid Card
  return (
    <div
      id={`news-card-standard-${article.id}`}
      onClick={() => onClick(article)}
      className={`group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-red-300 hover:shadow-md transition-all flex flex-col ${className}`}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
        <img
          src={article.featuredImage}
          alt={article.headline}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {categoryName && (
          <span className="absolute top-2 left-2 bg-red-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
            {categoryName}
          </span>
        )}
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2 font-serif">
            {article.headline}
          </h3>
          {article.summary && (
            <p className="mt-1.5 text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {article.summary}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{timeString}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{viewCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
