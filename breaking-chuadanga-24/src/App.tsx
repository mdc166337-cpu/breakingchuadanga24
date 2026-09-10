import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  TrendingUp,
  MapPin,
  Newspaper,
  Shield,
  Layers,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  PublicInitialData,
  NewsArticle,
  Category,
  BreakingNewsItem,
  Advertisement,
  SiteSettings,
  User,
} from './types';
import { api, getStoredUser, clearAuthSession } from './utils/api';
import { toBengaliNumber } from './utils/dateUtils';
import { getFallbackInitialData } from './data/initialData';

// Components
import { Header } from './components/Header';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { AdBanner } from './components/AdBanner';
import { NewsCard } from './components/NewsCard';
import { NewsDetailPage } from './components/NewsDetailPage';
import { SearchModal } from './components/SearchModal';
import { Footer } from './components/Footer';
import { StaticPages } from './components/StaticPages';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminNewsForm } from './components/admin/AdminNewsForm';
import { AdminNewsList } from './components/admin/AdminNewsList';
import { AdminBreakingNews } from './components/admin/AdminBreakingNews';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminAds } from './components/admin/AdminAds';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminMedia } from './components/admin/AdminMedia';
import { AdminSecurityLogs } from './components/admin/AdminSecurityLogs';
import { AdminSettings } from './components/admin/AdminSettings';

type ViewMode = 'home' | 'category' | 'article' | 'page' | 'admin';

