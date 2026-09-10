import React, { useEffect, useState } from 'react';
import {
  Newspaper,
  CheckCircle2,
  FileEdit,
  Zap,
  Eye,
  Users,
  Image as ImageIcon,
  ArrowUpRight,
  Clock,
  Shield,
  PlusCircle,
} from 'lucide-react';
import { api } from '../../utils/api';
import { NewsArticle, ActivityLog, User } from '../../types';
import { toBengaliNumber, getRelativeBengaliTime } from '../../utils/dateUtils';

interface AdminDashboardProps {
  currentUser: User;
  onNavigate: (tab: string) => void;
  onEditNews: (news: NewsArticle) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onNavigate,
  onEditNews,
}) => {
  const [stats, setStats] = useState({
    totalNews: 0,
    publishedNews: 0,
    draftNews: 0,
    activeBreaking: 0,
    totalViews: 0,
    totalEditors: 0,
    activeAds: 0,
  });
  const [recentNews, setRecentNews] = useState<NewsArticle[]>([]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, newsData, logsData] = await Promise.all([
          api.getStats(),
          api.getAdminNews(),
          api.getAdminLogs().catch(() => []),
        ]);
        setStats(statsData);
        setRecentNews(newsData.slice(0, 5));
        setRecentLogs(logsData.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const statCards = [
    {
      title: 'মোট সংবাদ',
      value: toBengaliNumber(stats.totalNews),
      icon: Newspaper,
      color: 'from-blue-600 to-blue-700',
      badge: 'ডাটাবেজে সংরক্ষিত',
    },
    {
      title: 'প্রকাশিত সংবাদ',
      value: toBengaliNumber(stats.publishedNews),
      icon: CheckCircle2,
      color: 'from-emerald-600 to-emerald-700',
      badge: 'অনলাইনে সক্রিয়',
    },
    {
      title: 'খসড়া সংবাদ',
      value: toBengaliNumber(stats.draftNews),
      icon: FileEdit,
      color: 'from-amber-600 to-amber-700',
      badge: 'অপ্রকাশিত',
    },
    {
      title: 'ব্রেকিং নিউজ',
      value: toBengaliNumber(stats.activeBreaking),
      icon: Zap,
      color: 'from-red-600 to-red-700',
      badge: 'টিকারে চলছে',
    },
    {
      title: 'মোট ভিউজ',
      value: toBengaliNumber(stats.totalViews),
      icon: Eye,
      color: 'from-purple-600 to-purple-700',
      badge: 'পাঠক সংখ্যা',
    },
    {
      title: 'সক্রিয় বিজ্ঞাপন',
      value: toBengaliNumber(stats.activeAds),
      icon: ImageIcon,
      color: 'from-teal-600 to-teal-700',
      badge: 'বিভিন্ন পজিশনে',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin' : 'Editor'}
            </span>
            <span className="text-red-200 text-xs">অনলাইন ম্যানেজমেন্ট</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif mt-1">
            স্বাগতম, {currentUser.name}!
          </h2>
          <p className="text-xs sm:text-sm text-red-100 mt-0.5">
            ব্রেকিং চুয়াডাঙ্গা ২৪ পোর্টালের সকল সংবাদ ও কনটেন্ট সম্পূর্ণ আপনার নিয়ন্ত্রণে।
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('add-news')}
            className="bg-white text-red-700 hover:bg-red-50 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন সংবাদ তৈরি</span>
          </button>
          <button
            onClick={() => onNavigate('advertisements')}
            className="bg-red-950/60 hover:bg-red-950 text-white font-medium text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-colors border border-red-500/30 flex items-center gap-1.5 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>বিজ্ঞাপন ব্যবস্থাপনা</span>
          </button>
        </div>
      </div>

      {/* 6 Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">{c.title}</span>
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.color} text-white flex items-center justify-center`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900 font-serif">{c.value}</span>
                <span className="block text-[10px] text-gray-400 mt-0.5">{c.badge}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent News (7 cols) + Activity Logs (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent News Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 font-serif flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-red-600" />
              <span>সাম্প্রতিক সংবাদসমূহ</span>
            </h3>
            <button
              onClick={() => onNavigate('all-news')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5"
            >
              <span>সকল সংবাদ দেখুন</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentNews.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">কোনো সংবাদ পাওয়া যায়নি</div>
            ) : (
              recentNews.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 hover:bg-gray-50/80 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={n.featuredImage}
                      alt={n.headline}
                      className="w-14 h-11 object-cover rounded-md bg-gray-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate font-serif">
                        {n.headline}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                        <span className="text-red-600 font-medium">{n.category}</span>
                        <span>•</span>
                        <span>{getRelativeBengaliTime(n.publishDate || n.createdAt)}</span>
                        <span>•</span>
                        <span>{toBengaliNumber(n.views || 0)} ভিউ</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditNews(n)}
                    className="shrink-0 text-xs bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 px-2.5 py-1.5 rounded-md font-medium transition-colors"
                  >
                    সম্পাদনা
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity & Security Logs */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 font-serif flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>নিরাপত্তা ও অ্যাক্টিভিটি লগ</span>
            </h3>
            <button
              onClick={() => onNavigate('security-logs')}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              সম্পূর্ণ লগ
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">কোনো লগ রেকর্ড নেই</div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="p-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-gray-800">{log.userName}</span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getRelativeBengaliTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium line-clamp-1">{log.details}</p>
                  <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                    {log.action}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
