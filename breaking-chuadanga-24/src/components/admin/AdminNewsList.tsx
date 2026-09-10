import React, { useState, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Flame,
  Star,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { NewsArticle, Category, NewsStatus } from '../../types';
import { api } from '../../utils/api';
import { getRelativeBengaliTime, toBengaliNumber } from '../../utils/dateUtils';

interface AdminNewsListProps {
  categories: Category[];
  onAddNew: () => void;
  onEditNews: (news: NewsArticle) => void;
}

export const AdminNewsList: React.FC<AdminNewsListProps> = ({
  categories,
  onAddNew,
  onEditNews,
}) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminNews({
        search: search.trim() || undefined,
        category: selectedCat || undefined,
        status: selectedStatus || undefined,
      });
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCat, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  const handleToggleStatus = async (article: NewsArticle) => {
    const nextStatus: NewsStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      await api.toggleNewsStatus(article.id, nextStatus);
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, status: nextStatus } : a)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteNews(deleteTarget.id);
      setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden font-sans">
      {/* Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
            সকল সংবাদ তালিকা
          </h2>
          <p className="text-xs text-gray-500">
            মোট সংবাদ সংখ্যা: {toBengaliNumber(articles.length)} টি
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন সংবাদ যোগ করুন</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="শিরোনাম বা কীওয়ার্ড দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
          >
            <option value="">সকল ক্যাটাগরি</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
          >
            <option value="">সকল স্ট্যাটাস</option>
            <option value="published">প্রকাশিত</option>
            <option value="draft">খসড়া</option>
            <option value="scheduled">নির্ধারিত</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-red-600 mb-2" />
            <p className="text-xs">সংবাদ লোড হচ্ছে...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm font-semibold">কোনো সংবাদ পাওয়া যায়নি</p>
            <button
              onClick={onAddNew}
              className="mt-2 text-xs text-red-600 font-bold hover:underline"
            >
              + প্রথম সংবাদটি এখনই যুক্ত করুন
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-100/70 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">ছবি ও শিরোনাম</th>
                <th className="p-3.5 hidden md:table-cell">বিভাগ</th>
                <th className="p-3.5 hidden lg:table-cell">রিপোর্টার ও সময়</th>
                <th className="p-3.5 text-center">ভিউ</th>
                <th className="p-3.5 text-center">স্ট্যাটাস</th>
                <th className="p-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {articles.map((art) => {
                const categoryObj = categories.find((c) => c.slug === art.category);
                return (
                  <tr key={art.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-3">
                        <img
                          src={art.featuredImage}
                          alt={art.headline}
                          className="w-14 h-10 object-cover rounded bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate font-serif">
                            {art.headline}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {art.isBreaking && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 fill-red-600" /> ব্রেকিং
                              </span>
                            )}
                            {art.isFeatured && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> ফিচার্ড
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 hidden md:table-cell">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                        {categoryObj?.name || art.category}
                      </span>
                    </td>

                    <td className="p-3.5 hidden lg:table-cell text-xs text-gray-500">
                      <div>{art.reporter || art.authorName}</div>
                      <div className="text-[11px] text-gray-400">
                        {getRelativeBengaliTime(art.publishDate || art.createdAt)}
                      </div>
                    </td>

                    <td className="p-3.5 text-center text-xs font-mono font-bold text-gray-600">
                      <span className="flex items-center justify-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        {toBengaliNumber(art.views || 0)}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(art)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                          art.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="স্ট্যাটাস পরিবর্তন করুন"
                      >
                        {art.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                      </button>
                    </td>

                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onEditNews(art)}
                        className="p-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                        title="সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(art)}
                        className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900 font-serif">সংবাদ মুছে ফেলতে চান?</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                &ldquo;{deleteTarget.headline}&rdquo; সংবাদটি স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলা হবে।
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
