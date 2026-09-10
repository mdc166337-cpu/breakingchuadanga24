import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  NewsArticle,
  Category,
  BreakingNewsItem,
  Advertisement,
  User,
  ActivityLog,
  SiteSettings,
} from '../src/types.js';
import { hashPassword } from './security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  news: NewsArticle[];
  categories: Category[];
  breakingNews: BreakingNewsItem[];
  advertisements: Advertisement[];
  users: (User & { passwordHash: string; passwordSalt: string; twoFactorSecret?: string })[];
  logs: ActivityLog[];
  settings: SiteSettings;
}

// Initial seed data
const initialCategories: Category[] = [
  { id: 'cat-1', name: 'চুয়াডাঙ্গা', slug: 'chuadanga', order: 1, showInNav: true, description: 'চুয়াডাঙ্গা জেলা ও উপজেলার সকল তাজা খবর' },
  { id: 'cat-2', name: 'জাতীয়', slug: 'national', order: 2, showInNav: true, description: 'বাংলাদেশ ও জাতীয় পর্যায়ের সংবাদ' },
  { id: 'cat-3', name: 'রাজনীতি', slug: 'politics', order: 3, showInNav: true, description: 'রাজনীতি ও রাজনৈতিক বিশ্লেষণ' },
  { id: 'cat-4', name: 'অপরাধ', slug: 'crime', order: 4, showInNav: true, description: 'আইন-শৃঙ্খলা ও অপরাধ সংক্রান্ত প্রতিবেদন' },
  { id: 'cat-5', name: 'আন্তর্জাতিক', slug: 'international', order: 5, showInNav: true, description: 'বিশ্ব সংবাদের সর্বশেষ আপডেট' },
  { id: 'cat-6', name: 'খেলাধুলা', slug: 'sports', order: 6, showInNav: true, description: 'ক্রিকেট, ফুটবল ও বিশ্ব ক্রীড়া সংবাদ' },
  { id: 'cat-7', name: 'বিনোদন', slug: 'entertainment', order: 7, showInNav: true, description: 'সিনেমা, নাটক ও সাংস্কৃতিক খবর' },
  { id: 'cat-8', name: 'চাকরি', slug: 'jobs', order: 8, showInNav: true, description: 'সরকারি ও বেসরকারি চাকরির খবর' },
  { id: 'cat-9', name: 'শিক্ষা', slug: 'education', order: 9, showInNav: true, description: 'পরীক্ষা, ফলাফল ও ক্যাম্পাস সংবাদ' },
  { id: 'cat-10', name: 'তথ্যপ্রযুক্তি', slug: 'technology', order: 10, showInNav: true, description: 'বিজ্ঞান, প্রযুক্তি ও ডিজিটাল বিশ্ব' },
  { id: 'cat-11', name: 'স্বাস্থ্য', slug: 'health', order: 11, showInNav: true, description: 'চিকিৎসা বিজ্ঞান ও সুস্থ জীবনধারা' },
  { id: 'cat-12', name: 'কৃষি ও অর্থনীতি', slug: 'economy', order: 12, showInNav: true, description: 'চুয়াডাঙ্গার কৃষি ও জাতীয় অর্থনীতি' },
];

