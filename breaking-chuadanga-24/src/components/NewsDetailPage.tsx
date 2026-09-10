import React, { useState } from 'react';
import {
  Share2,
  Facebook,
  Printer,
  Calendar,
  User,
  Eye,
  Tag,
  ArrowLeft,
  Check,
  MessageCircle,
  Copy,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import { NewsArticle, Category, Advertisement } from '../types';
import { getBengaliDate, toBengaliNumber } from '../utils/dateUtils';
import { NewsCard } from './NewsCard';
import { AdBanner } from './AdBanner';

interface NewsDetailPageProps {
  article: NewsArticle;
  relatedNews: NewsArticle[];
  categories: Category[];
  advertisements: Advertisement[];
  onSelectCategory: (categorySlug: string) => void;
  onSelectArticle: (article: NewsArticle) => void;
  onBackToHome: () => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({
  article,
  relatedNews,
  categories,
  advertisements,
  onSelectCategory,
  onSelectArticle,
  onBackToHome,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [userComment, setUserComment] = useState('');
  const [userCommentName, setUserCommentName] = useState('');
  const [commentsList, setCommentsList] = useState<Array<{ name: string; text: string; time: string }>>([
    {
      name: 'আশরাফুল ইসলাম (দামুড়হুদা)',
      text: 'চুয়াডাঙ্গার এমন ইতিবাচক উন্নয়নের খবর পড়ে খুব ভালো লাগল। সংশ্লিষ্ট সকলকে ধন্যবাদ।',
      time: 'আজ দুপুর ১২:১০',
    },
    {
      name: 'মো. রফিকুল হাসান (আলমডাঙ্গা)',
      text: 'ব্রেকিং চুয়াডাঙ্গা ২৪ কে অভিনন্দন সঠিক ও বস্তুনিষ্ঠ খবর সবার আগে তুলে ধরার জন্য।',
      time: 'আজ সকাল ১০:৪৫',
    },
  ]);

  const categoryObj = categories.find((c) => c.slug === article.category);
  const categoryName = categoryObj?.name || 'চুয়াডাঙ্গা';
  const publishDateBengali = getBengaliDate(article.publishDate || article.createdAt);
  const viewCount = toBengaliNumber(article.views || 0);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Social Share Handlers
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const text = `${article.headline} - ব্রেকিং চুয়াডাঙ্গা ২৪: ${currentUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim() || !userCommentName.trim()) return;

    setCommentsList([
      {
        name: userCommentName.trim(),
        text: userComment.trim(),
        time: 'এইমাত্র',
      },
      ...commentsList,
    ]);
    setUserComment('');
  };

  const fontClasses = {
    sm: 'text-base leading-relaxed',
    base: 'text-lg leading-loose',
    lg: 'text-xl leading-loose',
    xl: 'text-2xl leading-loose',
  };

  return (
    <article className="max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* 1. Breadcrumb & Back button (Hidden on Print) */}
      <div className="no-print flex items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 overflow-x-auto">
          <button
            onClick={onBackToHome}
            className="hover:text-red-700 font-medium flex items-center gap-1 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোম</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <button
            onClick={() => onSelectCategory(article.category)}
            className="hover:text-red-700 font-medium text-red-600 shrink-0"
          >
            {categoryName}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-xs text-gray-400">
            {article.headline}
          </span>
        </div>

        {/* Font resize controls */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md text-xs font-semibold text-gray-600">
          <button
            onClick={() => setFontSize('sm')}
            className={`px-2 py-0.5 rounded ${fontSize === 'sm' ? 'bg-white text-red-700 shadow-xs' : 'hover:bg-gray-200'}`}
            title="ছোট ফন্ট"
          >
            অ-
          </button>
          <button
            onClick={() => setFontSize('base')}
            className={`px-2 py-0.5 rounded ${fontSize === 'base' ? 'bg-white text-red-700 shadow-xs' : 'hover:bg-gray-200'}`}
            title="স্বাভাবিক ফন্ট"
          >
            অ
          </button>
          <button
            onClick={() => setFontSize('lg')}
            className={`px-2 py-0.5 rounded ${fontSize === 'lg' ? 'bg-white text-red-700 shadow-xs' : 'hover:bg-gray-200'}`}
            title="বড় ফন্ট"
          >
            অ+
          </button>
        </div>
      </div>

      {/* Main Grid: Content (8 cols) + Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 print-area">
          {/* Category Tag */}
          <div className="mb-2.5">
            <span
              onClick={() => onSelectCategory(article.category)}
              className="cursor-pointer inline-block bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded transition-colors"
            >
              {categoryName}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-snug font-serif tracking-tight mb-4">
            {article.headline}
          </h1>

          {/* Reporter & Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-gray-200 text-xs sm:text-sm text-gray-600 mb-6 bg-gray-50/70 px-3 rounded-lg">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 font-medium text-gray-800">
                <User className="w-4 h-4 text-red-600" />
                <span>{article.reporter || article.authorName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{publishDateBengali}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-gray-500">
                <Eye className="w-4 h-4 text-gray-400" />
                <span>{viewCount} বার পঠিত</span>
              </span>
            </div>
          </div>

          {/* Social Share & Action Bar (no-print) */}
          <div className="no-print flex items-center justify-between gap-2 mb-6 p-2.5 bg-gray-100/80 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 flex items-center gap-1 mr-1">
                <Share2 className="w-3.5 h-3.5" /> শেয়ার করুন:
              </span>

              {/* Facebook */}
              <button
                onClick={handleFacebookShare}
                className="flex items-center gap-1 bg-[#1877F2] hover:bg-[#166fe5] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
                title="ফেসবুকে শেয়ার করুন"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Facebook</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
                title="হোয়াটসঅ্যাপে শেয়ার করুন"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
                title="লিংক কপি করুন"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে!' : 'লিংক'}</span>
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 bg-white hover:bg-gray-200 text-gray-700 border border-gray-300 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
              title="সংবাদটি প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span>প্রিন্ট</span>
            </button>
          </div>

          {/* Featured Image & Caption */}
          <div className="mb-6 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={article.featuredImage}
              alt={article.headline}
              className="w-full h-auto max-h-[520px] object-cover"
            />
            {article.imageCaption && (
              <p className="p-3 text-xs sm:text-sm text-gray-600 bg-gray-50 border-t border-gray-200 italic font-serif">
                ছবি: {article.imageCaption}
              </p>
            )}
          </div>

          {/* Summary Standfirst */}
          {article.summary && (
            <div className="mb-6 p-4 bg-red-50/60 border-l-4 border-red-600 rounded-r-lg text-gray-800 font-serif font-semibold text-base sm:text-lg leading-relaxed">
              {article.summary}
            </div>
          )}

          {/* Article Full Content (HTML rendered safely) */}
          <div
            className={`prose max-w-none text-gray-800 font-sans ${fontClasses[fontSize]} space-y-4`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* In-Article Advertisement */}
          <div className="my-8 no-print">
            <AdBanner position="article_page" advertisements={advertisements} />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2 no-print">
              <span className="flex items-center gap-1 text-xs font-bold text-gray-600 mr-2">
                <Tag className="w-3.5 h-3.5 text-red-600" /> বিষয় / ট্যাগ:
              </span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 text-xs px-2.5 py-1 rounded-full border border-gray-200 font-medium transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments / Reader Reactions Section */}
          <div className="mt-10 pt-6 border-t border-gray-200 no-print">
            <h3 className="text-xl font-bold text-gray-900 font-serif mb-4 flex items-center gap-2">
              <span>মন্তব্য ও প্রতিক্রিয়া</span>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-sans">
                {toBengaliNumber(commentsList.length)}
              </span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="আপনার নাম *"
                  value={userCommentName}
                  onChange={(e) => setUserCommentName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
              <textarea
                placeholder="আপনার গঠনমূলক মতামত লিখুন..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500 mb-3"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                মন্তব্য জমা দিন
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {commentsList.map((c, i) => (
                <div key={i} className="bg-white p-3.5 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-gray-900">{c.name}</span>
                    <span className="text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Related News + Sidebar Advertisements */}
        <div className="lg:col-span-4 space-y-6 no-print">
          {/* Sidebar Advertisement */}
          <AdBanner position="sidebar" advertisements={advertisements} />

          {/* Related News Widget */}
          {relatedNews && relatedNews.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                <h3 className="text-base font-bold text-gray-900 font-serif flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>সম্পর্কিত সংবাদ</span>
                </h3>
                <span className="text-xs text-red-600 font-semibold">{categoryName}</span>
              </div>

              <div className="space-y-2">
                {relatedNews.map((rel) => (
                  <NewsCard
                    key={rel.id}
                    article={rel}
                    variant="horizontal"
                    onClick={onSelectArticle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Additional Chuadanga Help / Emergency Numbers Widget */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
            <h4 className="font-bold text-red-900 text-sm font-serif mb-2">
              চুয়াডাঙ্গা জরুরি তথ্য ও সেবা
            </h4>
            <ul className="text-xs text-gray-700 space-y-1.5">
              <li>• চুয়াডাঙ্গা সদর হাসপাতাল জরুরি: ০১৭৩০-৩২৪৫৬৭</li>
              <li>• জেলা পুলিশ কন্ট্রোল রুম: ০১৩২০-১৪৭৮০০</li>
              <li>• ফায়ার সার্ভিস চুয়াডাঙ্গা: ০১৭৩০-০০২৪২৪</li>
              <li>• জাতীয় জরুরি সেবা: ৯৯৯</li>
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
};
