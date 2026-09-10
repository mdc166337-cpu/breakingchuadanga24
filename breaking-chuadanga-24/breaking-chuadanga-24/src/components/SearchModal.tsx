import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Category, NewsArticle } from '../types';
import { api } from '../utils/api';
import { getRelativeBengaliTime, toBengaliNumber } from '../utils/dateUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSelectArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedCategory('');
      setResults([]);
      setHasSearched(false);
      return;
    }
  }, [isOpen]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim() && !selectedCategory) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await api.getNewsList({
        search: searchTerm.trim() || undefined,
        category: selectedCategory || undefined,
        limit: 20,
      });
      setResults(data.articles);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-red-700 font-bold text-base font-serif">
            <Search className="w-5 h-5" />
            <span>সংবাদ অনুসন্ধান করুন</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="p-4 border-b border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="শিরোনাম বা কীওয়ার্ড লিখুন (যেমন: চুয়াডাঙ্গা, কৃষি, ক্রীড়া)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 text-gray-700"
            >
              <option value="">সকল ক্যাটাগরি</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>খুঁজুন</span>
            </button>
          </div>
        </form>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-gray-100">
          {loading && (
            <div className="py-12 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
              <p className="text-sm">অনুসন্ধান করা হচ্ছে...</p>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              <p className="text-sm font-medium">কোন সংবাদ খুঁজে পাওয়া যায়নি।</p>
              <p className="text-xs text-gray-400 mt-1">অন্য কোনো শব্দ দিয়ে পুনরায় চেষ্টা করুন।</p>
            </div>
          )}

          {!loading &&
            results.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  onSelectArticle(article);
                  onClose();
                }}
                className="py-3 group cursor-pointer flex items-center justify-between gap-3 hover:bg-red-50/50 p-2 rounded-lg transition-colors"
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={article.featuredImage}
                    alt={article.headline}
                    className="w-16 h-12 rounded object-cover shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-1 font-serif">
                      {article.headline}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <span className="text-red-600 font-semibold">{article.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getRelativeBengaliTime(article.publishDate || article.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