export function App() {
  const [initialData, setInitialData] = useState<PublicInitialData | null>(null);
  const [loading, setLoading] = useState(true);

  // Navigation / View State
  const [view, setView] = useState<ViewMode>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('chuadanga');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [activePage, setActivePage] = useState<'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer'>('about');

  // Search Modal
  const [searchOpen, setSearchOpen] = useState(false);

  // Tab selection in homepage widget: 'latest' vs 'trending'
  const [feedTab, setFeedTab] = useState<'latest' | 'trending'>('latest');

  // Chuadanga local sub-filter
  const [chuadangaSubFilter, setChuadangaSubFilter] = useState<string>('all');

  // Admin states
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [editingNewsArticle, setEditingNewsArticle] = useState<NewsArticle | null>(null);

  // Load public data
  const loadPortalData = async () => {
    try {
      const data = await api.getInitialData();
      if (data && data.settings && Array.isArray(data.categories)) {
        setInitialData(data);
      } else {
        setInitialData(getFallbackInitialData());
      }
    } catch (err) {
      console.error('Failed to load initial data, using static fallback:', err);
      setInitialData(getFallbackInitialData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  // Open single article
  const handleSelectArticle = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await api.getArticle(article.slug || article.id);
      setSelectedArticle(res.article);
      setRelatedArticles(res.related);
    } catch {
      // fallback to current article
      const fallbackRelated = (initialData?.latestNews || []).filter((n) => n.id !== article.id).slice(0, 4);
      setRelatedArticles(fallbackRelated);
    }
  };

  // Open category page
  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
    setView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open static page
  const handleOpenPage = (slug: string) => {
    setActivePage(slug as any);
    setView('page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin navigation
  const handleOpenAdmin = () => {
    setView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setView('home');
  };

  if (loading || !initialData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans text-gray-700">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg animate-pulse">
          ২৪
        </div>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-1">
          ব্রেকিং চুয়াডাঙ্গা ২৪
        </h2>
        <p className="text-xs text-red-600 font-semibold mb-4">“চুয়াডাঙ্গার খবর, সবার আগে”</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
          <span>অনলাইন সংস্করণ লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  const {
    settings,
    categories = [],
    breakingNews = [],
    featuredNews = [],
    latestNews = [],
    trendingNews = [],
    advertisements = [],
  } = initialData;

  const categoryNews: Record<string, NewsArticle[]> =
    initialData.categoryNews || initialData.categoryNewsMap || {};

  // Filter Chuadanga local stories
  const chuadangaArticles = (categoryNews['chuadanga'] || []).filter((art) => {
    if (chuadangaSubFilter === 'all') return true;
    return art.subCategory === chuadangaSubFilter;
  });

  // Lead stories for Hero section
  const primaryLead = featuredNews[0] || latestNews[0];
  const secondaryLeads = featuredNews.slice(1, 4).length > 0 ? featuredNews.slice(1, 4) : latestNews.slice(1, 4);

  // Admin View Rendering
  if (view === 'admin') {
    if (!currentUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => setCurrentUser(user)}
          onBackToSite={() => setView('home')}
        />
      );
    }

    return (
      <AdminLayout
        currentUser={currentUser}
        currentTab={adminTab}
        onTabChange={(tab) => {
          if (tab === 'add-news') setEditingNewsArticle(null);
          setAdminTab(tab);
        }}
        onLogout={handleAdminLogout}
        onViewWebsite={() => setView('home')}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            currentUser={currentUser}
            onNavigate={(tab) => {
              if (tab === 'add-news') setEditingNewsArticle(null);
              setAdminTab(tab);
            }}
            onEditNews={(news) => {
              setEditingNewsArticle(news);
              setAdminTab('add-news');
            }}
          />
        )}

        {adminTab === 'add-news' && (
          <AdminNewsForm
            categories={categories}
            initialData={editingNewsArticle}
            onSuccess={() => {
              loadPortalData();
              setAdminTab('all-news');
            }}
            onCancel={() => setAdminTab('all-news')}
          />
        )}

        {adminTab === 'all-news' && (
          <AdminNewsList
            categories={categories}
            onAddNew={() => {
              setEditingNewsArticle(null);
              setAdminTab('add-news');
            }}
            onEditNews={(news) => {
              setEditingNewsArticle(news);
              setAdminTab('add-news');
            }}
          />
        )}

        {adminTab === 'breaking-news' && <AdminBreakingNews />}

        {adminTab === 'categories' && <AdminCategories />}

        {adminTab === 'advertisements' && <AdminAds />}

        {adminTab === 'users' && <AdminUsers currentUser={currentUser} />}

        {adminTab === 'media' && <AdminMedia />}

        {adminTab === 'security-logs' && <AdminSecurityLogs />}

        {adminTab === 'settings' && (
          <AdminSettings
            currentUser={currentUser}
            onUserUpdate={(updated) => setCurrentUser(updated)}
          />
        )}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* 1. Header with Bengali Calendar, Socials, Brand, Search, Nav */}
      <Header
        categories={categories}
        advertisements={advertisements}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setSearchOpen(true)}
        onNavigateHome={() => setView('home')}
        onOpenAdmin={handleOpenAdmin}
        onOpenPage={handleOpenPage}
      />

      {/* 2. Breaking News Ticker Bar */}
      {settings.breakingNewsEnabled && breakingNews.length > 0 && (
        <BreakingNewsTicker
          items={breakingNews}
          speed={settings.breakingTickerSpeed || 5}
          onSelectBreakingNews={(item) => {
            if (item.link) {
              const matched = (initialData?.latestNews || []).find((n) => n.slug === item.link || n.id === item.link);
              if (matched) {
                handleSelectArticle(matched);
                return;
              }
            }
            // fallback: open search for this headline
            setSearchOpen(true);
          }}
        />
      )}

      {/* 3. Search Modal Component */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        categories={categories}
        onSelectArticle={handleSelectArticle}
      />

      {/* 4. Dynamic Views */}
      <main className="flex-1">
        {/* VIEW: Article Details */}
        {view === 'article' && selectedArticle && (
          <NewsDetailPage
            article={selectedArticle}
            relatedNews={relatedArticles}
            categories={categories}
            advertisements={advertisements}
            onSelectCategory={handleSelectCategory}
            onSelectArticle={handleSelectArticle}
            onBackToHome={() => setView('home')}
          />
        )}

        {/* VIEW: Category Page */}
        {view === 'category' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="pb-4 mb-6 border-b-2 border-red-600 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  সংবাদ বিভাগ
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
                  {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                </h1>
              </div>
              <button
                onClick={() => setView('home')}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                ← মূল পাতায় ফিরুন
              </button>
            </div>

            {/* Category News Grid */}
            {(categoryNews[selectedCategory] || []).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(categoryNews[selectedCategory] || []).map((art) => (
                  <NewsCard
                    key={art.id}
                    article={art}
                    categoryName={categories.find((c) => c.slug === art.category)?.name}
                    onClick={handleSelectArticle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl text-center text-gray-500 border border-gray-200">
                <p className="text-base font-semibold">এই বিভাগে বর্তমানে কোনো সংবাদ নেই</p>
                <p className="text-xs text-gray-400 mt-1">শীঘ্রই নতুন সংবাদ প্রকাশিত হবে</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW: Static Pages */}
        {view === 'page' && (
          <StaticPages
            page={activePage}
            settings={settings}
            onBack={() => setView('home')}
          />
        )}

        {/* VIEW: Default Homepage */}
        {view === 'home' && (
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
            {/* Top Advertisement Slot */}
            <AdBanner position="home_top" advertisements={advertisements} />

            {/* SECTION 1: Lead Stories & Trending / Latest Feed */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 cols: Primary & Secondary Lead stories */}
              <div className="lg:col-span-8 space-y-6">
                {primaryLead && (
                  <NewsCard
                    article={primaryLead}
                    variant="lead"
                    categoryName={categories.find((c) => c.slug === primaryLead.category)?.name}
                    onClick={handleSelectArticle}
                  />
                )}

                {/* Secondary 3 Leads Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {secondaryLeads.map((sec) => (
                    <NewsCard
                      key={sec.id}
                      article={sec}
                      variant="standard"
                      categoryName={categories.find((c) => c.slug === sec.category)?.name}
                      onClick={handleSelectArticle}
                    />
                  ))}
                </div>
              </div>

              {/* Right 4 cols: Latest vs Trending News Tabs Widget */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col h-full">
                {/* Tabs Header */}
                <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 text-xs font-bold">
                  <button
                    onClick={() => setFeedTab('latest')}
                    className={`py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      feedTab === 'latest'
                        ? 'bg-white text-red-700 border-b-2 border-red-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>সর্বশেষ সংবাদ</span>
                  </button>
                  <button
                    onClick={() => setFeedTab('trending')}
                    className={`py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      feedTab === 'trending'
                        ? 'bg-white text-red-700 border-b-2 border-red-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-red-600" />
                    <span>সর্বাধিক পঠিত</span>
                  </button>
                </div>

                {/* Feed Content */}
                <div className="p-3 flex-1 overflow-y-auto max-h-[580px] space-y-1">
                  {feedTab === 'latest' ? (
                    latestNews.slice(0, 7).map((art, idx) => (
                      <NewsCard
                        key={art.id}
                        article={art}
                        variant="compact"
                        rank={idx + 1}
                        onClick={handleSelectArticle}
                      />
                    ))
                  ) : (
                    trendingNews.slice(0, 7).map((art, idx) => (
                      <NewsCard
                        key={art.id}
                        article={art}
                        variant="compact"
                        rank={idx + 1}
                        onClick={handleSelectArticle}
                      />
                    ))
                  )}
                </div>

                {/* Bottom View All Link */}
                <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                  <button
                    onClick={() => handleSelectCategory('chuadanga')}
                    className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                  >
                    <span>সকল সংবাদ পড়ুন</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 2: Chuadanga Special Local News Section */}
            <section className="bg-gradient-to-r from-red-50/70 via-white to-orange-50/50 p-5 sm:p-7 rounded-2xl border border-red-100 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-5 border-b border-red-200 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-serif">
                      চুয়াডাঙ্গার খবর — জেলা ও উপজেলার তাজা খবর
                    </h2>
                    <p className="text-xs text-red-600 font-semibold">
                      চুয়াডাঙ্গা সদর, আলমডাঙ্গা, দামুড়হুদা, জীবননগর ও দর্শনার বিশেষ সংবাদ
                    </p>
                  </div>
                </div>

                {/* Sub-District Filter Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
                  {[
                    { id: 'all', label: 'সকল চুয়াডাঙ্গা' },
                    { id: 'chuadanga-sadar', label: 'চুয়াডাঙ্গা সদর' },
                    { id: 'alamdanga', label: 'আলমডাঙ্গা' },
                    { id: 'damurhuda', label: 'দামুড়হুদা' },
                    { id: 'jibannagar', label: 'জীবননগর' },
                    { id: 'darshana', label: 'দর্শনা' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setChuadangaSubFilter(sub.id)}
                      className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        chuadangaSubFilter === sub.id
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-white hover:bg-red-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chuadanga Articles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {chuadangaArticles.slice(0, 4).map((art) => (
                  <NewsCard
                    key={art.id}
                    article={art}
                    categoryName="চুয়াডাঙ্গা"
                    onClick={handleSelectArticle}
                  />
                ))}
              </div>
            </section>

            {/* Middle Advertisement Slot */}
            <AdBanner position="home_middle" advertisements={advertisements} />

            {/* SECTION 3: Categorized News Sections (National & Politics) */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Box A: জাতীয় ও রাজনীতি */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-red-600">
                  <h3 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span>রাজনীতি ও জাতীয়</span>
                  </h3>
                  <button
                    onClick={() => handleSelectCategory('politics')}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    আরও দেখুন →
                  </button>
                </div>

                <div className="space-y-3">
                  {(categoryNews['politics'] || []).slice(0, 3).map((art) => (
                    <NewsCard
                      key={art.id}
                      article={art}
                      variant="horizontal"
                      categoryName="রাজনীতি"
                      onClick={handleSelectArticle}
                    />
                  ))}
                </div>
              </div>

              {/* Box B: অপরাধ ও আইনশৃঙ্খলা */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-red-600">
                  <h3 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span>অপরাধ ও আইনশৃঙ্খলা</span>
                  </h3>
                  <button
                    onClick={() => handleSelectCategory('crime')}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    আরও দেখুন →
                  </button>
                </div>

                <div className="space-y-3">
                  {(categoryNews['crime'] || []).slice(0, 3).map((art) => (
                    <NewsCard
                      key={art.id}
                      article={art}
                      variant="horizontal"
                      categoryName="অপরাধ"
                      onClick={handleSelectArticle}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Between News Advertisement */}
            <AdBanner position="between_news" advertisements={advertisements} />

            {/* SECTION 4: 3 Columns (Sports, Tech & Jobs, Agro & Economy) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Sports */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-emerald-600">
                  <h3 className="text-base font-bold text-gray-900 font-serif">খেলাধুলা</h3>
                  <button
                    onClick={() => handleSelectCategory('sports')}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    সকল
                  </button>
                </div>
                <div className="space-y-3">
                  {(categoryNews['sports'] || []).slice(0, 3).map((art) => (
                    <NewsCard
                      key={art.id}
                      article={art}
                      variant="horizontal"
                      onClick={handleSelectArticle}
                    />
                  ))}
                </div>
              </div>

              {/* Column 2: Tech & Jobs */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-blue-600">
                  <h3 className="text-base font-bold text-gray-900 font-serif">তথ্যপ্রযুক্তি ও চাকরি</h3>
                  <button
                    onClick={() => handleSelectCategory('technology')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    সকল
                  </button>
                </div>
                <div className="space-y-3">
                  {(categoryNews['technology'] || []).slice(0, 3).map((art) => (
                    <NewsCard
                      key={art.id}
                      article={art}
                      variant="horizontal"
                      onClick={handleSelectArticle}
                    />
                  ))}
                </div>
              </div>

              {/* Column 3: Agro & Economy */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-amber-600">
                  <h3 className="text-base font-bold text-gray-900 font-serif">কৃষি ও অর্থনীতি</h3>
                  <button
                    onClick={() => handleSelectCategory('economy')}
                    className="text-xs font-semibold text-amber-600 hover:underline"
                  >
                    সকল
                  </button>
                </div>
                <div className="space-y-3">
                  {(categoryNews['economy'] || categoryNews['agriculture'] || []).slice(0, 3).map((art) => (
                    <NewsCard
                      key={art.id}
                      article={art}
                      variant="horizontal"
                      onClick={handleSelectArticle}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Footer Advertisement */}
            <AdBanner position="footer" advertisements={advertisements} />
          </div>
        )}
      </main>

      {/* 5. Professional Bengali Newspaper Footer */}
      <Footer
        categories={categories}
        settings={settings}
        onSelectCategory={handleSelectCategory}
        onOpenPage={handleOpenPage}
        onOpenAdmin={handleOpenAdmin}
      />
    </div>
  );
}

export default App;
