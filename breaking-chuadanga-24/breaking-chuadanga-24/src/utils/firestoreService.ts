import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  NewsArticle,
  Category,
  BreakingNewsItem,
  Advertisement,
  SiteSettings,
  PublicInitialData,
  ActivityLog,
} from '../types';
import {
  fallbackNews,
  fallbackCategories,
  fallbackBreakingNews,
  fallbackAds,
  fallbackSettings,
} from '../data/initialData';
import { localStore } from './localStore';

// Collection references
const NEWS_COL = 'news';
const CATS_COL = 'categories';
const BREAKING_COL = 'breaking_news';
const ADS_COL = 'advertisements';
const SETTINGS_COL = 'settings';
const LOGS_COL = 'activity_logs';

let isSeeding = false;
let isSeeded = false;

// Seed initial fallback data to Firestore if empty
export async function ensureFirestoreSeeded(): Promise<void> {
  if (isSeeded || isSeeding) return;
  isSeeding = true;

  try {
    const newsSnap = await getDocs(query(collection(db, NEWS_COL), limit(1)));
    if (newsSnap.empty) {
      console.log('🌱 Seeding initial news data into Firebase Firestore...');
      const batch = writeBatch(db);

      // Seed News
      fallbackNews.forEach((item) => {
        const ref = doc(db, NEWS_COL, item.id);
        batch.set(ref, item);
      });

      // Seed Categories
      fallbackCategories.forEach((cat) => {
        const ref = doc(db, CATS_COL, cat.id);
        batch.set(ref, cat);
      });

      // Seed Breaking News
      fallbackBreakingNews.forEach((b) => {
        const ref = doc(db, BREAKING_COL, b.id);
        batch.set(ref, b);
      });

      // Seed Advertisements
      fallbackAds.forEach((ad) => {
        const ref = doc(db, ADS_COL, ad.id);
        batch.set(ref, ad);
      });

      // Seed Settings
      const settingsRef = doc(db, SETTINGS_COL, 'general');
      batch.set(settingsRef, fallbackSettings);

      await batch.commit();
      console.log('✅ Firebase Firestore seeded successfully!');
    }
    isSeeded = true;
  } catch (err) {
    console.warn('Could not seed Firestore (offline or permission issue), continuing:', err);
  } finally {
    isSeeding = false;
  }
}

