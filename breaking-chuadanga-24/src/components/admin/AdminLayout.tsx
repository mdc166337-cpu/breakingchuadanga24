import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Newspaper,
  Zap,
  FolderTree,
  Image as ImageIcon,
  Users,
  HardDrive,
  ShieldAlert,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { User } from '../../types';

interface AdminLayoutProps {
  currentUser: User;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onViewWebsite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  currentTab,
  onTabChange,
  onLogout,
  onViewWebsite,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'add-news', label: 'নতুন সংবাদ তৈরি', icon: PlusCircle, badge: 'Add' },
    { id: 'all-news', label: 'সকল সংবাদ তালিকা', icon: Newspaper },
    { id: 'breaking-news', label: 'ব্রেকিং নিউজ', icon: Zap },
    { id: 'categories', label: 'ক্যাটাগরি বিভাগ', icon: FolderTree },
    { id: 'advertisements', label: 'বিজ্ঞাপন ব্যবস্থাপনা', icon: ImageIcon },
    { id: 'users', label: 'ব্যবহারকারী ও পদবী', icon: Users, superAdminOnly: true },
    { id: 'media', label: 'মিডিয়া লাইব্রেরি', icon: HardDrive },
    { id: 'security-logs', label: 'নিরাপত্তা লগ', icon: ShieldAlert },
    { id: 'settings', label: 'পোর্টাল সেটিংস ও ২FA', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    onTabChange(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* 1. Top Admin Bar */}
      <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white text-base">
                ২৪
              </div>
              <div>
                <h1 className="text-base font-bold text-white font-serif leading-none">
                  ব্রেকিং চুয়াডাঙ্গা ২৪
                </h1>
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                  Admin Control Panel
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onViewWebsite}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">মূল ওয়েবসাইট দেখুন</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-800">
              <div className="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                <span className="text-[10px] text-red-400 uppercase font-semibold">
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Body with Sidebar */}
      <div className="flex-1 flex max-w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 space-y-1 shrink-0">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
            প্রধান মেন্যু
          </div>

          {navItems.map((item) => {
            if (item.superAdminOnly && currentUser.role !== 'super_admin') return null;
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      active ? 'bg-white text-red-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
              <span className="font-bold text-gray-800 block">সুপার এডমিন:</span>
              <span className="text-[11px] text-gray-500 block truncate">
                onlainshop240@gmail.com
              </span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                ● সিস্টেম অনলাইন ও সুরক্ষিত
              </span>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl">
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <span className="font-bold text-sm text-gray-900 font-serif">এডমিন মেন্যু</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {navItems.map((item) => {
                  if (item.superAdminOnly && currentUser.role !== 'super_admin') return null;
                  const Icon = item.icon;
                  const active = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-red-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 p-2.5 rounded-xl text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট করুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
