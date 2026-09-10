import React, { useState } from 'react';
import {
  Search,
  Shield,
  Facebook,
  Youtube,
  CloudSun,
  Menu,
  X,
  Phone,
  Radio,
  Bookmark,
} from 'lucide-react';
import { getBengaliDate, getBengaliCalendarString } from '../utils/dateUtils';
import { Advertisement, Category } from '../types';
import { AdBanner } from './AdBanner';

interface HeaderProps {
  categories: Category[];
  advertisements: Advertisement[];
  onSelectCategory: (categorySlug: string) => void;
  onOpenSearch: () => void;
  onNavigateHome: () => void;
  onOpenAdmin: () => void;
  onOpenPage: (pageSlug: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  advertisements,
  onSelectCategory,
  onOpenSearch,
  onNavigateHome,
  onOpenAdmin,
  onOpenPage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bengaliDate = getBengaliDate();
  const bengaliCalendar = getBengaliCalendarString();

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      {/* 1. Top Utility Bar */}
      <div className="bg-gray-900 text-gray-200 text-xs py-1.5 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date, Hijri/Bengali date & Weather */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-medium text-gray-100">{bengaliDate}</span>
            <span className="text-gray-500 hidden sm:inline">|</span>
            <span className="text-emerald-400 font-medium hidden md:inline">{bengaliCalendar}</span>
            <span className="text-gray-500 hidden md:inline">|</span>
            <div className="hidden lg:flex items-center gap-1.5 text-amber-300">
              <CloudSun className="w-3.5 h-3.5" />
              <span>চুয়াডাঙ্গা: ৩১° সে. (পরিষ্কার আকাশ)</span>
            </div>
          </div>

          {/* Right: Live Radio/Update, Socials, Admin link */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1 text-red-400 font-medium animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লাইভ আপডেট</span>
            </div>

            <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              id="header-admin-login-btn"
              onClick={onOpenAdmin}
              className="flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Shield className="w-3 h-3" />
              <span>এডমিন প্যানেল</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Brand Banner & Advertisement Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div
          onClick={onNavigateHome}
          className="cursor-pointer flex items-center gap-3 text-center md:text-left select-none group"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex flex-col items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <span className="text-[10px] uppercase font-bold tracking-tighter leading-none">Breaking</span>
            <span className="text-xl sm:text-2xl font-black leading-tight tracking-tight">২৪</span>
          </div>

          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-red-600 tracking-tight font-serif">
                ব্রেকিং চুয়াডাঙ্গা ২৪
              </h1>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 tracking-wide mt-0.5">
              “চুয়াডাঙ্গার খবর, সবার আগে”
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-sans font-bold">
              BREAKING CHUADANGA 24 • DIGITAL NEWS PORTAL
            </p>
          </div>
        </div>

        {/* Header Advertisement */}
        <div className="hidden lg:block w-full max-w-[580px]">
          <AdBanner position="header" advertisements={advertisements} />
        </div>

        {/* Mobile menu and search toggle */}
        <div className="flex items-center gap-2 md:hidden w-full justify-between pt-2 border-t border-gray-100">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-gray-800 text-sm font-medium"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>মেন্যু</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-200"
          >
            <Search className="w-4 h-4" />
            <span>অনুসন্ধান</span>
          </button>
        </div>
      </div>

      {/* 3. Main Navigation Bar */}
      <nav className="bg-red-700 text-white border-t border-red-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-1 overflow-x-auto scrollbar-none py-1 text-sm font-semibold">
            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 rounded hover:bg-red-800 transition-colors whitespace-nowrap"
            >
              প্রচ্ছদ
            </button>

            {categories
              .filter((c) => c.showInNav)
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className="px-3 py-1.5 rounded hover:bg-red-800 transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </button>
              ))}

            {/* Sub-regions dropdown button for Chuadanga */}
            <div className="relative group">
              <button
                onClick={() => onSelectCategory('chuadanga')}
                className="px-3 py-1.5 rounded hover:bg-red-800 transition-colors flex items-center gap-1 whitespace-nowrap bg-red-800/60"
              >
                <span>উপজেলা সমূহ</span>
                <span className="text-xs">▼</span>
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white text-gray-800 py-1.5 px-1 shadow-lg rounded-md border border-gray-200 min-w-[150px] z-50">
                <button
                  onClick={() => onSelectCategory('chuadanga')}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-red-700 rounded font-medium"
                >
                  চুয়াডাঙ্গা সদর
                </button>
                <button
                  onClick={() => onSelectCategory('chuadanga')}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-red-700 rounded font-medium"
                >
                  আলমডাঙ্গা
                </button>
                <button
                  onClick={() => onSelectCategory('chuadanga')}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-red-700 rounded font-medium"
                >
                  দামুড়হুদা
                </button>
                <button
                  onClick={() => onSelectCategory('chuadanga')}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-red-700 rounded font-medium"
                >
                  জীবননগর
                </button>
                <button
                  onClick={() => onSelectCategory('chuadanga')}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-red-700 rounded font-medium"
                >
                  দর্শনা
                </button>
              </div>
            </div>
          </div>

          {/* Right quick search icon */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="p-1.5 rounded hover:bg-red-800 transition-colors text-white cursor-pointer"
              title="সংবাদ অনুসন্ধান করুন"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-300 shadow-xl px-4 py-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 pb-4 border-b border-gray-200">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="p-2 text-left bg-gray-50 hover:bg-red-50 rounded text-sm font-semibold text-gray-800 hover:text-red-700"
            >
              প্রচ্ছদ
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-left bg-gray-50 hover:bg-red-50 rounded text-sm font-semibold text-gray-800 hover:text-red-700"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-3 flex flex-col gap-2">
            <div className="text-xs font-bold text-gray-600 uppercase">চুয়াডাঙ্গার উপজেলা সমূহ:</div>
            <div className="flex flex-wrap gap-1.5">
              {['চুয়াডাঙ্গা সদর', 'আলমডাঙ্গা', 'দামুড়হুদা', 'জীবননগর', 'দর্শনা'].map((upazila) => (
                <button
                  key={upazila}
                  onClick={() => {
                    onSelectCategory('chuadanga');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded border border-red-200 font-medium"
                >
                  {upazila}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-2 pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenPage('about');
                  setMobileMenuOpen(false);
                }}
                className="text-sm text-left text-gray-600 hover:text-red-700 py-1"
              >
                আমাদের সম্পর্কে
              </button>
              <button
                onClick={() => {
                  onOpenPage('contact');
                  setMobileMenuOpen(false);
                }}
                className="text-sm text-left text-gray-600 hover:text-red-700 py-1"
              >
                যোগাযোগ
              </button>
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-sm text-left font-bold text-red-700 flex items-center gap-1 py-1"
              >
                <Shield className="w-4 h-4" />
                এডমিন প্যানেলে প্রবেশ
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
