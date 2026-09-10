import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Flame,
  Star,
  TrendingUp,
  FileText,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { api } from '../../utils/api';
import { Category, NewsArticle, NewsStatus } from '../../types';

interface AdminNewsFormProps {
  categories: Category[];
  initialData?: NewsArticle | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminNewsForm: React.FC<AdminNewsFormProps> = ({
  categories,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [headline, setHeadline] = useState(initialData?.headline || '');
  const [customSlug, setCustomSlug] = useState(initialData?.slug || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || 'chuadanga');
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  const [reporter, setReporter] = useState(initialData?.reporter || 'স্টাফ রিপোর্টার');
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage ||
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=480&fit=crop&q=80',
  );
  const [imageCaption, setImageCaption] = useState(initialData?.imageCaption || '');
  const [status, setStatus] = useState<NewsStatus>(initialData?.status || 'published');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isBreaking, setIsBreaking] = useState(initialData?.isBreaking || false);
  const [isTrending, setIsTrending] = useState(initialData?.isTrending || false);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview-desktop' | 'preview-mobile'>('edit');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট হতে পারে');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadImage(file);
      setFeaturedImage(res.url);
    } catch (err: any) {
      setError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) {
      setError('সংবাদের শিরোনাম প্রদান করুন');
      return;
    }

    setError(null);
    setSaving(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      headline: headline.trim(),
      customSlug: customSlug.trim() || undefined,
      summary: summary.trim(),
      content: content.trim(),
      category,
      subCategory: subCategory.trim(),
      tags,
      reporter: reporter.trim(),
      featuredImage,
      imageCaption: imageCaption.trim(),
      status,
      isFeatured,
      isBreaking,
      isTrending,
    };

    try {
      if (initialData?.id) {
        await api.updateNews(initialData.id, payload);
      } else {
        await api.createNews(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'সংবাদ সংরক্ষণ করতে ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
            {initialData ? 'সংবাদ সম্পাদনা করুন' : 'নতুন সংবাদ তৈরি ও প্রকাশ'}
          </h2>
          <p className="text-xs text-gray-500">
            কম্পিউটার বা মোবাইল থেকে সংবাদ তৈরি করুন, তাৎক্ষণিকভাবে অনলাইনে দৃশ্যমান হবে।
          </p>
        </div>

        {/* Preview Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-200 p-1 rounded-lg text-xs font-semibold text-gray-700">
            <button
              type="button"
              onClick={() => setPreviewMode('edit')}
              className={`px-3 py-1 rounded-md transition-colors ${
                previewMode === 'edit' ? 'bg-white text-red-700 shadow-xs' : 'hover:bg-gray-300'
              }`}
            >
              ফর্ম এডিটর
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('preview-desktop')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                previewMode === 'preview-desktop'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'hover:bg-gray-300'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">কম্পিউটার প্রিভিউ</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('preview-mobile')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                previewMode === 'preview-mobile'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'hover:bg-gray-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">মোবাইল প্রিভিউ</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="m-4 sm:m-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form or Preview */}
      {previewMode === 'edit' ? (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* 1. Headline & Slug */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                সংবাদের শিরোনাম (Headline) *
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="যেমন: চুয়াডাঙ্গায় নতুন আধুনিক কৃষি পার্ক স্থাপনের ঘোষণা..."
                className="w-full px-3.5 py-2.5 text-base sm:text-lg font-serif font-bold text-gray-900 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                এসইও কাস্টম ইউআরএল / স্লাগ (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="auto-generated-or-custom-slug"
                className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden text-gray-700"
              />
            </div>
          </div>

          {/* 2. Category, Subcategory, Reporter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাটাগরি *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                উপজেলা / সাব-ক্যাটাগরি
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              >
                <option value="">নির্বাচন করুন (ঐচ্ছিক)</option>
                <option value="chuadanga-sadar">চুয়াডাঙ্গা সদর</option>
                <option value="alamdanga">আলমডাঙ্গা</option>
                <option value="damurhuda">দামুড়হুদা</option>
                <option value="jibannagar">জীবননগর</option>
                <option value="darshana">দর্শনা পৌরসভা</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                প্রতিবেদক / রিপোর্টার
              </label>
              <input
                type="text"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="স্টাফ রিপোর্টার / জেলা প্রতিনিধি"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-medium"
              />
            </div>
          </div>

          {/* 3. Image Upload Section */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-gray-50/60 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>সংবাদের ফিচার ছবি (Featured Image)</span>
              </label>
              <span className="text-[11px] text-gray-500">অনুমোদিত: JPG, PNG, WEBP (সর্বোচ্চ ৫ MB)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Image Preview */}
              <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-gray-200 border border-gray-300">
                <img
                  src={featuredImage}
                  alt="ফিচার ইমেজ প্রিভিউ"
                  className="w-full h-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>আপলোড হচ্ছে...</span>
                  </div>
                )}
              </div>

              {/* Upload Controls & URL */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>কম্পিউটার থেকে ছবি আপলোড</span>
                  </button>
                  <span className="text-xs text-gray-400">অথবা সরাসরি ওয়েব ছবির লিংক ব্যবহার করুন</span>
                </div>

                <input
                  type="url"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://example.com/photo.jpg বা /uploads/image.jpg"
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden font-mono"
                />

                <div>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="ছবির ক্যাপশন লিখুন (যেমন: জেলা প্রশাসকের সম্মেলন কক্ষে সভা অনুষ্ঠিত)"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Summary Standfirst */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              সংবাদ সারসংক্ষেপ (Summary / Standfirst)
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="১-২ লাইনে মূল সংবাদটির সারসংক্ষেপ লিখুন যা হোমপেজে প্রদর্শিত হবে..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* 5. Full Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">
                সম্পূর্ণ সংবাদ প্রতিবেদন (Full News Content) *
              </label>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span>প্যারাগ্রাফ যোগ করতে সাধারণ টেক্সট বা &lt;p&gt; ট্যাগ ব্যবহার করুন</span>
              </div>
            </div>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="এখানে বিস্তারিত সংবাদ প্রতিবেদন লিখুন..."
              className="w-full p-4 text-base font-sans bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* 6. Tags */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="চুয়াডাঙ্গা, কৃষি, উন্নয়ন, জেলা প্রশাসন"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          </div>

          {/* 7. Publishing Options & Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">স্ট্যাটাস</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NewsStatus)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 font-bold"
              >
                <option value="published">সরাসরি প্রকাশিত (Published)</option>
                <option value="draft">খসড়া (Draft)</option>
                <option value="scheduled">নির্ধারিত (Scheduled)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none bg-white p-2.5 rounded-xl border border-gray-200 hover:border-red-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                শীর্ষ ফিচার্ড সংবাদ
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none bg-white p-2.5 rounded-xl border border-gray-200 hover:border-red-300">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                ব্রেকিং টিকারে দেখান
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none bg-white p-2.5 rounded-xl border border-gray-200 hover:border-red-300">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                ট্রেন্ডিং সংবাদ
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{initialData ? 'সংবাদ আপডেট করুন' : 'সংবাদ প্রকাশ করুন'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Real-Time Preview Simulation */
        <div className="p-6 bg-gray-100 min-h-[500px] flex justify-center">
          <div
            className={`bg-white rounded-2xl p-6 shadow-xl border border-gray-200 ${
              previewMode === 'preview-mobile' ? 'max-w-sm w-full' : 'max-w-3xl w-full'
            }`}
          >
            <div className="text-xs font-bold text-red-600 mb-1 uppercase tracking-wider">
              {category}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-serif leading-snug mb-3">
              {headline || 'শিরোনাম এখানে প্রদর্শিত হবে'}
            </h1>
            <div className="text-xs text-gray-400 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span>{reporter}</span>
              <span>•</span>
              <span>এইমাত্র প্রকাশিত</span>
            </div>
            <img
              src={featuredImage}
              alt="ফিচার ইমেজ"
              className="w-full aspect-16/10 object-cover rounded-xl mb-4"
            />
            {summary && (
              <p className="font-serif font-bold text-gray-800 text-sm mb-4 bg-red-50 p-3 rounded-lg border-l-4 border-red-600">
                {summary}
              </p>
            )}
            <div
              className="text-sm text-gray-800 space-y-3 font-sans leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content || '<p>বিস্তারিত সংবাদ এখানে থাকবে...</p>' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
