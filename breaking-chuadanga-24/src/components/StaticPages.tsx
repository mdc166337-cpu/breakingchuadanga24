import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, FileText, ArrowLeft } from 'lucide-react';
import { SiteSettings } from '../types';

interface StaticPagesProps {
  page: 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer';
  settings: SiteSettings;
  onBack: () => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, settings, onBack }) => {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>প্রচ্ছদে ফিরে যান</span>
      </button>

      {/* 1. About Page */}
      {page === 'about' && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
              আমাদের সম্পর্কে — ব্রেকিং চুয়াডাঙ্গা ২৪
            </h1>
            <p className="text-sm text-red-600 font-semibold mt-1">চুয়াডাঙ্গার খবর, সবার আগে</p>
          </div>

          <p className="text-gray-700 text-base leading-relaxed">
            <strong>ব্রেকিং চুয়াডাঙ্গা ২৪</strong> চুয়াডাঙ্গা জেলার সর্বাধিক জনপ্রিয়, আধুনিক ও পেশাদার ডিজিটাল সংবাদমাধ্যম। চুয়াডাঙ্গা সদর, আলমডাঙ্গা, দামুড়হুদা, জীবননগর ও দর্শনা সহ সমগ্র জেলার প্রতিটি প্রত্যন্ত অঞ্চলের মানুষের সুখ-দুঃখ, সমস্যা, সম্ভাবনা, অপরাধ, উন্নয়ন ও অর্জনের খবর নির্ভীক ও নিরপেক্ষভাবে সবার আগে পাঠকের কাছে পৌঁছে দেওয়াই আমাদের মূল অঙ্গীকার।
          </p>

          <div className="bg-red-50/70 p-5 rounded-xl border border-red-200">
            <h3 className="text-lg font-bold text-red-950 font-serif mb-2">আমাদের লক্ষ্য ও উদ্দেশ্য</h3>
            <ul className="text-sm text-gray-800 space-y-2">
              <li>• বস্তুনিষ্ঠ, পক্ষপাতহীন ও সত্য সংবাদ পরিবেশন।</li>
              <li>• ভুয়া খবর ও বিভ্রান্তিকর প্রচারের বিরুদ্ধে দায়িত্বশীল সাংবাদিকতা।</li>
              <li>• তৃণমূল চুয়াডাঙ্গার প্রান্তিক মানুষের কণ্ঠস্বর নীতি-নির্ধারকদের কাছে তুলে ধরা।</li>
              <li>• কৃষি, শিক্ষা, স্বাস্থ্য, বাণিজ্য ও প্রযুক্তির অগ্রযাত্রায় অনুপ্রেরণা যোগানো।</li>
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-3">সম্পাদনা ও প্রকাশনা পর্ষদ</h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-800 font-bold">ভারপ্রাপ্ত সম্পাদক ও প্রকাশক: নূর আলম</p>
              <p className="text-xs text-gray-600 mt-1">ইমেইল: {settings.contactEmail || 'onlainshop240@gmail.com'}</p>
              <p className="text-xs text-gray-600">কার্যালয়: {settings.officeAddress || 'চুয়াডাঙ্গা সদর, চুয়াডাঙ্গা-৭২০০'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Contact Page */}
      {page === 'contact' && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">যোগাযোগ করুন</h1>
            <p className="text-sm text-gray-600 mt-1">
              যেকোনো সংবাদ, পরামর্শ, অভিযোগ বা বিজ্ঞাপনের জন্য আমাদের সাথে যোগাযোগ করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">কার্যালয়ের ঠিকানা</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {settings.officeAddress || 'শহীদ আবুল কাশেম সড়ক, চুয়াডাঙ্গা সদর, চুয়াডাঙ্গা-৭২০০'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">হটলাইন ও হোয়াটসঅ্যাপ</h4>
                  <p className="text-xs text-gray-600 mt-1">{settings.contactPhone || '+880 1712-345678'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">ইমেইল ঠিকানা</h4>
                  <p className="text-xs text-gray-600 mt-1">{settings.contactEmail || 'onlainshop240@gmail.com'}</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 text-base mb-4 font-serif">সরাসরি বার্তা পাঠান</h3>
              {sent ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium">
                    আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! আমাদের টিম দ্রুত উত্তর দেবে।
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">আপনার নাম *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ইমেইল বা ফোন *</label>
                    <input
                      type="text"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">বার্তা / সংবাদ তথ্য *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>পাঠিয়ে দিন</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Privacy Policy */}
      {page === 'privacy' && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs space-y-6 text-gray-700 leading-relaxed text-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">গোপনীয়তা নীতি (Privacy Policy)</h1>
          <p>
            ব্রেকিং চুয়াডাঙ্গা ২৪ পাঠকদের ব্যক্তিগত তথ্যের সর্বোচ্চ গোপনীয়তা ও সুরক্ষায় প্রতিশ্রুতিবদ্ধ। এই ওয়েবসাইটে পরিদর্শনের সময় সংগৃহীত যেকোনো তথ্য কঠোরভাবে সংরক্ষিত রাখা হয় এবং কোনো তৃতীয় পক্ষের কাছে হস্তান্তর করা হয় না।
          </p>
          <h3 className="font-bold text-gray-900 text-base font-serif">কুকিজ ও এনালিটিক্স</h3>
          <p>
            ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে আমরা স্ট্যান্ডার্ড এনালিটিক্স কুকিজ ব্যবহার করতে পারি, যার মাধ্যমে ব্রাউজিং পরিসংখ্যান ও জনপ্রিয় সংবাদ বিশ্লেষণ করা হয়।
          </p>
        </div>
      )}

      {/* 4. Terms & Conditions */}
      {page === 'terms' && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs space-y-6 text-gray-700 leading-relaxed text-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">ব্যবহারের শর্তাবলী (Terms & Conditions)</h1>
          <p>
            ব্রেকিং চুয়াডাঙ্গা ২৪ ওয়েবসাইটে প্রকাশিত সকল প্রতিবেদন, ছবি, গ্রাফিক্স ও ভিডিও কনটেন্টের সর্বস্বত্ব ব্রেকিং চুয়াডাঙ্গা ২৪ কর্তৃপক্ষের। অনুমতি ব্যতিরেকে কোনো কনটেন্ট বাণিজ্যিকভাবে পুনঃপ্রকাশ বা প্রচার আইনত দণ্ডনীয়।
          </p>
        </div>
      )}

      {/* 5. Disclaimer */}
      {page === 'disclaimer' && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs space-y-6 text-gray-700 leading-relaxed text-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">দাবিত্যাগ (Disclaimer)</h1>
          <p>
            ব্রেকিং চুয়াডাঙ্গা ২৪ প্রকাশিত সকল সংবাদের সত্যতা ও বস্তুনিষ্ঠতা নিশ্চিতে সর্বোচ্চ সচেষ্ট। মতামত ও উপ-সম্পাদকীয় কলামে প্রকাশিত মতামতের দায়ভার লেখকের নিজস্ব, এর জন্য সম্পাদক বা প্রকাশক দায়ী নন।
          </p>
        </div>
      )}
    </div>
  );
};
