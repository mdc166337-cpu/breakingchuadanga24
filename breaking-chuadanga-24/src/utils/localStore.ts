import {
  NewsArticle,
  Category,
  BreakingNewsItem,
  Advertisement,
  SiteSettings,
  PublicInitialData,
  User,
  ActivityLog,
} from '../types';
import {
  fallbackNews,
  fallbackCategories,
  fallbackBreakingNews,
  fallbackAds,
  fallbackSettings,
  getFallbackInitialData,
} from '../data/initialData';

const NEWS_KEY = 'chuadanga24_db_news';
const CATS_KEY = 'chuadanga24_db_cats';
const BREAKING_KEY = 'chuadanga24_db_breaking';
const ADS_KEY = 'chuadanga24_db_ads';
const SETTINGS_KEY = 'chuadanga24_db_settings';
const MEDIA_KEY = 'chuadanga24_db_media';
const LOGS_KEY = 'chuadanga24_db_logs';

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

export const localStore = {
  getNews(): NewsArticle[] {
    return getStorage<NewsArticle[]>(NEWS_KEY, fallbackNews);
  },

  saveNews(newsList: NewsArticle[]): void {
    setStorage(NEWS_KEY, newsList);
  },

  createArticle(data: Partial<NewsArticle> & { customSlug?: string }): NewsArticle {
    const current = this.getNews();
    const slug = data.customSlug || data.slug || 'news-' + Date.now();
    const newArt: NewsArticle = {
      id: 'news-local-' + Date.now(),
      headline: data.headline || 'শিরোনামহীন সংবাদ',
      slug,
      summary: data.summary || '',
      content: data.content || '',
      featuredImage: data.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=480&fit=crop&q=80',
      imageCaption: data.imageCaption || '',
      category: data.category || 'chuadanga',
      subCategory: data.subCategory,
      tags: data.tags || ['চুয়াডাঙ্গা'],
      reporter: data.reporter || 'স্টাফ রিপোর্টার',
      authorId: data.authorId || 'usr-admin',
      authorName: data.authorName || 'নূর আলম',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishDate: data.publishDate || new Date().toISOString(),
      status: (data.status as 'published' | 'draft' | 'archived') || 'published',
      views: 1,
      isFeatured: !!data.isFeatured,
      isBreaking: !!data.isBreaking,
      isTrending: !!data.isTrending,
    };

    const updated = [newArt, ...current];
    this.saveNews(updated);
    this.addLog('সংবাদ তৈরি', `নতুন সংবাদ যোগ করা হয়েছে: ${newArt.headline}`);
    return newArt;
  },

  updateArticle(id: string, data: Partial<NewsArticle>): NewsArticle {
    const current = this.getNews();
    let updatedArticle: NewsArticle | null = null;
    const nextList = current.map((item) => {
      if (item.id === id || item.slug === id) {
        updatedArticle = {
          ...item,
          ...data,
          updatedAt: new Date().toISOString(),
        };
        return updatedArticle;
      }
      return item;
    });

    if (!updatedArticle) {
      throw new Error('সংবাদটি খুঁজে পাওয়া যায়নি');
    }

    this.saveNews(nextList);
    this.addLog('সংবাদ হালনাগাদ', `সংবাদ আপডেট করা হয়েছে: ${updatedArticle.headline}`);
    return updatedArticle;
  },

  deleteArticle(id: string): boolean {
    const current = this.getNews();
    const nextList = current.filter((item) => item.id !== id && item.slug !== id);
    this.saveNews(nextList);
    this.addLog('সংবাদ মুছে ফেলা', `সংবাদ ডিলিট করা হয়েছে (ID: ${id})`);
    return true;
  },

  toggleArticleStatus(id: string, status: string): NewsArticle {
    return this.updateArticle(id, { status: status as 'published' | 'draft' | 'archived' });
  },

  getCategories(): Category[] {
    return getStorage<Category[]>(CATS_KEY, fallbackCategories);
  },

  saveCategories(cats: Category[]): void {
    setStorage(CATS_KEY, cats);
  },

  createCategory(data: Partial<Category>): Category {
    const current = this.getCategories();
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: data.name || 'নতুন বিভাগ',
      slug: data.slug || 'cat-' + Date.now(),
      order: current.length + 1,
      showInNav: data.showInNav ?? true,
      description: data.description || '',
    };
    const next = [...current, newCat];
    this.saveCategories(next);
    return newCat;
  },

  updateCategory(id: string, data: Partial<Category>): Category {
    const current = this.getCategories();
    let updated: Category | null = null;
    const next = current.map((c) => {
      if (c.id === id) {
        updated = { ...c, ...data };
        return updated;
      }
      return c;
    });
    if (!updated) throw new Error('বিভাগ পাওয়া যায়নি');
    this.saveCategories(next);
    return updated;
  },

  deleteCategory(id: string): boolean {
    const current = this.getCategories();
    this.saveCategories(current.filter((c) => c.id !== id));
    return true;
  },

  getBreaking(): BreakingNewsItem[] {
    return getStorage<BreakingNewsItem[]>(BREAKING_KEY, fallbackBreakingNews);
  },

  saveBreaking(items: BreakingNewsItem[]): void {
    setStorage(BREAKING_KEY, items);
  },

  createBreaking(data: { title: string; link?: string }): BreakingNewsItem {
    const current = this.getBreaking();
    const item: BreakingNewsItem = {
      id: 'brk-' + Date.now(),
      title: data.title,
      link: data.link,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    this.saveBreaking([item, ...current]);
    return item;
  },

  toggleBreaking(id: string): BreakingNewsItem {
    const current = this.getBreaking();
    let updated: BreakingNewsItem | null = null;
    const next = current.map((item) => {
      if (item.id === id) {
        updated = { ...item, isActive: !item.isActive };
        return updated;
      }
      return item;
    });
    if (!updated) throw new Error('ব্রেকিং নিউজ পাওয়া যায়নি');
    this.saveBreaking(next);
    return updated;
  },

  deleteBreaking(id: string): boolean {
    const current = this.getBreaking();
    this.saveBreaking(current.filter((b) => b.id !== id));
    return true;
  },

  getAds(): Advertisement[] {
    return getStorage<Advertisement[]>(ADS_KEY, fallbackAds);
  },

  saveAds(ads: Advertisement[]): void {
    setStorage(ADS_KEY, ads);
  },

  createAd(data: Partial<Advertisement>): Advertisement {
    const current = this.getAds();
    const newAd: Advertisement = {
      id: 'ad-' + Date.now(),
      title: data.title || 'বিজ্ঞাপন',
      position: data.position || 'sidebar',
      type: data.type || 'image',
      imageUrl: data.imageUrl,
      destinationUrl: data.destinationUrl || '#',
      deviceTarget: data.deviceTarget || 'all',
      startDate: data.startDate || new Date().toISOString().slice(0, 10),
      endDate: data.endDate || '2030-12-31',
      isActive: true,
      impressions: 0,
      clicks: 0,
    };
    this.saveAds([newAd, ...current]);
    return newAd;
  },

  updateAd(id: string, data: Partial<Advertisement>): Advertisement {
    const current = this.getAds();
    let updated: Advertisement | null = null;
    const next = current.map((a) => {
      if (a.id === id) {
        updated = { ...a, ...data };
        return updated;
      }
      return a;
    });
    if (!updated) throw new Error('বিজ্ঞাপন পাওয়া যায়নি');
    this.saveAds(next);
    return updated;
  },

  deleteAd(id: string): boolean {
    const current = this.getAds();
    this.saveAds(current.filter((a) => a.id !== id));
    return true;
  },

  toggleAd(id: string): Advertisement {
    const current = this.getAds();
    let updated: Advertisement | null = null;
    const next = current.map((a) => {
      if (a.id === id) {
        updated = { ...a, isActive: !a.isActive };
        return updated;
      }
      return a;
    });
    if (!updated) throw new Error('বিজ্ঞাপন পাওয়া যায়নি');
    this.saveAds(next);
    return updated;
  },

  getSettings(): SiteSettings {
    return getStorage<SiteSettings>(SETTINGS_KEY, fallbackSettings);
  },

  saveSettings(settings: SiteSettings): SiteSettings {
    setStorage(SETTINGS_KEY, settings);
    return settings;
  },

  getMedia(): Array<{ filename: string; url: string; size: number; createdAt: string }> {
    return getStorage(MEDIA_KEY, []);
  },

  saveMedia(media: { filename: string; url: string; size: number; createdAt: string }): void {
    const list = this.getMedia();
    setStorage(MEDIA_KEY, [media, ...list]);
  },

  getLogs(): ActivityLog[] {
    return getStorage<ActivityLog[]>(LOGS_KEY, [
      {
        id: 'log-init',
        action: 'সিস্টেম প্রস্তুত',
        details: 'পোর্টাল সফলভাবে চালু হয়েছে',
        userId: 'usr-admin',
        userName: 'নূর আলম',
        userRole: 'super_admin',
        ip: '127.0.0.1',
        timestamp: new Date().toISOString(),
      },
    ]);
  },

  addLog(action: string, details: string): void {
    const current = this.getLogs();
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      action,
      details,
      userId: 'usr-admin',
      userName: 'নূর আলম',
      userRole: 'super_admin',
      ip: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    setStorage(LOGS_KEY, [newLog, ...current].slice(0, 50));
  },

  getStats() {
    const news = this.getNews();
    const breaking = this.getBreaking();
    const ads = this.getAds();
    const categories = this.getCategories();
    return {
      totalNews: news.length,
      publishedNews: news.filter((n) => n.status === 'published').length,
      draftNews: news.filter((n) => n.status === 'draft').length,
      activeBreaking: breaking.filter((b) => b.isActive).length,
      totalViews: news.reduce((acc, n) => acc + (n.views || 0), 0),
      totalEditors: 1,
      activeAds: ads.filter((a) => a.isActive).length,
      categoriesCount: categories.length,
    };
  },

  getInitialData(): PublicInitialData {
    const news = this.getNews();
    const categories = this.getCategories();
    const breaking = this.getBreaking().filter((b) => b.isActive);
    const ads = this.getAds().filter((a) => a.isActive);
    const settings = this.getSettings();

    const categoryNewsMap: Record<string, NewsArticle[]> = {};
    categories.forEach((cat) => {
      categoryNewsMap[cat.slug] = news.filter((n) => n.category === cat.slug && n.status === 'published');
    });

    const published = news.filter((n) => n.status === 'published');
    const chuadangaLocalNews = published.filter((n) => n.category === 'chuadanga');

    return {
      settings,
      categories,
      breakingNews: breaking,
      featuredNews: published.filter((n) => n.isFeatured),
      latestNews: [...published].sort(
        (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
      ),
      trendingNews: published.filter((n) => n.isTrending),
      categoryNewsMap,
      categoryNews: categoryNewsMap,
      chuadangaLocalNews,
      advertisements: ads,
    };
  },
};
