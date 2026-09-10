import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  MousePointerClick,
  Loader2,
} from 'lucide-react';
import { Advertisement, AdPosition } from '../../types';
import { api } from '../../utils/api';
import { toBengaliNumber } from '../../utils/dateUtils';

export const AdminAds: React.FC = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState<AdPosition>('header');
  const [type, setType] = useState<'image' | 'code'>('image');
  const [imageUrl, setImageUrl] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [device, setDevice] = useState<'all' | 'desktop' | 'mobile'>('all');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAds();
      setAds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const positionLabels: Record<AdPosition, string> = {
    header: 'ওয়েবসাইট হেডার ব্যানার (728x90)',
    home_top: 'হোমপেজ শীর্ষ ব্যানার',
    home_middle: 'হোমপেজ মধ্যভাগ ব্যানার',
    between_news: 'সংবাদের মাঝের ব্যানার',
    sidebar: 'নিউজ সাইডবার ব্যানার',
    article_page: 'আর্টিকেল পেজ ব্যানার (সংবাদের নিচে)',
    footer: 'ফুটার ব্যানার',
  };

  const handleStartEdit = (ad: Advertisement) => {
    setEditingId(ad.id);
    setTitle(ad.title);
    setPosition(ad.position);
    setType(ad.type);
    setImageUrl(ad.imageUrl || '');
    setDestinationUrl(ad.destinationUrl || '');
    setHtmlCode(ad.htmlCode || '');
    setDevice(ad.device);
    setIsActive(ad.isActive);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setPosition('header');
    setType('image');
    setImageUrl('');
    setDestinationUrl('');
    setHtmlCode('');
    setDevice('all');
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    const payload = {
      title: title.trim(),
      position,
      type,
      imageUrl: imageUrl.trim() || undefined,
      destinationUrl: destinationUrl.trim() || undefined,
      htmlCode: htmlCode.trim() || undefined,
      device,
      isActive,
    };

    try {
      if (editingId) {
        const updated = await api.updateAd(editingId, payload);
        setAds((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      } else {
        const created = await api.createAd(payload);
        setAds([...ads, created]);
      }
      handleCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await api.toggleAd(id);
      setAds((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই বিজ্ঞাপনটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteAd(id);
      setAds((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-600" />
            <span>বিজ্ঞাপন ব্যবস্থাপনা (Advertisement Manager)</span>
          </h2>
          <p className="text-xs text-gray-500">
            পোর্টালের বিভিন্ন পজিশনে ব্যানার ইমেজ বা গুগল এডসেন্স কোড বসিয়ে আয় বৃদ্ধি করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ad Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-gray-900 font-serif mb-4 pb-2 border-b border-gray-100">
            {editingId ? 'বিজ্ঞাপন সম্পাদনা করুন' : 'নতুন বিজ্ঞাপন যোগ করুন'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">বিজ্ঞাপনের শিরোনাম / নাম *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: চুয়াডাঙ্গা শপিং কমপ্লেক্স মেগা অফার"
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">বিজ্ঞাপনের পজিশন *</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as AdPosition)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden font-medium"
              >
                {Object.entries(positionLabels).map(([posKey, posLabel]) => (
                  <option key={posKey} value={posKey}>
                    {posLabel}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ধরন (Type)</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'image' | 'code')}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                >
                  <option value="image">ব্যানার ইমেজ</option>
                  <option value="code">গুগল এডসেন্স / কোড</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ডিভাইস টার্গেট</label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value as 'all' | 'desktop' | 'mobile')}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                >
                  <option value="all">সব ডিভাইস</option>
                  <option value="desktop">কম্পিউটার/ল্যাপটপ</option>
                  <option value="mobile">মোবাইল</option>
                </select>
              </div>
            </div>

            {type === 'image' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ব্যানার ছবির লিংক (Image URL)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... বা /uploads/ad.jpg"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ক্লিক করলে যে লিংকে যাবে (URL)</label>
                  <input
                    type="url"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="https://example.com/offer"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">কাস্টম HTML / AdSense স্ক্রিপ্ট</label>
                <textarea
                  rows={4}
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="<script async src='https://pagead2.googlesyndication.com...'></script>"
                  className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span>সক্রিয় বিজ্ঞাপন হিসেবে চালু রাখুন</span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{editingId ? 'বিজ্ঞাপন আপডেট করুন' : 'বিজ্ঞাপন প্রকাশ করুন'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Ads List Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 font-serif">চলমান বিজ্ঞাপনসমূহ</h3>
            <span className="text-xs text-gray-500">মোট: {toBengaliNumber(ads.length)} টি</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
                <p className="text-xs">লোড হচ্ছে...</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">কোনো বিজ্ঞাপন যোগ করা হয়নি</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 text-gray-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="p-3">বিজ্ঞাপন</th>
                    <th className="p-3">পজিশন</th>
                    <th className="p-3 text-center">ক্লিক / ভিউ</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    <th className="p-3 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ads.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {ad.imageUrl ? (
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="w-12 h-8 object-cover rounded border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center font-mono text-[10px] text-gray-400 shrink-0">
                              HTML
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 truncate font-serif">{ad.title}</h4>
                            <span className="text-[10px] text-gray-400 font-mono capitalize">
                              {ad.type} • {ad.device}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {positionLabels[ad.position] || ad.position}
                        </span>
                      </td>

                      <td className="p-3 text-center text-gray-600 font-mono">
                        <div className="flex items-center justify-center gap-3">
                          <span className="flex items-center gap-1" title="ক্লিক">
                            <MousePointerClick className="w-3 h-3 text-blue-500" />
                            {toBengaliNumber(ad.clicks || 0)}
                          </span>
                          <span className="flex items-center gap-1" title="ইম্প্রেশন">
                            <Eye className="w-3 h-3 text-gray-400" />
                            {toBengaliNumber(ad.impressions || 0)}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggle(ad.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            ad.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {ad.isActive ? 'সক্রিয়' : 'বন্ধ'}
                        </button>
                      </td>

                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => handleStartEdit(ad)}
                          className="p-1.5 hover:bg-red-50 text-gray-600 hover:text-red-700 rounded transition-colors cursor-pointer"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
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