const initialBreakingNews: BreakingNewsItem[] = [
  {
    id: 'brk-1',
    title: 'চুয়াডাঙ্গা-দর্শনা মহাসড়কে যান চলাচল স্বাভাবিক, দুর্ঘটনা এড়াতে ট্রাফিক পুলিশের বিশেষ নির্দেশনা জারি',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'brk-2',
    title: 'আলমডাঙ্গায় কৃষকদের মাঝে উন্নত জাতের ধান ও সবজি বীজ বিতরণ শুরু করল কৃষি বিভাগ',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'brk-3',
    title: 'জাতীয় ক্রিকেট চ্যাম্পিয়নশিপে খুলনার বিপক্ষে লড়বে চুয়াডাঙ্গা জেলা ক্রীড়া দল',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

const initialAds: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'চুয়াডাঙ্গা শপিং প্লাজা উৎসব অফার',
    position: 'header',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=728&h=90&fit=crop&q=80',
    destinationUrl: 'https://breakingchuadanga24.com/offers',
    deviceTarget: 'all',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    isActive: true,
    impressions: 1240,
    clicks: 45,
  },
  {
    id: 'ad-2',
    title: 'ডিজিটাল কম্পিউটার ইনস্টিটিউট চুয়াডাঙ্গা',
    position: 'sidebar',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=250&fit=crop&q=80',
    destinationUrl: 'https://breakingchuadanga24.com/course',
    deviceTarget: 'all',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    isActive: true,
    impressions: 890,
    clicks: 32,
  },
  {
    id: 'ad-3',
    title: 'হোমপেজ মাঝের বিজ্ঞাপন - এগ্রো সিড বাংলাদেশ',
    position: 'home_middle',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=728&h=90&fit=crop&q=80',
    destinationUrl: 'https://breakingchuadanga24.com/agro',
    deviceTarget: 'all',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    isActive: true,
    impressions: 540,
    clicks: 18,
  },
  {
    id: 'ad-4',
    title: 'নিউজ আর্টিকেল পেজ ব্যানার',
    position: 'article_page',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=728&h=90&fit=crop&q=80',
    destinationUrl: 'https://breakingchuadanga24.com/hospital',
    deviceTarget: 'all',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    isActive: true,
    impressions: 430,
    clicks: 21,
  },
];

