export type Role = 'super_admin' | 'admin' | 'editor';
export type UserRole = Role;

export type NewsStatus = 'published' | 'draft' | 'scheduled' | 'archived';

export interface NewsArticle {
  id: string;
  headline: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage: string;
  imageCaption?: string;
  category: string;
  subCategory?: string;
  tags: string[];
  reporter: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  publishDate: string;
  status: NewsStatus;
  views: number;
  isFeatured: boolean;
  isBreaking: boolean;
  isTrending: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  showInNav: boolean;
  description?: string;
}

export interface BreakingNewsItem {
  id: string;
  title: string;
  link?: string;
  newsId?: string;
  createdAt: string;
  isActive: boolean;
}

export type AdPosition =
  | 'header'
  | 'home_top'
  | 'home_middle'
  | 'between_news'
  | 'sidebar'
  | 'article_page'
  | 'footer';

export interface Advertisement {
  id: string;
  title: string;
  position: AdPosition;
  type: 'image' | 'code';
  imageUrl?: string;
  destinationUrl?: string;
  htmlCode?: string;
  deviceTarget: 'all' | 'desktop' | 'mobile';
  device?: 'all' | 'desktop' | 'mobile';
  startDate: string;
  endDate: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  mustChangePassword?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  ip: string;
}

export interface SiteSettings {
  siteName: string;
  siteNameBangla: string;
  tagline: string;
  editorName: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  facebookUrl: string;
  youtubeUrl: string;
  breakingNewsEnabled: boolean;
  tickerSpeed: number;
  allowComments: boolean;
}

export interface PublicInitialData {
  categories: Category[];
  breakingNews: BreakingNewsItem[];
  advertisements: Advertisement[];
  featuredNews: NewsArticle[];
  latestNews: NewsArticle[];
  trendingNews: NewsArticle[];
  categoryNewsMap: Record<string, NewsArticle[]>;
  categoryNews?: Record<string, NewsArticle[]>;
  chuadangaLocalNews: NewsArticle[];
  settings: SiteSettings;
}
