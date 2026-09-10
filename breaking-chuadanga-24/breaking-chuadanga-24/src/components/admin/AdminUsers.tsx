import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Trash2, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { User, UserRole } from '../../types';
import { api } from '../../utils/api';
import { getRelativeBengaliTime } from '../../utils/dateUtils';

interface AdminUsersProps {
  currentUser: User;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      setUsers([...users, created]);
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('editor');
    } catch (err: any) {
      setError(err.message || 'ব্যবহারকারী যোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ব্যবহারকারীকে মুছে ফেলতে চান?')) return;
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert(err.message || 'মুছে ফেলতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            <span>ব্যবহারকারী ও পদবী ব্যবস্থাপনা (User & Roles)</span>
          </h2>
          <p className="text-xs text-gray-500">
            এডমিন ও এডিটরদের অ্যাক্সেস ও দায়িত্ব পরিচালনা করুন।
          </p>
        </div>

        {currentUser.role === 'super_admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন এডমিন / এডিটর যোগ করুন</span>
          </button>
        )}
      </div>

      {/* Super Admin Protection Notice */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900">
          <h4 className="font-bold">সুপার এডমিন নিরাপত্তা ও পলিসি</h4>
          <p className="mt-0.5 text-emerald-800">
            প্রাথমিক সুপার এডমিন <strong>Nur Alam (onlainshop240@gmail.com)</strong> সিস্টেমের অপরিবর্তনীয় সর্বোচ্চ নিয়ন্ত্রক। অন্যান্য এডমিন বা এডিটররা শুধুমাত্র অনুমোদিত সংবাদ ব্যবস্থাপনা করতে পারবেন কিন্তু সুপার এডমিন প্রোফাইল মুছে ফেলতে পারবেন না।
          </p>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 font-serif">সিস্টেম ব্যবহারকারীগণ</h3>
          <span className="text-xs text-gray-500">মোট: {users.length} জন</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
              <p className="text-xs">ব্যবহারকারী তথ্য লোড হচ্ছে...</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-100/70 text-gray-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">নাম ও ইমেইল</th>
                  <th className="p-3.5">ভূমিকা / রোল</th>
                  <th className="p-3.5">২FA স্ট্যাটাস</th>
                  <th className="p-3.5 hidden sm:table-cell">যোগদানের তারিখ</th>
                  <th className="p-3.5 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isSuperAdmin = u.role === 'super_admin';
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{u.name}</h4>
                            <span className="text-xs text-gray-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.role === 'super_admin'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : u.role === 'admin'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.role === 'super_admin' && <Shield className="w-3 h-3 text-red-600" />}
                          {u.role === 'super_admin'
                            ? 'Super Admin'
                            : u.role === 'admin'
                              ? 'Admin'
                              : 'Editor'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`text-xs font-semibold ${
                            u.twoFactorEnabled ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        >
                          {u.twoFactorEnabled ? 'সক্রিয় (2FA)' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>

                      <td className="p-3.5 hidden sm:table-cell text-xs text-gray-400">
                        {u.createdAt ? getRelativeBengaliTime(u.createdAt) : 'সিস্টেম প্রারম্ভ'}
                      </td>

                      <td className="p-3.5 text-right">
                        {isSuperAdmin ? (
                          <span className="text-[11px] text-gray-400 font-medium italic">
                            সুরক্ষিত
                          </span>
                        ) : currentUser.role === 'super_admin' ? (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-700 rounded transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-gray-900 font-serif flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-600" />
                <span>নতুন ব্যবহারকারী নিবন্ধন</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সাকিব আল হাসান"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ইমেইল ঠিকানা *</label>
                <input
                  type="email"
                  required
                  placeholder="editor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  placeholder="কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">পদবী ও ক্ষমতা *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden font-bold"
                >
                  <option value="editor">এডিটর (Editor - সংবাদ তৈরি ও সম্পাদনা)</option>
                  <option value="admin">এডমিন (Admin - সম্পূর্ণ সংবাদ ও বিজ্ঞাপন নিয়ন্ত্রণ)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>যুক্ত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
