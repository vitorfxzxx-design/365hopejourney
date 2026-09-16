import React, { useState } from 'react';
import { RotateCw, Shield, Sparkles, Zap, Plus, X } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';

export default function MobileHeader() {
  const { appSettings, currentTab, setCurrentTab, currentUser, credits, openRechargeModal } = useEbooks();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full overflow-hidden shadow-xs border border-amber-300/60 bg-gradient-to-tr from-amber-400 to-amber-200 p-[1px] shrink-0">
          <img
            src="/logo.png"
            alt="DailyGrace App"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <h1 className="font-extrabold text-slate-900 text-lg tracking-tight font-serif">
          {appSettings.name && !appSettings.name.includes('365') ? appSettings.name : 'DailyGrace App'}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Credits Pill */}
        <button
          onClick={openRechargeModal}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 text-amber-800 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95"
          title="Recharge Credits"
        >
          <div className="w-4 h-4 rounded-full bg-amber-400/30 flex items-center justify-center text-amber-600">
            <Zap size={11} className="fill-amber-500 text-amber-500" />
          </div>
          <span>{credits ?? 20}</span>
          <span className="text-[10px] text-amber-600 font-semibold hidden sm:inline">Credits</span>
        </button>

        {/* Only show Admin button if logged in as Admin */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setCurrentTab(currentTab === 'admin' ? 'home' : 'admin')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full font-medium transition-all ${
              currentTab === 'admin'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Admin Panel"
          >
            <Shield size={13} />
            <span>Admin</span>
          </button>
        )}

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          title="Refresh App"
        >
          <RotateCw size={17} />
        </button>
      </div>
    </header>
  );
}

