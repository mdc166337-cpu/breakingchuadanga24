import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../utils/api';
import { toBengaliNumber } from '../../utils/dateUtils';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [showInNav, setShowInNav] = useState(true);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setOrder(cat.order);
    setShowInNav(cat.showInNav);
    setDescription(cat.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setOrder(categories.length + 1);
    setShowInNav(true);
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        const updated = await api.updateCategory(editingId, {
          name: name.trim(),
          slug: slug.trim(),
          order: Number(order),
          showInNav,
          description: description.trim(),
        });
        setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
      } else {
        const created = await api.createCategory({
          name: name.trim(),
          slug: slug.trim(),
          order: Number(order) || categories.length + 1,
          showInNav,
          description: description.trim(),
        });
        setCategories([...categories, created]);
      }
      handleCancelEdit();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই ক্যাটাগরিটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-red-600" />
            <span>সংবাদ ক্যাটাগরি ও বিভাগ ব্যবস্থাপনা</span>
          </h2>
          <p className="text-xs text-gray-500">
            ক্যাটাগরি যোগ করুন, মেন্যু অর্ডারিং সাজান ও নেভিগেশন বার কাস্টমাইজ করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-gray-900 font-serif mb-4 pb-2 border-b border-gray-100">
            {editingId ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি যোগ করুন'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাটাগরি নাম (বাংলা) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId && !slug) {
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }
                }}
                placeholder="যেমন: প্রবাস ও রেমিট্যান্স"
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">স্লাগ (URL Slug) *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="probash-remittance"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ক্রম নম্বর (Order)</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInNav}
                    onChange={(e) => setShowInNav(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span>মেন্যুতে দেখান</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">বিবরণ (ঐচ্ছিক)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="এই বিভাগের সংবাদের সংক্ষিপ্ত বিবরণ..."
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{editingId ? 'আপডেট করুন' : 'যোগ করুন'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Categories Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 font-serif">বিদ্যমান ক্যাটাগরি তালিকা</h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
                <p className="text-xs">লোড হচ্ছে...</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 text-gray-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="p-3">ক্রম</th>
                    <th className="p-3">ক্যাটাগরি নাম</th>
                    <th className="p-3">স্লাগ</th>
                    <th className="p-3 text-center">নেভিগেশন</th>
                    <th className="p-3 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-gray-500">
                        {toBengaliNumber(cat.order)}
                      </td>
                      <td className="p-3 font-bold text-gray-900 font-serif">{cat.name}</td>
                      <td className="p-3 font-mono text-gray-500">{cat.slug}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cat.showInNav
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {cat.showInNav ? 'হ্যাঁ' : 'না'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 hover:bg-red-50 text-gray-600 hover:text-red-700 rounded transition-colors cursor-pointer"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 hover:bg-red-50 text-gray-600 hover:text-red-700 rounded transition-colors cursor-pointer"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