export const firestoreService = {
  // --- NEWS ---
  async getNewsList(params?: { category?: string; search?: string; tag?: string; page?: number; limit?: number }) {
    await ensureFirestoreSeeded();

    try {
      const q = query(collection(db, NEWS_COL));
      const snap = await getDocs(q);

      let articles: NewsArticle[] = [];
      snap.forEach((d) => {
        articles.push(d.data() as NewsArticle);
      });

      if (articles.length === 0) {
        articles = localStore.getNews();
      }

      // Sort by publishDate descending
      articles.sort((a, b) => new Date(b.publishDate || b.createdAt).getTime() - new Date(a.publishDate || a.createdAt).getTime());

      // Filter published only for public list
      let filtered = articles.filter((n) => n.status === 'published');

      if (params?.category) {
        filtered = filtered.filter((n) => n.category === params.category);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (n) => n.headline.toLowerCase().includes(s) || n.summary.toLowerCase().includes(s),
        );
      }
      if (params?.tag) {
        filtered = filtered.filter((n) => n.tags?.includes(params.tag!));
      }

      const page = params?.page || 1;
      const pageLimit = params?.limit || 10;
      const start = (page - 1) * pageLimit;

      return {
        total: filtered.length,
        page,
        pageSize: pageLimit,
        totalPages: Math.ceil(filtered.length / pageLimit) || 1,
        articles: filtered.slice(start, start + pageLimit),
      };
    } catch (err) {
      console.warn('Firestore fetch failed, falling back to localStore:', err);
      return apiFallbackNews(params);
    }
  },

  async getAllNewsForAdmin(params?: { status?: string; category?: string; search?: string }): Promise<NewsArticle[]> {
    await ensureFirestoreSeeded();

    try {
      const snap = await getDocs(collection(db, NEWS_COL));
      let articles: NewsArticle[] = [];
      snap.forEach((d) => articles.push(d.data() as NewsArticle));

      if (articles.length === 0) {
        articles = localStore.getNews();
      }

      // Sort by createdAt descending
      articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (params?.status && params.status !== 'all') {
        articles = articles.filter((n) => n.status === params.status);
      }
      if (params?.category && params.category !== 'all') {
        articles = articles.filter((n) => n.category === params.category);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        articles = articles.filter(
          (n) => n.headline.toLowerCase().includes(s) || n.summary.toLowerCase().includes(s),
        );
      }

      return articles;
    } catch (err) {
      console.warn('Firestore getAllNewsForAdmin failed, using localStore:', err);
      let list = localStore.getNews();
      if (params?.status && params.status !== 'all') list = list.filter((n) => n.status === params.status);
      if (params?.category && params.category !== 'all') list = list.filter((n) => n.category === params.category);
      if (params?.search) {
        const s = params.search.toLowerCase();
        list = list.filter((n) => n.headline.toLowerCase().includes(s) || n.summary.toLowerCase().includes(s));
      }
      return list;
    }
  },

  async getArticle(slugOrId: string, preview = false): Promise<{ article: NewsArticle; related: NewsArticle[] }> {
    await ensureFirestoreSeeded();

    try {
      const snap = await getDocs(collection(db, NEWS_COL));
      const all: NewsArticle[] = [];
      snap.forEach((d) => all.push(d.data() as NewsArticle));

      let article = all.find((n) => n.slug === slugOrId || n.id === slugOrId);

      if (!article) {
        article = localStore.getNews().find((n) => n.slug === slugOrId || n.id === slugOrId) || fallbackNews[0];
      }

      // Increment views in Firestore
      if (article && !preview) {
        const artRef = doc(db, NEWS_COL, article.id);
        const newViews = (article.views || 0) + 1;
        updateDoc(artRef, { views: newViews }).catch(() => {});
        article.views = newViews;
      }

      const related = all
        .filter((n) => n.id !== article!.id && n.category === article!.category && n.status === 'published')
        .slice(0, 4);

      return { article: article!, related };
    } catch (err) {
      console.warn('Firestore getArticle failed:', err);
      const all = localStore.getNews();
      const article = all.find((n) => n.slug === slugOrId || n.id === slugOrId) || fallbackNews[0];
      const related = all.filter((n) => n.id !== article.id && n.category === article.category).slice(0, 4);
      return { article, related };
    }
  },

  async createArticle(data: Partial<NewsArticle> & { customSlug?: string }): Promise<NewsArticle> {
    await ensureFirestoreSeeded();

    const id = 'news-' + Date.now();
    const slug = data.customSlug || data.slug || 'news-' + Date.now();

    const newArt: NewsArticle = {
      id,
      headline: data.headline || 'শিরোনামহীন সংবাদ',
      slug,
      summary: data.summary || '',
      content: data.content || '',
      featuredImage: data.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=480&fit=crop&q=80',
      imageCaption: data.imageCaption || '',
      category: data.category || 'chuadanga',
      subCategory: data.subCategory || '',
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

    try {
      await setDoc(doc(db, NEWS_COL, id), newArt);
      console.log('✅ Article saved to Firebase Firestore:', newArt.headline);
    } catch (err) {
      console.warn('Could not save to Firestore directly, cached locally:', err);
    }

    localStore.createArticle(newArt);
    this.addLog('সংবাদ তৈরি', `নতুন সংবাদ যোগ করা হয়েছে: ${newArt.headline}`);
    return newArt;
  },

  async updateArticle(id: string, data: Partial<NewsArticle>): Promise<NewsArticle> {
    await ensureFirestoreSeeded();

    const updatedData: Partial<NewsArticle> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      const artRef = doc(db, NEWS_COL, id);
      await updateDoc(artRef, updatedData);
      console.log('✅ Article updated in Firestore:', id);
    } catch (err) {
      console.warn('Firestore update failed:', err);
    }

    const updated = localStore.updateArticle(id, updatedData);
    this.addLog('সংবাদ সংশোধন', `সংবাদ আপডেট করা হয়েছে (ID: ${id})`);
    return updated;
  },

  async deleteArticle(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await deleteDoc(doc(db, NEWS_COL, id));
      console.log('✅ Article deleted from Firestore:', id);
    } catch (err) {
      console.warn('Firestore delete failed:', err);
    }

    localStore.deleteArticle(id);
    this.addLog('সংবাদ মুছে ফেলা', `সংবাদ ডিলিট করা হয়েছে (ID: ${id})`);
    return { success: true, message: 'সংবাদ সফলভাবে মুছে ফেলা হয়েছে' };
  },

  async toggleArticleStatus(id: string, status: string): Promise<NewsArticle> {
    try {
      await updateDoc(doc(db, NEWS_COL, id), {
        status: status as any,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore toggleStatus failed:', err);
    }

    return localStore.toggleArticleStatus(id, status);
  },

  // --- INITIAL DATA & BATCH FETCH ---
  async getInitialData(): Promise<PublicInitialData> {
    await ensureFirestoreSeeded();

    try {
      const [newsSnap, catsSnap, breakingSnap, adsSnap, settingsDoc] = await Promise.all([
        getDocs(collection(db, NEWS_COL)),
        getDocs(collection(db, CATS_COL)),
        getDocs(collection(db, BREAKING_COL)),
        getDocs(collection(db, ADS_COL)),
        getDoc(doc(db, SETTINGS_COL, 'general')),
      ]);

      const newsList: NewsArticle[] = [];
      newsSnap.forEach((d) => newsList.push(d.data() as NewsArticle));

      const categories: Category[] = [];
      catsSnap.forEach((d) => categories.push(d.data() as Category));
      categories.sort((a, b) => a.order - b.order);

      const breakingNews: BreakingNewsItem[] = [];
      breakingSnap.forEach((d) => {
        const item = d.data() as BreakingNewsItem;
        if (item.isActive) breakingNews.push(item);
      });

      const advertisements: Advertisement[] = [];
      adsSnap.forEach((d) => {
        const ad = d.data() as Advertisement;
        if (ad.isActive) advertisements.push(ad);
      });

      const settings: SiteSettings = settingsDoc.exists()
        ? (settingsDoc.data() as SiteSettings)
        : fallbackSettings;

      const articles = newsList.length > 0 ? newsList : fallbackNews;
      const cats = categories.length > 0 ? categories : fallbackCategories;

      // Filter published articles
      const published = articles.filter((n) => n.status === 'published');

      // Sort by publishDate descending
      published.sort(
        (a, b) => new Date(b.publishDate || b.createdAt).getTime() - new Date(a.publishDate || a.createdAt).getTime(),
      );

      const categoryNewsMap: Record<string, NewsArticle[]> = {};
      cats.forEach((cat) => {
        categoryNewsMap[cat.slug] = published.filter((n) => n.category === cat.slug);
      });

      return {
        settings,
        categories: cats,
        breakingNews: breakingNews.length > 0 ? breakingNews : fallbackBreakingNews,
        featuredNews: published.filter((n) => n.isFeatured),
        latestNews: published,
        trendingNews: published.filter((n) => n.isTrending),
        categoryNewsMap,
        categoryNews: categoryNewsMap,
        chuadangaLocalNews: published.filter((n) => n.category === 'chuadanga'),
        advertisements: advertisements.length > 0 ? advertisements : fallbackAds,
      };
    } catch (err) {
      console.warn('Firestore getInitialData failed, using localStore:', err);
      return localStore.getInitialData();
    }
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    await ensureFirestoreSeeded();
    try {
      const snap = await getDocs(collection(db, CATS_COL));
      const cats: Category[] = [];
      snap.forEach((d) => cats.push(d.data() as Category));
      cats.sort((a, b) => a.order - b.order);
      return cats.length > 0 ? cats : fallbackCategories;
    } catch {
      return localStore.getCategories();
    }
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const id = 'cat-' + Date.now();
    const newCat: Category = {
      id,
      name: data.name || '',
      slug: data.slug || 'cat-' + Date.now(),
      order: data.order || 99,
      showInNav: data.showInNav ?? true,
      description: data.description || '',
    };

    try {
      await setDoc(doc(db, CATS_COL, id), newCat);
    } catch (err) {
      console.warn('Firestore createCategory error:', err);
    }

    localStore.createCategory(newCat);
    return newCat;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    try {
      await updateDoc(doc(db, CATS_COL, id), data);
    } catch (err) {
      console.warn('Firestore updateCategory error:', err);
    }
    return localStore.updateCategory(id, data);
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, CATS_COL, id));
    } catch (err) {
      console.warn('Firestore deleteCategory error:', err);
    }
    localStore.deleteCategory(id);
  },

  // --- BREAKING NEWS ---
  async getBreaking(): Promise<BreakingNewsItem[]> {
    await ensureFirestoreSeeded();
    try {
      const snap = await getDocs(collection(db, BREAKING_COL));
      const items: BreakingNewsItem[] = [];
      snap.forEach((d) => items.push(d.data() as BreakingNewsItem));
      return items.length > 0 ? items : fallbackBreakingNews;
    } catch {
      return localStore.getBreaking();
    }
  },

  async createBreaking(data: { title: string; link?: string }): Promise<BreakingNewsItem> {
    const id = 'brk-' + Date.now();
    const item: BreakingNewsItem = {
      id,
      title: data.title,
      link: data.link || '',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    try {
      await setDoc(doc(db, BREAKING_COL, id), item);
    } catch (err) {
      console.warn('Firestore createBreaking error:', err);
    }

    localStore.createBreaking(item);
    return item;
  },

  async toggleBreaking(id: string): Promise<BreakingNewsItem> {
    const list = await this.getBreaking();
    const target = list.find((b) => b.id === id);
    const nextState = target ? !target.isActive : true;

    try {
      await updateDoc(doc(db, BREAKING_COL, id), { isActive: nextState });
    } catch (err) {
      console.warn('Firestore toggleBreaking error:', err);
    }

    return localStore.toggleBreaking(id);
  },

  async deleteBreaking(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, BREAKING_COL, id));
    } catch (err) {
      console.warn('Firestore deleteBreaking error:', err);
    }
    localStore.deleteBreaking(id);
  },

  // --- ADS ---
  async getAds(): Promise<Advertisement[]> {
    await ensureFirestoreSeeded();
    try {
      const snap = await getDocs(collection(db, ADS_COL));
      const ads: Advertisement[] = [];
      snap.forEach((d) => ads.push(d.data() as Advertisement));
      return ads.length > 0 ? ads : fallbackAds;
    } catch {
      return localStore.getAds();
    }
  },

  async createAd(data: Partial<Advertisement>): Promise<Advertisement> {
    const id = 'ad-' + Date.now();
    const newAd: Advertisement = {
      id,
      title: data.title || '',
      position: data.position || 'sidebar',
      type: data.type || 'image',
      imageUrl: data.imageUrl || '',
      destinationUrl: data.destinationUrl || '',
      deviceTarget: data.deviceTarget || 'all',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '2030-01-01',
      isActive: data.isActive ?? true,
      impressions: 0,
      clicks: 0,
    };

    try {
      await setDoc(doc(db, ADS_COL, id), newAd);
    } catch (err) {
      console.warn('Firestore createAd error:', err);
    }

    localStore.createAd(newAd);
    return newAd;
  },

  async updateAd(id: string, data: Partial<Advertisement>): Promise<Advertisement> {
    try {
      await updateDoc(doc(db, ADS_COL, id), data);
    } catch (err) {
      console.warn('Firestore updateAd error:', err);
    }
    return localStore.updateAd(id, data);
  },

  async deleteAd(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ADS_COL, id));
    } catch (err) {
      console.warn('Firestore deleteAd error:', err);
    }
    localStore.deleteAd(id);
  },

  async toggleAd(id: string): Promise<Advertisement> {
    const ads = await this.getAds();
    const target = ads.find((a) => a.id === id);
    const nextState = target ? !target.isActive : true;

    try {
      await updateDoc(doc(db, ADS_COL, id), { isActive: nextState });
    } catch (err) {
      console.warn('Firestore toggleAd error:', err);
    }
    return localStore.toggleAd(id);
  },

  // --- SETTINGS ---
  async getSettings(): Promise<SiteSettings> {
    await ensureFirestoreSeeded();
    try {
      const snap = await getDoc(doc(db, SETTINGS_COL, 'general'));
      if (snap.exists()) {
        return snap.data() as SiteSettings;
      }
      return fallbackSettings;
    } catch {
      return localStore.getSettings();
    }
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    try {
      const ref = doc(db, SETTINGS_COL, 'general');
      await setDoc(ref, settings, { merge: true });
    } catch (err) {
      console.warn('Firestore updateSettings error:', err);
    }
    const current = localStore.getSettings();
    const next = { ...current, ...settings };
    return localStore.saveSettings(next);
  },

  // --- STATS ---
  async getStats() {
    await ensureFirestoreSeeded();
    try {
      const newsSnap = await getDocs(collection(db, NEWS_COL));
      const adsSnap = await getDocs(collection(db, ADS_COL));
      const catsSnap = await getDocs(collection(db, CATS_COL));
      const breakingSnap = await getDocs(collection(db, BREAKING_COL));

      let totalNews = 0;
      let publishedNews = 0;
      let draftNews = 0;
      let totalViews = 0;

      newsSnap.forEach((d) => {
        const item = d.data() as NewsArticle;
        totalNews++;
        if (item.status === 'published') publishedNews++;
        if (item.status === 'draft') draftNews++;
        totalViews += item.views || 0;
      });

      let activeBreaking = 0;
      breakingSnap.forEach((d) => {
        const b = d.data() as BreakingNewsItem;
        if (b.isActive) activeBreaking++;
      });

      let activeAds = 0;
      adsSnap.forEach((d) => {
        const ad = d.data() as Advertisement;
        if (ad.isActive) activeAds++;
      });

      return {
        totalNews,
        publishedNews,
        draftNews,
        activeBreaking,
        totalViews,
        totalEditors: 3,
        activeAds,
        categoriesCount: catsSnap.size || fallbackCategories.length,
      };
    } catch {
      return localStore.getStats();
    }
  },

  addLog(action: string, details: string) {
    localStore.addLog(action, details);
  },
};

function apiFallbackNews(params?: { category?: string; search?: string; tag?: string; page?: number; limit?: number }) {
  let articles = localStore.getNews().filter((n) => n.status === 'published');
  if (params?.category) {
    articles = articles.filter((n) => n.category === params.category);
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    articles = articles.filter(
      (n) => n.headline.toLowerCase().includes(s) || n.summary.toLowerCase().includes(s),
    );
  }
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const start = (page - 1) * limit;
  return {
    total: articles.length,
    page,
    pageSize: limit,
    totalPages: Math.ceil(articles.length / limit) || 1,
    articles: articles.slice(start, start + limit),
  };
}
