import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';
import { getRelativeBengaliTime, toBengaliNumber } from '../../utils/dateUtils';

export const AdminMedia: React.FC = () => {
  const [mediaList, setMediaList] = useState<
    Array<{ filename: string; url: string; size: number; createdAt: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await api.getMediaList();
      setMediaList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      setMediaList([
        {
          filename: res.filename,
          url: res.url,
          size: res.size,
          createdAt: new Date().toISOString(),
        },
        ...mediaList,
      ]);
    } catch (err: any) {
      alert(err.message || 'আপলোড ব্যর্থ হয়েছে');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-600" />
            <span>মিডিয়া লাইব্রেরি (Media Library)</span>
          </h2>
          <p className="text-xs text-gray-500">
            সংবাদের ছবিসমূহ সংরক্ষণ, প্রিভিউ ও সরাসরি ব্যবহারের জন্য ইউআরএল সংগ্রহ করুন।
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>নতুন ছবি আপলোড</span>
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-red-600 mb-2" />
            <p className="text-xs">ছবি লোড হচ্ছে...</p>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm font-semibold">কোনো মিডিয়া ফাইল আপলোড করা হয়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaList.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="aspect-square overflow-hidden bg-gray-200 relative">
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopy(item.url)}
                      className="p-2 bg-white text-gray-800 rounded-full hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="লিংক কপি করুন"
                    >
                      {copiedUrl === item.url ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-white text-gray-800 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                      title="নতুন ট্যাবে দেখুন"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="p-2 text-[11px] bg-white border-t border-gray-100">
                  <div className="truncate font-medium text-gray-800" title={item.filename}>
                    {item.filename}
                  </div>
                  <div className="text-gray-400 text-[10px] mt-0.5">
                    {Math.round(item.size / 1024)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
