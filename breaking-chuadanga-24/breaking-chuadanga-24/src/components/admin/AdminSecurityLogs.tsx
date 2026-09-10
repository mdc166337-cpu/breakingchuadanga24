import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, Filter, Loader2, RefreshCw } from 'lucide-react';
import { ActivityLog } from '../../types';
import { api } from '../../utils/api';
import { getBengaliDate } from '../../utils/dateUtils';

export const AdminSecurityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = filterAction
    ? logs.filter((l) => l.action.toLowerCase().includes(filterAction.toLowerCase()))
    : logs;

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>নিরাপত্তা ও অ্যাক্টিভিটি অডিট লগ (Security & Audit Logs)</span>
          </h2>
          <p className="text-xs text-gray-500">
            পোর্টালের প্রতিটি লগইন, সংবাদ প্রকাশ, পরিবর্তন ও প্রশাসনিক পদক্ষেপের টাইমস্ট্যাম্পযুক্ত প্রমাণ।
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-700">ফিল্টার অ্যাকশন:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 font-mono"
          >
            <option value="">সকল অ্যাকশন</option>
            <option value="LOGIN">LOGIN (লগইন)</option>
            <option value="CREATE">CREATE (তৈরি)</option>
            <option value="UPDATE">UPDATE (আপডেট)</option>
            <option value="DELETE">DELETE (মুছে ফেলা)</option>
            <option value="PASSWORD">PASSWORD (পাসওয়ার্ড)</option>
            <option value="2FA">2FA (টু-ফ্যাক্টর)</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
              <p className="text-xs">লগ রেকর্ড লোড হচ্ছে...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">কোনো লগ পাওয়া যায়নি</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/70 text-gray-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-3">অ্যাকশন</th>
                  <th className="p-3">ইউজার</th>
                  <th className="p-3">আইপি ঠিকানা</th>
                  <th className="p-3">বিবরণ</th>
                  <th className="p-3 text-right">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors font-mono">
                    <td className="p-3 font-bold text-gray-900">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-sans font-medium text-gray-800">{log.userName}</td>
                    <td className="p-3 text-gray-500">{log.ipAddress}</td>
                    <td className="p-3 font-sans text-gray-700 max-w-xs truncate">{log.details}</td>
                    <td className="p-3 text-right text-gray-400 font-sans">
                      {new Date(log.timestamp).toLocaleTimeString('bn-BD', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • {getBengaliDate(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
