import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Smartphone,
} from 'lucide-react';
import { SiteSettings, User } from '../../types';
import { api } from '../../utils/api';

interface AdminSettingsProps {
  currentUser: User;
  onUserUpdate: (updatedUser: User) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser, onUserUpdate }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser.twoFactorEnabled || false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.getAdminSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSavingSettings(true);
    setSettingsMsg(null);
    try {
      const updated = await api.updateAdminSettings(settings);
      setSettings(updated);
      setSettingsMsg('পোর্টাল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setSettingsMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।' });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' });
      return;
    }

    setPwLoading(true);
    setPwMsg(null);
    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
      });
      setPwMsg({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setTwoFactorLoading(true);
    try {
      const res = await api.toggle2FA(!twoFactorEnabled);
      setTwoFactorEnabled(res.twoFactorEnabled);
      onUserUpdate({ ...currentUser, twoFactorEnabled: res.twoFactorEnabled });
    } catch (err) {
      console.error(err);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-gray-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600 mb-2" />
        <p className="text-xs">সেটিংস লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-600" />
            <span>পোর্টাল সেটিংস ও নিরাপত্তা (Portal Settings & Security)</span>
          </h2>
          <p className="text-xs text-gray-500">
            সাইটের সাধারণ তথ্য, যোগাযোগ, সোশ্যাল মিডিয়া ও অ্যাডমিন পাসওয়ার্ড পরিবর্তন করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Site Info & Contact Settings */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6">
          <h3 className="text-sm font-bold text-gray-900 font-serif mb-4 pb-2 border-b border-gray-100">
            ওয়েবসাইট কনফিগারেশন
          </h3>

          {settingsMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{settingsMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ওয়েবসাইট নাম (বাংলা)</label>
                <input
                  type="text"
                  value={settings.siteNameBangla}
                  onChange={(e) => setSettings({ ...settings, siteNameBangla: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden font-serif font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ওয়েবসাইট নাম (English)</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ট্যাগলাইন (Slogan)</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সম্পাদক ও প্রকাশক নাম</label>
                <input
                  type="text"
                  value={settings.editorName}
                  onChange={(e) => setSettings({ ...settings, editorName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">যোগাযোগ ফোন / হটলাইন</label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">যোগাযোগ ইমেইল</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">কার্যালয়ের ঠিকানা</label>
              <input
                type="text"
                value={settings.officeAddress}
                onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ফেসবুক পেজ লিংক</label>
                <input
                  type="url"
                  value={settings.facebookUrl}
                  onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ইউটিউব চ্যানেল লিংক</label>
                <input
                  type="url"
                  value={settings.youtubeUrl}
                  onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingSettings ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>সেটিংস সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 cols: Password & 2FA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Password Change Form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6">
            <h3 className="text-sm font-bold text-gray-900 font-serif mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600" />
              <span>পাসওয়ার্ড পরিবর্তন (Change Password)</span>
            </h3>

            {pwMsg && (
              <div
                className={`mb-4 p-3 text-xs rounded-xl flex items-center gap-2 ${
                  pwMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {pwMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{pwMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">বর্তমান পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">নতুন গোপনীয় পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="কমপক্ষে ৮ অক্ষর"
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">পাসওয়ার্ড নিশ্চিত করুন *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full mt-2 bg-gray-900 hover:bg-black text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {pwLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <KeyRound className="w-3.5 h-3.5" />
                )}
                <span>নতুন পাসওয়ার্ড সেট করুন</span>
              </button>
            </form>
          </div>

          {/* 2FA Security Module */}
          <div className="bg-gradient-to-br from-gray-900 to-red-950 text-white rounded-2xl p-5 sm:p-6 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-sm font-serif">টু-ফ্যাক্টর অথেনটিকেশন (2FA)</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              আপনার একাউন্ট আরও সুরক্ষিত রাখতে অতিরিক্ত ভেরিফিকেশন কোড সিস্টেম সক্রিয় করুন।
            </p>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">স্ট্যাটাস</span>
                <span
                  className={`text-[11px] font-semibold ${
                    twoFactorEnabled ? 'text-emerald-400' : 'text-amber-300'
                  }`}
                >
                  {twoFactorEnabled ? 'সুরক্ষিত (সক্রিয়)' : 'নিষ্ক্রিয়'}
                </span>
              </div>

              <button
                type="button"
                disabled={twoFactorLoading}
                onClick={handleToggle2FA}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  twoFactorEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {twoFactorLoading ? 'অপেক্ষা করুন...' : twoFactorEnabled ? 'বন্ধ করুন' : 'চালু করুন'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
