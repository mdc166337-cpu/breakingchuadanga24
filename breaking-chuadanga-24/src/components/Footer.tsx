import React from 'react';
import { Facebook, Youtube, Mail, Phone, MapPin, Shield, Heart } from 'lucide-react';
import { Category, SiteSettings } from '../types';

interface FooterProps {
  categories: Category[];
  settings: SiteSettings;
  onSelectCategory: (categorySlug: string) => void;
  onOpenPage: (pageSlug: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  settings,
  onSelectCategory,
  onOpenPage,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t-4 border-red-700">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
          {/* Col 1: Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xl">
                ২৪
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-serif tracking-tight">
                  {settings.siteNameBangla || 'ব্রেকিং চুয়াডাঙ্গা ২৪'}
                </h3>
                <p className="text-xs text-red-400 font-medium">
                  {settings.tagline || 'চুয়াডাঙ্গার খবর, সবার আগে'}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              চুয়াডাঙ্গা জেলা ও উপজেলার সর্বশেষ নির্ভরযোগ্য ও বস্তুনিষ্ঠ সংবাদ ২৪ ঘণ্টা আপনার হাতের মুঠোয়। সত্য, নির্ভীক ও নিরপেক্ষ সাংবাদিকতায় আমরা প্রতিজ্ঞাবদ্ধ।
            </p>

            <div className="text-xs text-gray-300 space-y-1 bg-gray-800/80 p-3 rounded-lg border border-gray-700/60">
              <p>
                <span className="text-gray-400">সম্পাদক ও প্রকাশক:</span>{' '}
                <strong className="text-white">{settings.editorName || 'নূর আলম'}</strong>
              </p>
              <p className="text-[11px] text-gray-400">ব্রেকিং চুয়াডাঙ্গা ২৪ মিডিয়া নেটওয়ার্ক</p>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              সংবাদ বিভাগ
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {categories.slice(0, 10).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className="text-left text-gray-400 hover:text-white transition-colors py-0.5 truncate"
                >
                  • {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Chuadanga Upazilas & Important Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              চুয়াডাঙ্গা পরিক্রমা
            </h4>
            <ul className="text-xs text-gray-400 space-y-2">
              <li>
                <button
                  onClick={() => onSelectCategory('chuadanga')}
                  className="hover:text-white transition-colors"
                >
                  • চুয়াডাঙ্গা সদর উপজেলা
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('chuadanga')}
                  className="hover:text-white transition-colors"
                >
                  • আলমডাঙ্গা উপজেলা
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('chuadanga')}
                  className="hover:text-white transition-colors"
                >
                  • দামুড়হুদা উপজেলা
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('chuadanga')}
                  className="hover:text-white transition-colors"
                >
                  • জীবননগর উপজেলা
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('chuadanga')}
                  className="hover:text-white transition-colors"
                >
                  • দর্শনা পৌরসভা ও স্থলবন্দর
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Socials */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              যোগাযোগের ঠিকানা
            </h4>
            <div className="text-xs text-gray-400 space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{settings.officeAddress || 'চুয়াডাঙ্গা সদর, চুয়াডাঙ্গা-৭২০০, বাংলাদেশ'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>{settings.contactPhone || '+880 1712-345678'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>{settings.contactEmail || 'onlainshop240@gmail.com'}</span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={settings.facebookUrl || 'https://facebook.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook Page"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={settings.youtubeUrl || 'https://youtube.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                  aria-label="YouTube Channel"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <button
                  onClick={onOpenAdmin}
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                  title="এডমিন লগইন"
                >
                  <Shield className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Links & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onOpenPage('about')}
              className="hover:text-gray-300 transition-colors"
            >
              আমাদের সম্পর্কে
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenPage('contact')}
              className="hover:text-gray-300 transition-colors"
            >
              যোগাযোগ
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenPage('privacy')}
              className="hover:text-gray-300 transition-colors"
            >
              গোপনীয়তা নীতি
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenPage('terms')}
              className="hover:text-gray-300 transition-colors"
            >
              শর্তাবলী
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenPage('disclaimer')}
              className="hover:text-gray-300 transition-colors"
            >
              দাবিত্যাগ
            </button>
          </div>

          <div className="text-center sm:text-right">
            <p>© {new Date().getFullYear()} ব্রেকিং চুয়াডাঙ্গা ২৪। সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