const initialNews: NewsArticle[] = [
  {
    id: 'news-1',
    headline: 'চুয়াডাঙ্গায় আধুনিক কৃষি পার্ক স্থাপনের ঘোষণা: উপকৃত হবেন হাজারো কৃষক',
    slug: 'chuadanga-modern-agro-park-announcement',
    summary: 'চুয়াডাঙ্গার কৃষি ও কৃষিজাত পণ্য প্রক্রিয়াজাতকরণে নতুন দিগন্ত উন্মোচিত হতে চলেছে। জেলা প্রশাসনের উদ্যোগে আধুনিক কৃষি পার্ক স্থাপনের মহাপরিকল্পনা ঘোষণা করা হয়েছে।',
    content: `<p>চুয়াডাঙ্গার অর্থনৈতিক ভিত্তি মূলত কৃষিনির্ভর। পান, কলা, ভুট্টা ও আমের রাজধানী হিসেবে পরিচিত এই জেলায় এবার আধুনিক কৃষি প্রক্রিয়াজাতকরণ পার্ক নির্মাণের উদ্যোগ নেওয়া হয়েছে।</p><p>জেলা প্রশাসক সম্মেলন কক্ষে আয়োজিত এক বিশেষ সভায় জেলা প্রশাসক এই প্রকল্পের ঘোষণা দেন। তিনি জানান, এই পার্কে আধুনিক কোল্ড স্টোরেজ, মাননিয়ন্ত্রণ ল্যাব এবং কৃষিপণ্য সরাসরি রফতানির সুবিধাদি থাকবে।</p><p>দামুড়হুদা ও জীবননগরের কৃষকরা জানিয়েছেন, প্রতি বছর ফলনের মৌসুমে ন্যায্য মূল্য না পাওয়ার যে আক্ষেপ ছিল, এই পার্ক বাস্তবায়িত হলে সেই সংকট দূর হবে। স্থানীয় ব্যবসায়ী প্রতিনিধিরা প্রকল্পটিকে স্বাগত জানিয়ে দ্রুত কাজ শুরুর আহ্বান জানিয়েছেন।</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&h=480&fit=crop&q=80',
    imageCaption: 'চুয়াডাঙ্গা জেলায় কৃষিজমি ও আধুনিক কৃষি পার্কের নির্ধারিত স্থান পরিদর্শনে স্থানীয় প্রশাসন।',
    category: 'chuadanga',
    subCategory: 'chuadanga-sadar',
    tags: ['চুয়াডাঙ্গা', 'কৃষি', 'উন্নয়ন', 'কৃষক'],
    reporter: 'স্টাফ রিপোর্টার',
    authorId: 'usr-admin',
    authorName: 'নূর আলম',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    publishDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'published',
    views: 842,
    isFeatured: true,
    isBreaking: false,
    isTrending: true,
  },
  {
    id: 'news-2',
    headline: 'আলমডাঙ্গায় নতুন রেলওয়ে ফ্লাইওভারের কাজ দ্রুতগতিতে চলছে, ভোগান্তি কমবে লাখো মানুষের',
    slug: 'alamdanga-railway-flyover-construction-update',
    summary: 'আলমডাঙ্গা শহরের ব্যস্ততম লেভেল ক্রসিংয়ে যানজট নিরসনে নির্মিত ফ্লাইওভারটির কাজ শেষ পর্যায়ে। আগামী তিন মাসের মধ্যে এটি উন্মুক্ত করে দেওয়ার আশা প্রকাশ করেছে রেল কর্তৃপক্ষ।',
    content: `<p>আলমডাঙ্গা পৌর শহরের প্রাণকেন্দ্রে রেল ক্রসিংয়ের কারণে প্রতিদিন চরম ভোগান্তিতে পড়তেন সাধারণ মানুষ ও দূরপাল্লার যাত্রীরা। এই দীর্ঘদিনের সমস্যা স্থায়ী সমাধানের লক্ষ্যে শুরু হয়েছিল ফ্লাইওভার নির্মাণের কাজ।</p><p>প্রকল্প পরিচালক জানান, ইতোমধ্যে শতকরা আশি ভাগ কাজ সমাপ্ত হয়েছে। পাইলিং ও গার্ডার বসানোর কাজ সফলভাবে শেষ করে এখন সড়ক সংযোগের কাজ চলছে।</p><p>স্থানীয় বাসিন্দারা জানান, ফ্লাইওভারটি চালু হলে কুষ্টিয়া, মেহেরপুর ও চুয়াডাঙ্গার মধ্যে নির্বিঘ্নে যোগাযোগ স্থাপন সম্ভব হবে।</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=480&fit=crop&q=80',
    imageCaption: 'আলমডাঙ্গা শহরের লেভেল ক্রসিং এলাকায় নির্মিত ফ্লাইওভারের নির্মাণ কাজ।',
    category: 'chuadanga',
    subCategory: 'alamdanga',
    tags: ['আলমডাঙ্গা', 'ফ্লাইওভার', 'যোগাযোগ', 'চুয়াডাঙ্গা'],
    reporter: 'আলমডাঙ্গা প্রতিনিধি',
    authorId: 'usr-admin',
    authorName: 'নূর আলম',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    publishDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'published',
    views: 615,
    isFeatured: true,
    isBreaking: true,
    isTrending: true,
  },
  {
    id: 'news-3',
    headline: 'দামুড়হুদায় তরুণ উদ্যোক্তাদের তৈরিকৃত ড্রাগন ফ্রুট চাষে অভাবনীয় সাফল্য',
    slug: 'damurhuda-youth-dragon-fruit-success',
    summary: 'দামুড়হুদার একদল শিক্ষিত তরুণ উদ্যোক্তা ড্রাগন ফল চাষ করে এলাকায় ব্যাপক সাড়া ফেলেছেন। প্রতি মৌসুমে লাখ টাকার লাভ অর্জনের পাশাপাশি সৃষ্টি হয়েছে কর্মসংস্থান।',
    content: `<p>চুয়াডাঙ্গার দামুড়হুদা উপজেলার কার্পাসডাঙ্গা ইউনিয়নের তিন তরুণ বন্ধু মিলে শুরু করেছিলেন ড্রাগন ফলের পরীক্ষামূলক বাগান। মাত্র তিন বছরের ব্যবধানে তাদের বাগান এখন জেলার অন্যতম বৃহৎ ড্রাগন বাগান।</p><p>উদ্যোক্তা সাইদুর রহমান বলেন, "আমরা বিশ্ববিদ্যালয় শেষে চাকরির পেছনে না ছুটে মাটিতে কিছু করার প্রত্যয় নিয়েছিলাম। কৃষি কর্মকর্তার পরামর্শে বৈজ্ঞানিক পদ্ধতিতে লাল ও হলুদ জাতের ড্রাগন চাষ শুরু করি।"</p><p>বর্তমানে প্রতিদিন তাদের বাগান থেকে রাজধানী ঢাকা ও আশপাশের জেলাগুলোতে তাজা ড্রাগন ফল সরবরাহ করা হচ্ছে।</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=800&h=480&fit=crop&q=80',
    imageCaption: 'দামুড়হুদায় ড্রাগন ফলের বাগানে যত্ন নিচ্ছেন তরুণ উদ্যোক্তারা।',
    category: 'chuadanga',
    subCategory: 'damurhuda',
    tags: ['দামুড়হুদা', 'ড্রাগন ফল', 'উদ্যোক্তা', 'কৃষি'],
    reporter: 'দামুড়হুদা প্রতিনিধি',
    authorId: 'usr-admin',
    authorName: 'নূর আলম',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    publishDate: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'published',
    views: 489,
    isFeatured: false,
    isBreaking: false,
    isTrending: true,
  },
  {
    id: 'news-4',
    headline: 'দর্শনা স্থলবন্দর দিয়ে আমদানি-রফতানি বাণিজ্যে নতুন রেকর্ড সৃষ্টি',
    slug: 'darshana-land-port-trade-record',
    summary: 'চুয়াডাঙ্গার ঐতিহ্যবাহী দর্শনা স্থলবন্দর দিয়ে চলতি অর্থবছরে রেকর্ড পরিমাণ পণ্য আমদানি ও রফতানি হয়েছে। রাজস্ব আদায়ে এসেছে উল্লেখযোগ্য প্রবৃদ্ধি।',
    content: `<p>বাংলাদেশ-ভারত সীমান্তবর্তী দর্শনা স্থলবন্দর দেশের অন্যতম প্রধান বাণিজ্যিক রুট। চলতি অর্থবছরের প্রথম আট মাসে এই বন্দর দিয়ে চাল, গম, পেঁয়াজ ও কাঁচামাল আমদানি লক্ষ্যমাত্রা ছাড়িয়ে গেছে।</p><p>দর্শনা কাস্টমস সহকারী কমিশনার জানান, বন্দর আধুনিকায়নের ফলে যানজট কমেছে এবং কাগজপত্রের জটিলতা নিরসনে অটোমেশন পদ্ধতি চালু হয়েছে। এতে ব্যবসায়ীরা দ্রুত খালাস সেবা পাচ্ছেন।</p><p>স্থানীয় সিঅ্যান্ডএফ এজেন্ট অ্যাসোসিয়েশন জানিয়েছে, দর্শনা আন্তর্জাতিক রেল যোগাযোগ আরও গতিশীল হলে আমদানি রফতানি আরও কয়েকগুণ বৃদ্ধি পাবে।</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=480&fit=crop&q=80',
    imageCaption: 'দর্শনা স্থলবন্দরে পণ্য খালাসের অপেক্ষায় মালবাহী ট্রাক ও ট্রেন।',
    category: 'economy',
    subCategory: 'chuadanga',
    tags: ['দর্শনা', 'স্থলবন্দর', 'বাণিজ্য', 'রাজস্ব'],
    reporter: 'দর্শনা প্রতিনিধি',
    authorId: 'usr-admin',
    authorName: 'নূর আলম',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    publishDate: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'published',
    views: 520,
    isFeatured: false,
    isBreaking: false,
    isTrending: false,
  },
  {
    id: 'news-5',
    headline: 'আইসিটি খাতের রফতানি আয়ে প্রবৃদ্ধি: ফ্রিল্যান্সারদের জন্য আসছে বিশেষ প্রণোদনা প্যাকেজ',
    slug: 'ict-export-growth-freelancers-incentive',
    summary: 'তথ্যপ্রযুক্তি খাতে দেশের রফতানি আয় বৃদ্ধি পেয়েছে। প্রত্যন্ত অঞ্চলের তরুণদের আইসিটি দক্ষতা বৃদ্ধি ও ফ্রিল্যান্সারদের সুবিধার্থে নতুন প্রণোদনা কর্মসূচি চালু করা হচ্ছে।',
    content: `<p>বাংলাদেশ অ্যাসোসিয়েশন অব সফটওয়্যার অ্যান্ড ইনফরমেশন সার্ভিসেস (বেসিস) ও তথ্য ও যোগাযোগ প্রযুক্তি বিভাগের যৌথ উদ্যোগে ফ্রিল্যান্সারদের জন্য বিশেষ কার্ড ও নগদ প্রণোদনা প্রদানের ঘোষণা দেওয়া হয়েছে।</p><p>চুয়াডাঙ্গার বিভিন্ন উপজেলায় বর্তমানে সহস্রাধিক তরুণ ফ্রিল্যান্সিং পেশার সাথে যুক্ত থেকে বৈদেশিক মুদ্রা অর্জন করছেন। এই নতুন নীতিমালার ফলে তারা সহজে আন্তর্জাতিক ব্যাংক হিসাব ও লোন সুবিধা পাবেন।</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=480&fit=crop&q=80',
    imageCaption: 'প্রযুক্তি প্রশিক্ষণ কেন্দ্রে কোডিং ও ডিজিটাল মার্কেটিং শিখছেন তরুণ-তরুণীরা।',
    category: 'technology',
    tags: ['তথ্যপ্রযুক্তি', 'ফ্রিল্যান্সিং', 'ডিজিটাল', 'কর্মসংস্থান'],
    reporter: 'আইটি ডেস্ক',
    authorId: 'usr-admin',
    authorName: 'নূর আলম',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    publishDate: new Date(Date.now() - 3600000 * 14).toISOString(),
    status: 'published',
    views: 710,
    isFeatured: true,
    isBreaking: false,
    isTrending: true,
  },
  {
    id: 'news-6',
    headline: 'বিশ্বকাপ বাছাইপর্বে বাংলাদেশ ফুটবল দলের অবিস্মরণীয় জয়',
    slug: 'bangladesh-football-team-historic-win',
    summary: 'নাটকীয় ম্যাচে অতিরিক্ত সময়ের গোলে প্রতিপক্ষকে হারিয়ে পরবর্তী রাউন্ডে জায়গা করে নিল বাংলাদেশ জাতীয় ফুটবল দল। সারাদেশে ফুটবলপ্রেমীদের মাঝে বাঁধভাঙা উল্লাস।',
    content: `<p>নির্ধারিত ৯০ মিনিটে খেলা ছিল ১-১ সমতায়। কিন্তু যোগ করা সময়ের চতুর্থ মিনিটে দুর্দান্ত হেডারে লক্ষ্যভেদ করে দলকে আনন্দে ভাসান তরুণ স্ট্রাইকার।</p><p>চুয়াডাঙ্গা জেলা স্টেডিয়ামে বড় পর্দায় খেলা উপভোগ করেন শত শত ফুটবল অনুরাগী। জয়ের পর শহরে মিষ্টি বিতরণ ও বিজয় মিছিল বের করেন সমর্থকরা।</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=480&fit=crop&q=80',
    imageCaption: 'ম্যাচ শেষে জয়ের উল্লাসে মেতে ওঠেন জাতীয় দলের খেলোয়াড়রা।',
    category: 'sports',
    tags: ['খেলাধুলা', 'ফুটবল', 'বাংলাদেশ', 'বিশ্বকাপ'],
    reporter: 'ক্রীড়া প্রতিবেদক',
    authorId: 'usr-admin',
    authorName: 'নূর আলম',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    publishDate: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'published',
    views: 980,
    isFeatured: false,
    isBreaking: false,
    isTrending: true,
  },
  {
    id: 'news-7',
    headline: 'চুয়াডাঙ্গা সদর হাসপাতালে অত্যাধুনিক ডায়ালাইসিস ও আইসিইউ ইউনিটের উদ্বোধন',
    slug: 'chuadanga-hospital-icu-dialysis-unit-inauguration',
    summary: 'চুয়াডাঙ্গাবাসীর দীর্ঘ প্রতীক্ষিত আধুনিক চিকিৎসা সুবিধার স্বপ্ন পূরণ হলো। ১০০ শয্যার চুয়াডাঙ্গা সদর হাসপাতালে আনুষ্ঠানিকভাবে চালু হলো নতুন আইসিইউ ও কিডনি ডায়ালাইসিস সেন্টার।',
    content: `<p>এখন থেকে জটিল কিডনি রোগী এবং মুমূর্ষু রোগীদের জরুরি চিকিৎসার জন্য আর ঢাকা বা রাজশাহীতে ছুটতে হবে না। নামমাত্র মূল্যে রোগীরা সদর হাসপাতালে এই সেবা গ্রহণ করতে পারবেন।</p><p>সিভিল সার্জন জানান, সার্বক্ষণিক বিশেষজ্ঞ চিকিৎসক এবং প্রশিক্ষিত নার্সদের মাধ্যমে ইউনিটটি ২৪ ঘণ্টা পরিচালিত হবে।</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=480&fit=crop&q=80',
    imageCaption: 'চুয়াডাঙ্গা সদর হাসপাতালের নবনির্মিত নিবিড় পরিচর্যা কেন্দ্র (আইসিইউ)।',
    category: 'health',
    subCategory: 'chuadanga-sadar',
    tags: ['স্বাস্থ্য', 'চুয়াডাঙ্গা হাসপাতাল', 'চিকিৎসা', 'আইসিইউ'],
    reporter: 'স্টাফ রিপোর্টার',
    authorId: 'usr-admin',
    authorName: 'নূর আলম',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    publishDate: new Date(Date.now() - 3600000 * 20).toISOString(),
    status: 'published',
    views: 890,
    isFeatured: true,
    isBreaking: false,
    isTrending: false,
  },
  {
    id: 'news-8',
    headline: 'জাতীয় মেধা অন্বেষণে চুয়াডাঙ্গার শিক্ষার্থীদের অনন্য গৌরব',
    slug: 'chuadanga-students-national-merit-award',
    summary: 'বিজ্ঞান ও সৃজনশীল মেধা অন্বেষণ প্রতিযোগিতায় জাতীয় পর্যায়ে প্রথম ও দ্বিতীয় স্থান অর্জন করেছে চুয়াডাঙ্গা সরকারি কলেজ ও ভি.জে সরকারি উচ্চ বিদ্যালয়ের দুই কৃতি শিক্ষার্থী।',
    content: `<p>রাজধানীর আন্তর্জাতিক মাতৃভাষা ইনস্টিটিউট মিলনায়তনে শিক্ষামন্ত্রী প্রধান অতিথি হিসেবে উপস্থিত থেকে বিজয়ী শিক্ষার্থীদের হাতে সম্মাননা ক্রেস্ট ও বৃত্তির চেক তুলে দেন।</p><p>তাদের এই অসামান্য অর্জনে জেলা জুড়ে শিক্ষক, অভিভাবক ও সুধীমহলে আনন্দের বন্যা বইছে। বিদ্যালয়ের পক্ষ থেকে শিগগিরই বিশেষ সংবর্ধনার আয়োজন করা হবে।</p>`,
    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=480&fit=crop&q=80',
    imageCaption: 'জাতীয় মঞ্চে পদক হাতে উচ্ছ্বসিত বিজয়ী শিক্ষার্থীরা।',
    category: 'education',
    subCategory: 'chuadanga',
    tags: ['শিক্ষা', 'চুয়াডাঙ্গা', 'মেধা অন্বেষণ', 'পুরস্কার'],
    reporter: 'শিক্ষা প্রতিনিধি',
    authorId: 'usr-admin',
    authorName: 'নূর আলম',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    publishDate: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'published',
    views: 435,
    isFeatured: false,
    isBreaking: false,
    isTrending: false,
  },
];

const initialSettings: SiteSettings = {
  siteName: 'Breaking Chuadanga 24',
  siteNameBangla: 'ব্রেকিং চুয়াডাঙ্গা ২৪',
  tagline: 'চুয়াডাঙ্গার খবর, সবার আগে',
  editorName: 'নূর আলম',
  contactEmail: 'onlainshop240@gmail.com',
  contactPhone: '+880 1712-345678',
  officeAddress: 'শহীদ আবুল কাশেম সড়ক, চুয়াডাঙ্গা সদর, চুয়াডাঙ্গা-৭২০০, বাংলাদেশ',
  facebookUrl: 'https://facebook.com/breakingchuadanga24',
  youtubeUrl: 'https://youtube.com/@breakingchuadanga24',
  breakingNewsEnabled: true,
  tickerSpeed: 6,
  allowComments: true,
};

class DatabaseManager {
  private db: DatabaseSchema | null = null;
  private isWriting = false;
  private writeQueue: (() => void)[] = [];

  constructor() {
    this.ensureDirectoryExists();
    this.loadDatabase();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
      } else {
        this.initializeFreshDatabase();
      }
    } catch (err) {
      console.error('Error loading database, reinitializing with defaults', err);
      this.initializeFreshDatabase();
    }
  }

  private initializeFreshDatabase() {
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@Chuadanga24#';
    const { hash, salt } = hashPassword(adminPassword);

    const superAdminUser = {
      id: 'usr-admin',
      name: 'Nur Alam',
      email: 'onlainshop240@gmail.com',
      role: 'super_admin' as const,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false,
      mustChangePassword: true,
    };

    const initialLogs: ActivityLog[] = [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        userId: 'usr-admin',
        userName: 'Nur Alam',
        userRole: 'super_admin',
        action: 'SYSTEM_INITIALIZED',
        details: 'ব্রেকিং চুয়াডাঙ্গা ২৪ পোর্টাল ডাটাবেজ সফলভাবে ইনস্টল করা হয়েছে।',
        ip: '127.0.0.1',
      },
    ];

    this.db = {
      news: initialNews,
      categories: initialCategories,
      breakingNews: initialBreakingNews,
      advertisements: initialAds,
      users: [superAdminUser],
      logs: initialLogs,
      settings: initialSettings,
    };

    this.persistSync();
  }

  private persistSync() {
    if (!this.db) return;
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database atomically:', err);
    }
  }

  public save() {
    this.persistSync();
  }

  // Getters
  public getNews(): NewsArticle[] {
    return this.db?.news || [];
  }

  public getCategories(): Category[] {
    return this.db?.categories || [];
  }

  public getBreakingNews(): BreakingNewsItem[] {
    return this.db?.breakingNews || [];
  }

  public getAdvertisements(): Advertisement[] {
    return this.db?.advertisements || [];
  }

  public getUsers() {
    return this.db?.users || [];
  }

  public getLogs(): ActivityLog[] {
    return this.db?.logs || [];
  }

  public getSettings(): SiteSettings {
    return this.db?.settings || initialSettings;
  }

  // News Actions
  public addNews(article: NewsArticle): NewsArticle {
    if (!this.db) return article;
    this.db.news.unshift(article);
    this.save();
    return article;
  }

  public updateNews(id: string, updates: Partial<NewsArticle>): NewsArticle | null {
    if (!this.db) return null;
    const index = this.db.news.findIndex((n) => n.id === id);
    if (index === -1) return null;
    this.db.news[index] = { ...this.db.news[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.news[index];
  }

  public deleteNews(id: string): boolean {
    if (!this.db) return false;
    const initialLen = this.db.news.length;
    this.db.news = this.db.news.filter((n) => n.id !== id);
    if (this.db.news.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public incrementNewsViews(idOrSlug: string): void {
    if (!this.db) return;
    const article = this.db.news.find((n) => n.id === idOrSlug || n.slug === idOrSlug);
    if (article) {
      article.views = (article.views || 0) + 1;
      this.save();
    }
  }

  // Categories Actions
  public addCategory(category: Category): Category {
    if (!this.db) return category;
    this.db.categories.push(category);
    this.save();
    return category;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    if (!this.db) return null;
    const index = this.db.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.db.categories[index] = { ...this.db.categories[index], ...updates };
    this.save();
    return this.db.categories[index];
  }

  public deleteCategory(id: string): boolean {
    if (!this.db) return false;
    this.db.categories = this.db.categories.filter((c) => c.id !== id);
    this.save();
    return true;
  }

  // Breaking News
  public addBreakingNews(item: BreakingNewsItem): BreakingNewsItem {
    if (!this.db) return item;
    this.db.breakingNews.unshift(item);
    this.save();
    return item;
  }

  public updateBreakingNews(id: string, updates: Partial<BreakingNewsItem>): BreakingNewsItem | null {
    if (!this.db) return null;
    const index = this.db.breakingNews.findIndex((b) => b.id === id);
    if (index === -1) return null;
    this.db.breakingNews[index] = { ...this.db.breakingNews[index], ...updates };
    this.save();
    return this.db.breakingNews[index];
  }

  public deleteBreakingNews(id: string): boolean {
    if (!this.db) return false;
    this.db.breakingNews = this.db.breakingNews.filter((b) => b.id !== id);
    this.save();
    return true;
  }

  // Advertisements
  public addAdvertisement(ad: Advertisement): Advertisement {
    if (!this.db) return ad;
    this.db.advertisements.push(ad);
    this.save();
    return ad;
  }

  public updateAdvertisement(id: string, updates: Partial<Advertisement>): Advertisement | null {
    if (!this.db) return null;
    const index = this.db.advertisements.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.db.advertisements[index] = { ...this.db.advertisements[index], ...updates };
    this.save();
    return this.db.advertisements[index];
  }

  public deleteAdvertisement(id: string): boolean {
    if (!this.db) return false;
    this.db.advertisements = this.db.advertisements.filter((a) => a.id !== id);
    this.save();
    return true;
  }

  public recordAdClick(id: string): void {
    if (!this.db) return;
    const ad = this.db.advertisements.find((a) => a.id === id);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      this.save();
    }
  }

  public recordAdImpression(id: string): void {
    if (!this.db) return;
    const ad = this.db.advertisements.find((a) => a.id === id);
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      this.save();
    }
  }

  // Users & Roles
  public addUser(user: DatabaseSchema['users'][0]) {
    if (!this.db) return;
    this.db.users.push(user);
    this.save();
  }

  public updateUser(id: string, updates: Partial<DatabaseSchema['users'][0]>) {
    if (!this.db) return null;
    const index = this.db.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.db.users[index] = { ...this.db.users[index], ...updates };
    this.save();
    return this.db.users[index];
  }

  public deleteUser(id: string): boolean {
    if (!this.db) return false;
    const target = this.db.users.find((u) => u.id === id);
    // Super admin can NEVER be deleted!
    if (target?.role === 'super_admin' || target?.email === 'onlainshop240@gmail.com') {
      return false;
    }
    this.db.users = this.db.users.filter((u) => u.id !== id);
    this.save();
    return true;
  }

  // Logs
  public addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    if (!this.db) return;
    const fullLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.db.logs.unshift(fullLog);
    // Keep max 200 logs
    if (this.db.logs.length > 200) {
      this.db.logs = this.db.logs.slice(0, 200);
    }
    this.save();
  }

  // Settings
  public updateSettings(settings: Partial<SiteSettings>): SiteSettings {
    if (!this.db) return initialSettings;
    this.db.settings = { ...this.db.settings, ...settings };
    this.save();
    return this.db.settings;
  }
}

export const dbManager = new DatabaseManager();
