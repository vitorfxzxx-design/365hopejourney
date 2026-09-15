import React, { useState } from 'react';
import { Mail, Lock, Shield, Sparkles } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';

export default function AdminLoginView() {
  const { loginAsAdmin, appSettings } = useEbooks();
  const [adminEmail, setAdminEmail] = useState('admin@health365.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginAsAdmin(adminEmail, adminPassword);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Top Brand Banner */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800/80 shadow-md border border-slate-700 flex items-center justify-center text-3xl mb-3">
            <Shield size={32} className="text-blue-400" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            {appSettings.name || 'Health365'} — Admin Panel
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            CMS management for products, chapters, members & settings
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admin Email:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@health365.com"
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admin Password:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
            >
              <Shield size={15} />
              <span>Sign In to Admin Panel</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
