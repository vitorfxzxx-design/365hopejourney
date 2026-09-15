import React, { useState } from 'react';
import { Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';

export default function MemberLoginView() {
  const { loginAsMember, appSettings } = useEbooks();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your member email.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const result = await loginAsMember(email.trim());
      if (result && !result.success) {
        setErrorMsg(result.message || 'Access denied. You must be an active registered member to log in.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Top Brand Banner */}
        <div className="bg-gradient-to-b from-brand-50 to-white px-6 pt-8 pb-6 text-center border-b border-slate-100">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-white shadow-md border border-brand-100 flex items-center justify-center text-3xl mb-3">
            {appSettings.iconEmoji || '✨'}
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {appSettings.name || '365hopejourney'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Exclusive Sanctuary of Hope & Spiritual Growth
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60">
            <UserCheck size={13} />
            <span>Member Login</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Member Email:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. member@email.com"
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 font-normal">
                Enter the email address registered with your membership.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-70 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Verifying Access...' : 'Access Member Area'}</span>
              <ArrowRight size={15} className={loading ? 'animate-pulse' : ''} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
