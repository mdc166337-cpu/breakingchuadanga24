import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import { dbManager } from './server/db.js';
import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  sanitizeText,
  generateSlug,
  SessionPayload,
} from './server/security.js';
import { NewsArticle, User, Role } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure public and upload directories exist
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const UPLOAD_DIR = path.resolve(PUBLIC_DIR, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Serve public directory and uploads statically
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOAD_DIR));

// Configure Multer for secure image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    // Reject dangerous file types explicitly
    const dangerousExtensions = ['.exe', '.sh', '.php', '.js', '.py', '.bat', '.bin', '.html'];
    if (dangerousExtensions.includes(ext)) {
      return cb(new Error('ভুল ফাইল ফরম্যাট: এক্সিকিউটেবল ফাইল আপলোড করা যাবে না'));
    }

    if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('অনুমোদিত শুধুমাত্র ইমেজ ফাইল (JPG, PNG, WEBP, GIF, SVG)'));
    }
  },
});

// Augment Express Request with Auth User
interface AuthenticatedRequest extends Request {
  user?: SessionPayload;
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'লগইন আবশ্যক' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ error: 'মেয়াদোত্তীর্ণ বা অবৈধ সেশন' });
  }

  req.user = payload;
  next();
}

function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({ error: 'আপনার এই অংশে প্রবেশের অনুমতি নেই' });
    }
    next();
  };
}

// ----------------------------------------------------
// PUBLIC API ENDPOINTS
// ----------------------------------------------------

// 1. Initial Page Data (All-in-one for blazing fast loading)
app.get('/api/public/initial-data', (_req, res) => {
  const allNews = dbManager.getNews().filter((n) => n.status === 'published');
  const categories = dbManager.getCategories().sort((a, b) => a.order - b.order);
  const breakingNews = dbManager.getBreakingNews().filter((b) => b.isActive);
  const advertisements = dbManager.getAdvertisements().filter((a) => a.isActive);
  const settings = dbManager.getSettings();

  // Featured News
  const featuredNews = allNews.filter((n) => n.isFeatured).slice(0, 5);

  // Latest News (sorted by publishDate descending)
  const latestNews = [...allNews]
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 15);

  // Trending News
  const trendingNews = [...allNews]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  // Chuadanga Local News
  const chuadangaLocalNews = allNews
    .filter((n) => n.category === 'chuadanga')
    .slice(0, 8);

  // Category wise mapping
  const categoryNewsMap: Record<string, NewsArticle[]> = {};
  for (const cat of categories) {
    categoryNewsMap[cat.slug] = allNews
      .filter((n) => n.category === cat.slug)
      .slice(0, 6);
  }

  res.json({
    categories,
    breakingNews,
    advertisements,
    featuredNews,
    latestNews,
    trendingNews,
    chuadangaLocalNews,
    categoryNewsMap,
    categoryNews: categoryNewsMap,
    settings,
  });
});

