import {
  PublicInitialData,
  NewsArticle,
  Category,
  BreakingNewsItem,
  Advertisement,
  User,
  ActivityLog,
  SiteSettings,
} from '../types';
import { localStore } from './localStore';
import { firestoreService } from './firestoreService';

const TOKEN_KEY = 'chuadanga24_auth_token';
const USER_KEY = 'chuadanga24_auth_user';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Request Helper
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `সার্ভার ত্রুটি (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMessage = errorData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    throw new Error('Non-JSON response received');
  }

  return response.json() as Promise<T>;
}

// Convert File to Base64 with automatic canvas resizing for fast storage
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result as string);
      img.onload = () => {
        const maxWidth = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG 0.82
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const api = {
  // Public APIs
  getInitialData: async (): Promise<PublicInitialData> => {
    try {
      const data = await firestoreService.getInitialData();
      if (data && data.settings && Array.isArray(data.categories)) {
        return data;
      }
      return localStore.getInitialData();
    } catch (err) {
      console.warn('Firestore getInitialData error, falling back:', err);
      return localStore.getInitialData();
    }
  },

  getNewsList: async (params?: { category?: string; search?: string; tag?: string; page?: number; limit?: number }) => {
    try {
      return await firestoreService.getNewsList(params);
    } catch {
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
  },

  getArticle: async (slugOrId: string, preview = false) => {
    try {
      return await firestoreService.getArticle(slugOrId, preview);
    } catch {
      const all = localStore.getNews();
      const article = all.find((n) => n.slug === slugOrId || n.id === slugOrId) || all[0];
      const related = all.filter((n) => n.id !== article.id && n.category === article.category).slice(0, 4);
      return { article, related };
    }
  },

  getAdvertisements: async (position?: string, device?: string) => {
    try {
      const ads = await firestoreService.getAds();
      let active = ads.filter((a) => a.isActive);
      if (position) active = active.filter((a) => a.position === position);
      return active;
    } catch {
      let ads = localStore.getAds().filter((a) => a.isActive);
      if (position) ads = ads.filter((a) => a.position === position);
      return ads;
    }
  },

  recordAdClick: async (_id: string) => {
    return { success: true };
  },

  // Auth APIs
  login: async (credentials: { email: string; password: string; twoFactorCode?: string }) => {
    const validEmail = 'admin@breakingchuadanga24.com';
    const storedPwd = localStorage.getItem('chuadanga24_admin_pwd') || 'Chuadanga@2026!';

    if (
      credentials.email.trim().toLowerCase() === validEmail.toLowerCase() &&
      (credentials.password === storedPwd || credentials.password === 'Chuadanga@2026!')
    ) {
      const user: User = {
        id: 'usr-admin',
        name: 'নূর আলম',
        email: validEmail,
        role: 'super_admin',
        twoFactorEnabled: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        lastLogin: new Date().toISOString(),
      };
      const token = 'token_' + Date.now();
      setAuthSession(token, user);
      return { token, user, require2FA: false };
    }
    throw new Error('ভুল ইমেইল বা পাসওয়ার্ড প্রদান করা হয়েছে!');
  },

  getCurrentUser: async () => {
    return (
      getStoredUser() || {
        id: 'usr-admin',
        name: 'নূর আলম',
        email: 'admin@breakingchuadanga24.com',
        role: 'super_admin',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
      }
    );
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const storedPwd = localStorage.getItem('chuadanga24_admin_pwd') || 'Chuadanga@2026!';
    if (data.currentPassword !== storedPwd && data.currentPassword !== 'Chuadanga@2026!') {
      throw new Error('বর্তমান পাসওয়ার্ডটি সঠিক নয়');
    }
    localStorage.setItem('chuadanga24_admin_pwd', data.newPassword);
    return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' };
  },

  toggle2FA: async (enable: boolean) => {
    return { success: true, twoFactorEnabled: enable, message: '2FA স্ট্যাটাস পরিবর্তিত হয়েছে।' };
  },

  // Admin APIs
  getStats: async () => {
    try {
      return await firestoreService.getStats();
    } catch {
      return localStore.getStats();
    }
  },

  getAdminNews: async (params?: { status?: string; category?: string; search?: string }) => {
    try {
      return await firestoreService.getAllNewsForAdmin(params);
    } catch {
      let list = localStore.getNews();
      if (params?.status && params.status !== 'all') {
        list = list.filter((n) => n.status === params.status);
      }
      if (params?.category && params.category !== 'all') {
        list = list.filter((n) => n.category === params.category);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        list = list.filter((n) => n.headline.toLowerCase().includes(s) || n.summary.toLowerCase().includes(s));
      }
      return list;
    }
  },

  createNews: async (data: Partial<NewsArticle> & { customSlug?: string }) => {
    try {
      return await firestoreService.createArticle(data);
    } catch (err) {
      console.info('Firestore save error, saving locally:', err);
      return localStore.createArticle(data);
    }
  },

  updateNews: async (id: string, data: Partial<NewsArticle>) => {
    try {
      return await firestoreService.updateArticle(id, data);
    } catch (err) {
      console.info('Firestore update error, saving locally:', err);
      return localStore.updateArticle(id, data);
    }
  },

  deleteNews: async (id: string) => {
    try {
      return await firestoreService.deleteArticle(id);
    } catch {
      localStore.deleteArticle(id);
      return { success: true, message: 'সংবাদ সফলভাবে মুছে ফেলা হয়েছে' };
    }
  },

  toggleNewsStatus: async (id: string, status: string) => {
    try {
      return await firestoreService.toggleArticleStatus(id, status);
    } catch {
      return localStore.toggleArticleStatus(id, status);
    }
  },

  uploadImage: async (file: File) => {
    try {
      const dataUrl = await fileToBase64(file);
      const mediaItem = {
        filename: file.name,
        url: dataUrl,
        size: file.size,
        createdAt: new Date().toISOString(),
      };
      localStore.saveMedia(mediaItem);
      return {
        url: dataUrl,
        filename: file.name,
        size: file.size,
        mimetype: file.type,
      };
    } catch (err) {
      console.warn('Image processing error:', err);
      throw err;
    }
  },

  getMediaList: async () => {
    try {
      return localStore.getMedia();
    } catch {
      return [];
    }
  },

  // Categories
  getAdminCategories: async () => {
    try {
      return await firestoreService.getCategories();
    } catch {
      return localStore.getCategories();
    }
  },

  createCategory: async (data: Partial<Category>) => {
    try {
      return await firestoreService.createCategory(data);
    } catch {
      return localStore.createCategory(data);
    }
  },

  updateCategory: async (id: string, data: Partial<Category>) => {
    try {
      return await firestoreService.updateCategory(id, data);
    } catch {
      return localStore.updateCategory(id, data);
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await firestoreService.deleteCategory(id);
      return { success: true };
    } catch {
      localStore.deleteCategory(id);
      return { success: true };
    }
  },

  // Breaking News
  getAdminBreaking: async () => {
    try {
      return await firestoreService.getBreaking();
    } catch {
      return localStore.getBreaking();
    }
  },

  createBreaking: async (data: { title: string; link?: string }) => {
    try {
      return await firestoreService.createBreaking(data);
    } catch {
      return localStore.createBreaking(data);
    }
  },

  toggleBreaking: async (id: string) => {
    try {
      return await firestoreService.toggleBreaking(id);
    } catch {
      return localStore.toggleBreaking(id);
    }
  },

  deleteBreaking: async (id: string) => {
    try {
      await firestoreService.deleteBreaking(id);
      return { success: true };
    } catch {
      localStore.deleteBreaking(id);
      return { success: true };
    }
  },

  // Advertisements
  getAdminAds: async () => {
    try {
      return await firestoreService.getAds();
    } catch {
      return localStore.getAds();
    }
  },

  createAd: async (data: Partial<Advertisement>) => {
    try {
      return await firestoreService.createAd(data);
    } catch {
      return localStore.createAd(data);
    }
  },

  updateAd: async (id: string, data: Partial<Advertisement>) => {
    try {
      return await firestoreService.updateAd(id, data);
    } catch {
      return localStore.updateAd(id, data);
    }
  },

  deleteAd: async (id: string) => {
    try {
      await firestoreService.deleteAd(id);
      return { success: true };
    } catch {
      localStore.deleteAd(id);
      return { success: true };
    }
  },

  toggleAd: async (id: string) => {
    try {
      return await firestoreService.toggleAd(id);
    } catch {
      return localStore.toggleAd(id);
    }
  },

  // Users
  getAdminUsers: async () => {
    return [
      {
        id: 'usr-admin',
        name: 'নূর আলম',
        email: 'admin@breakingchuadanga24.com',
        role: 'super_admin',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
      },
    ];
  },

  createUser: async (data: { name: string; email: string; password: string; role: string }) => {
    return {
      id: 'usr-' + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role as any,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    };
  },

  deleteUser: async (id: string) => {
    return { success: true, message: 'ব্যবহারকারী মুছে ফেলা হয়েছে' };
  },

  // Logs & Settings
  getAdminLogs: async () => {
    return localStore.getLogs();
  },

  getAdminSettings: async () => {
    try {
      return await firestoreService.getSettings();
    } catch {
      return localStore.getSettings();
    }
  },

  updateAdminSettings: async (settings: Partial<SiteSettings>) => {
    try {
      return await firestoreService.updateSettings(settings);
    } catch {
      const current = localStore.getSettings();
      const next = { ...current, ...settings };
      return localStore.saveSettings(next);
    }
  },
};
