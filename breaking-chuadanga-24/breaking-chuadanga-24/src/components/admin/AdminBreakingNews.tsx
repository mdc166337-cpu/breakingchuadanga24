import React, { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { BreakingNewsItem } from '../../types';
import { api } from '../../utils/api';
import { getRelativeBengaliTime, toBengaliNumber } from '../../utils/dateUtils';

export const AdminBreakingNews: React.FC = () => {
  const [items, setItems] = useState<BreakingNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminBreaking();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const created = await api.createBreaking({
        title: newTitle.trim(),
        link: newLink.trim() || undefined,
      });
      setItems([created, ...items]);
      setNewTitle('');
      setNewLink('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await api.toggleBreaking(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই ব্রেকিং নিউজটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteBreaking(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden font-sans">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-600 fill-red-600" />
            <span>ব্রেকিং নিউজ টিকিৎসা ও নিয়ন্ত্রণ</span>
          </h2>
          <p className="text-xs text-gray-500">
            ওয়েবসাইটের শীর্ষে চলমান ব্রেকিং নিউজ সরাসরি পরিচালনা করুন।
          </p>
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="p-4 sm:p-6 bg-red-50/40 border-b border-red-100">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          নতুন ব্রেকিং হেডলাইন যোগ করুন
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <input
              type="text"
              required
              placeholder="ব্রেকিং সংবাদের শিরোনাম লিখুন..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          </div>
          <div className="sm:col-span-4 flex gap-2">
            <input
              type="text"
              placeholder="লিংক বা স্লাগ (ঐচ্ছিক)"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>যুক্ত করুন</span>
            </button>
          </div>
        </div>
      </form>

      {/* Breaking Items List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="py-12 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
            <p className="text-xs">লোড হচ্ছে...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">কোনো ব্রেকিং নিউজ নেই</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => handleToggle(item.id)}
                  className={`p-1 rounded-full cursor-pointer transition-colors ${
                    item.isActive
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-gray-300 hover:bg-gray-100'
                  }`}
                  title={item.isActive ? 'সক্রিয় (ক্লিক করে নিষ্ক্রিয় করুন)' : 'নিষ্ক্রিয়'}
                >
                  {item.isActive ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 font-serif leading-snug truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                    <span>{getRelativeBengaliTime(item.createdAt)}</span>
                    {item.link && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-red-600">{item.link}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    item.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {item.isActive ? 'টিকারে দৃশ্যমান' : 'বন্ধ'}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