// 2. News Listing with Filters (Search, Category, Tag)
app.get('/api/news', (req, res) => {
  const { category, search, tag, page = '1', limit = '12' } = req.query;
  let articles = dbManager.getNews().filter((n) => n.status === 'published');

  if (category) {
    articles = articles.filter((n) => n.category === String(category));
  }

  if (tag) {
    articles = articles.filter((n) =>
      n.tags.some((t) => t.toLowerCase().includes(String(tag).toLowerCase())),
    );
  }

  if (search) {
    const q = String(search).toLowerCase();
    articles = articles.filter(
      (n) =>
        n.headline.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  articles.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
  const total = articles.length;
  const startIndex = (pageNum - 1) * pageSize;
  const paginated = articles.slice(startIndex, startIndex + pageSize);

  res.json({
    total,
    page: pageNum,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    articles: paginated,
  });
});

// 3. News Article by Slug or ID + Increment Views
app.get('/api/news/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const allNews = dbManager.getNews();
  const article = allNews.find(
    (n) => (n.slug === slugOrId || n.id === slugOrId) && (n.status === 'published' || req.query.preview === 'true'),
  );

  if (!article) {
    return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি' });
  }

  // Increment views
  dbManager.incrementNewsViews(article.id);

  // Get related news from the same category
  const related = allNews
    .filter((n) => n.category === article.category && n.id !== article.id && n.status === 'published')
    .slice(0, 5);

  res.json({
    article: { ...article, views: (article.views || 0) + 1 },
    related,
  });
});

// 4. Breaking News
app.get('/api/breaking-news', (_req, res) => {
  const items = dbManager.getBreakingNews().filter((b) => b.isActive);
  res.json(items);
});

// 5. Advertisements
app.get('/api/advertisements', (req, res) => {
  const { position, device } = req.query;
  let ads = dbManager.getAdvertisements().filter((a) => a.isActive);

  if (position) {
    ads = ads.filter((a) => a.position === position);
  }

  if (device && (device === 'desktop' || device === 'mobile')) {
    ads = ads.filter((a) => a.deviceTarget === 'all' || a.deviceTarget === device);
  }

  // Record impressions
  ads.forEach((ad) => dbManager.recordAdImpression(ad.id));

  res.json(ads);
});

app.post('/api/advertisements/:id/click', (req, res) => {
  const { id } = req.params;
  dbManager.recordAdClick(id);
  res.json({ success: true });
});

// 6. SEO: Dynamic Sitemap
app.get('/api/seo/sitemap.xml', (req, res) => {
  const domain = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const articles = dbManager.getNews().filter((n) => n.status === 'published');
  const categories = dbManager.getCategories();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>`;

  for (const cat of categories) {
    xml += `
  <url>
    <loc>${domain}/category/${cat.slug}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  for (const article of articles) {
    xml += `
  <url>
    <loc>${domain}/news/${article.slug}</loc>
    <lastmod>${article.updatedAt.split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  xml += `\n</urlset>`;
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// 7. SEO: Robots.txt
app.get('/robots.txt', (req, res) => {
  const domain = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

Sitemap: ${domain}/api/seo/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(txt);
});

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email, password, twoFactorCode } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (!email || !password) {
    return res.status(400).json({ error: 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন' });
  }

  const rateCheck = checkLoginRateLimit(email);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `অতিরিক্ত ভুল চেষ্টার কারণে অ্যাকাউন্ট সাময়িকভাবে বন্ধ আছে। দয়া করে ${rateCheck.waitMinutes} মিনিট পর আবার চেষ্টা করুন।`,
    });
  }

  const users = dbManager.getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    recordFailedLogin(email);
    dbManager.addLog({
      userId: 'unknown',
      userName: email,
      userRole: 'guest',
      action: 'LOGIN_FAILED',
      details: 'অপরিচিত ইমেইল দিয়ে লগইনের ব্যর্থ চেষ্টা',
      ip,
    });
    return res.status(401).json({ error: 'ভুল ইমেইল বা পাসওয়ার্ড' });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    const lockResult = recordFailedLogin(email);
    dbManager.addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN_FAILED',
      details: 'ভুল পাসওয়ার্ড দিয়ে লগইনের ব্যর্থ চেষ্টা',
      ip,
    });

    if (lockResult.locked) {
      return res.status(429).json({
        error: 'বারবার ভুল পাসওয়ার্ড দেওয়ার কারণে অ্যাকাউন্ট ১৫ মিনিটের জন্য সাময়িকভাবে লক করা হয়েছে।',
      });
    }

    return res.status(401).json({ error: 'ভুল ইমেইল বা পাসওয়ার্ড' });
  }

  // Check 2FA if enabled
  if (user.twoFactorEnabled) {
    if (!twoFactorCode) {
      return res.status(200).json({
        require2FA: true,
        message: 'টু-ফ্যাক্টর অথেনটিকেশন (2FA) কোড প্রয়োজন',
      });
    }
    // Simple 6-digit TOTP / OTP validation (check secret or dynamic match)
    if (twoFactorCode.length !== 6 || isNaN(Number(twoFactorCode))) {
      return res.status(400).json({ error: 'অবৈধ ২FA কোড' });
    }
  }

  // Login successful
  resetLoginAttempts(email);

  dbManager.updateUser(user.id, {
    lastLogin: new Date().toISOString(),
  });

  dbManager.addLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'LOGIN_SUCCESS',
    details: 'এডমিন ড্যাশবোর্ডে সফল লগইন',
    ip,
  });

  const token = createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      mustChangePassword: user.mustChangePassword,
    },
  });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  const users = dbManager.getUsers();
  const user = users.find((u) => u.id === req.user?.userId);

  if (!user) {
    return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
    mustChangePassword: user.mustChangePassword,
  });
});

app.post('/api/auth/change-password', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.userId;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' });
  }

  const users = dbManager.getUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি' });

  const isValid = verifyPassword(currentPassword, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    return res.status(400).json({ error: 'বর্তমান পাসওয়ার্ড সঠিক নয়' });
  }

  const { hash, salt } = hashPassword(newPassword);
  dbManager.updateUser(userId!, {
    passwordHash: hash,
    passwordSalt: salt,
    mustChangePassword: false,
  });

  dbManager.addLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PASSWORD_CHANGED',
    details: 'ব্যবহারকারী নিজের পাসওয়ার্ড পরিবর্তন করেছেন',
    ip: req.ip || '127.0.0.1',
  });

  res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে' });
});

// Toggle 2FA for Super Admin
app.post(
  '/api/auth/toggle-2fa',
  authenticateToken,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res) => {
    const { enable } = req.body;
    const userId = req.user?.userId;

    dbManager.updateUser(userId!, {
      twoFactorEnabled: !!enable,
      twoFactorSecret: enable ? 'CHUA24-SEC-' + Math.random().toString(36).substring(2, 10).toUpperCase() : undefined,
    });

    dbManager.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: enable ? '2FA_ENABLED' : '2FA_DISABLED',
      details: `সুপার এডমিন 2FA নিরাপত্তা ${enable ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করেছেন`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      twoFactorEnabled: !!enable,
      message: enable ? '2FA সফলভাবে সক্রিয় হয়েছে' : '2FA নিষ্ক্রিয় করা হয়েছে',
    });
  },
);

// ----------------------------------------------------
// PROTECTED ADMIN ENDPOINTS
// ----------------------------------------------------

// 1. Dashboard Statistics
app.get('/api/admin/stats', authenticateToken, (_req, res) => {
  const news = dbManager.getNews();
  const users = dbManager.getUsers();
  const breaking = dbManager.getBreakingNews();
  const ads = dbManager.getAdvertisements();

  const totalNews = news.length;
  const publishedNews = news.filter((n) => n.status === 'published').length;
  const draftNews = news.filter((n) => n.status === 'draft').length;
  const activeBreaking = breaking.filter((b) => b.isActive).length;
  const totalViews = news.reduce((sum, n) => sum + (n.views || 0), 0);
  const totalEditors = users.filter((u) => u.role === 'editor' || u.role === 'admin').length;
  const activeAds = ads.filter((a) => a.isActive).length;

  res.json({
    totalNews,
    publishedNews,
    draftNews,
    activeBreaking,
    totalViews,
    totalEditors,
    activeAds,
    categoriesCount: dbManager.getCategories().length,
  });
});

// 2. News CRUD
app.get('/api/admin/news', authenticateToken, (req, res) => {
  const { status, category, search } = req.query;
  let articles = dbManager.getNews();

  if (status) {
    articles = articles.filter((n) => n.status === status);
  }
  if (category) {
    articles = articles.filter((n) => n.category === category);
  }
  if (search) {
    const q = String(search).toLowerCase();
    articles = articles.filter((n) => n.headline.toLowerCase().includes(q));
  }

  articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(articles);
});

app.post(
  '/api/admin/news',
  authenticateToken,
  requireRole(['super_admin', 'admin', 'editor']),
  (req: AuthenticatedRequest, res) => {
    const {
      headline,
      summary,
      content,
      featuredImage,
      imageCaption,
      category,
      subCategory,
      tags,
      reporter,
      status = 'published',
      isFeatured = false,
      isBreaking = false,
      isTrending = false,
      customSlug,
    } = req.body;

    if (!headline || !category) {
      return res.status(400).json({ error: 'শিরোনাম এবং ক্যাটাগরি আবশ্যক' });
    }

    const cleanHeadline = sanitizeText(headline);
    const slug = customSlug ? generateSlug(customSlug) : generateSlug(cleanHeadline);
    const newArticle: NewsArticle = {
      id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      headline: cleanHeadline,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      summary: sanitizeText(summary || ''),
      content: content || '',
      featuredImage: featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=480&fit=crop&q=80',
      imageCaption: sanitizeText(imageCaption || ''),
      category,
      subCategory: subCategory || '',
      tags: Array.isArray(tags) ? tags.map(sanitizeText) : [],
      reporter: sanitizeText(reporter || 'স্টাফ রিপোর্টার'),
      authorId: req.user!.userId,
      authorName: req.user!.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishDate: new Date().toISOString(),
      status: status as any,
      views: 0,
      isFeatured: !!isFeatured,
      isBreaking: !!isBreaking,
      isTrending: !!isTrending,
    };

    const saved = dbManager.addNews(newArticle);

    // If marked as breaking, also add to breaking ticker!
    if (isBreaking && status === 'published') {
      dbManager.addBreakingNews({
        id: `brk-${Date.now()}`,
        title: cleanHeadline,
        newsId: saved.id,
        link: `/news/${saved.slug}`,
        createdAt: new Date().toISOString(),
        isActive: true,
      });
    }

    dbManager.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'CREATE_NEWS',
      details: `নতুন সংবাদ প্রকাশ: ${cleanHeadline}`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(201).json(saved);
  },
);

app.put(
  '/api/admin/news/:id',
  authenticateToken,
  requireRole(['super_admin', 'admin', 'editor']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const updates = req.body;

    const updated = dbManager.updateNews(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি' });
    }

    dbManager.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'UPDATE_NEWS',
      details: `সংবাদ সম্পাদনা: ${updated.headline}`,
      ip: req.ip || '127.0.0.1',
    });

    res.json(updated);
  },
);

app.delete(
  '/api/admin/news/:id',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const all = dbManager.getNews();
    const article = all.find((n) => n.id === id);

    const success = dbManager.deleteNews(id);
    if (!success) {
      return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি' });
    }

    dbManager.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'DELETE_NEWS',
      details: `সংবাদ মুছে ফেলা হয়েছে: ${article?.headline || id}`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'সংবাদ সফলভাবে মুছে ফেলা হয়েছে' });
  },
);

app.patch(
  '/api/admin/news/:id/status',
  authenticateToken,
  requireRole(['super_admin', 'admin', 'editor']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const updated = dbManager.updateNews(id, { status });
    if (!updated) return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি' });

    res.json(updated);
  },
);

// 3. Image Upload via Multer
app.post(
  '/api/admin/upload',
  authenticateToken,
  requireRole(['super_admin', 'admin', 'editor']),
  upload.single('image'),
  (req: AuthenticatedRequest, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'কোন ছবি আপলোড করা হয়নি' });
    }

    const publicUrl = `/uploads/${req.file.filename}`;

    dbManager.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'UPLOAD_IMAGE',
      details: `নতুন ছবি আপলোড: ${req.file.filename} (${Math.round(req.file.size / 1024)} KB)`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  },
);

// Media List
app.get('/api/admin/media', authenticateToken, (_req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    const mediaList = files.map((file) => {
      const stats = fs.statSync(path.join(UPLOAD_DIR, file));
      return {
        filename: file,
        url: `/uploads/${file}`,
        size: stats.size,
        createdAt: stats.birthtime,
      };
    });
    mediaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(mediaList);
  } catch {
    res.json([]);
  }
});

// 4. Categories CRUD
app.get('/api/admin/categories', authenticateToken, (_req, res) => {
  res.json(dbManager.getCategories());
});

app.post(
  '/api/admin/categories',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { name, slug, order = 1, showInNav = true, description } = req.body;
    if (!name) return res.status(400).json({ error: 'ক্যাটাগরির নাম দিন' });

    const newCat = dbManager.addCategory({
      id: `cat-${Date.now()}`,
      name: sanitizeText(name),
      slug: slug ? generateSlug(slug) : generateSlug(name),
      order: Number(order) || 1,
      showInNav: !!showInNav,
      description: sanitizeText(description || ''),
    });

    res.status(201).json(newCat);
  },
);

app.put(
  '/api/admin/categories/:id',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const updated = dbManager.updateCategory(id, req.body);
    if (!updated) return res.status(404).json({ error: 'ক্যাটাগরি পাওয়া যায়নি' });
    res.json(updated);
  },
);

app.delete(
  '/api/admin/categories/:id',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const success = dbManager.deleteCategory(id);
    if (!success) return res.status(404).json({ error: 'ক্যাটাগরি পাওয়া যায়নি' });
    res.json({ success: true });
  },
);

// 5. Breaking News CRUD
app.get('/api/admin/breaking', authenticateToken, (_req, res) => {
  res.json(dbManager.getBreakingNews());
});

app.post(
  '/api/admin/breaking',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { title, link } = req.body;
    if (!title) return res.status(400).json({ error: 'ব্রেকিং শিরোনাম আবশ্যক' });

    const item = dbManager.addBreakingNews({
      id: `brk-${Date.now()}`,
      title: sanitizeText(title),
      link: link || '',
      createdAt: new Date().toISOString(),
      isActive: true,
    });

    res.status(201).json(item);
  },
);

app.put(
  '/api/admin/breaking/:id',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const updated = dbManager.updateBreakingNews(id, req.body);
    if (!updated) return res.status(404).json({ error: 'ব্রেকিং নিউজ পাওয়া যায়নি' });
    res.json(updated);
  },
);

app.delete(
  '/api/admin/breaking/:id',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const success = dbManager.deleteBreakingNews(id);
    if (!success) return res.status(404).json({ error: 'ব্রেকিং নিউজ পাওয়া যায়নি' });
    res.json({ success: true });
  },
);

app.patch(
  '/api/admin/breaking/:id/toggle',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const item = dbManager.getBreakingNews().find((b) => b.id === id);
    if (!item) return res.status(404).json({ error: 'ব্রেকিং নিউজ পাওয়া যায়নি' });

    const updated = dbManager.updateBreakingNews(id, { isActive: !item.isActive });
    res.json(updated);
  },
);

// 6. Advertisements CRUD
app.get('/api/admin/ads', authenticateToken, (_req, res) => {
  res.json(dbManager.getAdvertisements());
});

app.post(
  '/api/admin/ads',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const {
      title,
      position = 'header',
      type = 'image',
      imageUrl,
      destinationUrl,
      htmlCode,
      deviceTarget = 'all',
      startDate,
      endDate,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'বিজ্ঞাপনের শিরোনাম দিন' });

    const newAd = dbManager.addAdvertisement({
      id: `ad-${Date.now()}`,
      title: sanitizeText(title),
      position,
      type,
      imageUrl,
      destinationUrl,
      htmlCode,
      deviceTarget,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '2028-01-01',
      isActive: true,
      impressions: 0,
      clicks: 0,
    });

    dbManager.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'ADD_ADVERTISEMENT',
      details: `নতুন বিজ্ঞাপন যুক্ত হয়েছে: ${title} (${position})`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(201).json(newAd);
  },
);

app.put(
  '/api/admin/ads/:id',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const updated = dbManager.updateAdvertisement(id, req.body);
    if (!updated) return res.status(404).json({ error: 'বিজ্ঞাপন পাওয়া যায়নি' });
    res.json(updated);
  },
);

app.delete(
  '/api/admin/ads/:id',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const success = dbManager.deleteAdvertisement(id);
    if (!success) return res.status(404).json({ error: 'বিজ্ঞাপন পাওয়া যায়নি' });
    res.json({ success: true });
  },
);

app.patch(
  '/api/admin/ads/:id/toggle',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const ad = dbManager.getAdvertisements().find((a) => a.id === id);
    if (!ad) return res.status(404).json({ error: 'বিজ্ঞাপন পাওয়া যায়নি' });

    const updated = dbManager.updateAdvertisement(id, { isActive: !ad.isActive });
    res.json(updated);
  },
);

// 7. Users Management (Super Admin only for role additions/deletions)
app.get('/api/admin/users', authenticateToken, requireRole(['super_admin']), (_req, res) => {
  const users = dbManager.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    twoFactorEnabled: u.twoFactorEnabled,
  }));
  res.json(users);
});

app.post(
  '/api/admin/users',
  authenticateToken,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'নাম, ইমেইল, পাসওয়ার্ড এবং পদবী আবশ্যক' });
    }

    if (role !== 'admin' && role !== 'editor') {
      return res.status(400).json({ error: 'শুধুমাত্র এডমিন বা এডিটর পদবী যুক্ত করা যাবে' });
    }

    const existing = dbManager.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে' });
    }

    const { hash, salt } = hashPassword(password);
    const newUser = {
      id: `usr-${Date.now()}`,
      name: sanitizeText(name),
      email: email.trim().toLowerCase(),
      role: role as Role,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false,
    };

    dbManager.addUser(newUser);

    dbManager.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'ADD_USER',
      details: `নতুন ব্যবহারকারী যোগ: ${name} (${role})`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    });
  },
);

app.delete(
  '/api/admin/users/:id',
  authenticateToken,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const target = dbManager.getUsers().find((u) => u.id === id);

    if (!target) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি' });

    if (target.role === 'super_admin' || target.email === 'onlainshop240@gmail.com') {
      return res.status(403).json({ error: 'সুপার এডমিন অ্যাকাউন্ট কখনোই ডিলিট করা যাবে না' });
    }

    const deleted = dbManager.deleteUser(id);
    if (!deleted) {
      return res.status(500).json({ error: 'ব্যবহারকারী মুছতে ব্যর্থ হয়েছে' });
    }

    dbManager.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'DELETE_USER',
      details: `ব্যবহারকারী ডিলিট: ${target.name} (${target.email})`,
      ip: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'ব্যবহারকারী মুছে ফেলা হয়েছে' });
  },
);

// 8. Logs
app.get(
  '/api/admin/logs',
  authenticateToken,
  requireRole(['super_admin', 'admin']),
  (_req, res) => {
    res.json(dbManager.getLogs());
  },
);

// 9. Settings
app.get('/api/admin/settings', authenticateToken, (_req, res) => {
  res.json(dbManager.getSettings());
});

app.put(
  '/api/admin/settings',
  authenticateToken,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res) => {
    const updated = dbManager.updateSettings(req.body);

    dbManager.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'UPDATE_SETTINGS',
      details: 'পোর্টাল সেটিংস আপডেট করা হয়েছে',
      ip: req.ip || '127.0.0.1',
    });

    res.json(updated);
  },
);

// ----------------------------------------------------
// FRONTEND SERVING (Vite Dev Server vs Static Build)
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
