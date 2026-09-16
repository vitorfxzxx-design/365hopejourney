import React from 'react';
import { Home, Headphones, Newspaper, Users, Utensils, HelpCircle, User } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';

export default function BottomNav() {
  const { currentTab, setCurrentTab, selectedEbookId, selectedChapterId, backToEbooks, appSettings, audios } = useEbooks();

  // If user is inside a chapter (reader mode), hide bottom nav for full immersive reading
  if (selectedChapterId) {
    return null;
  }

  const savedActive = localStorage.getItem('health365_audio_tab_active');
  const audioTabActive = appSettings?.audioTabActive !== undefined
    ? appSettings.audioTabActive
    : (savedActive !== null ? savedActive === 'true' : true);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'specialists', label: 'Guide', icon: HelpCircle },
    ...(audioTabActive ? [{ id: 'audios', label: 'Audios', icon: Headphones }] : []),
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'home' && selectedEbookId) {
      backToEbooks();
    }
    setCurrentTab(tabId);
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 z-30 px-2 max-w-md mx-auto pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-900/8 px-1 py-1 flex items-center justify-between gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-2xl transition-all duration-150 min-w-0 ${
                isActive
                  ? 'bg-emerald-100/90 text-emerald-700 font-bold shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 active:scale-95'
              }`}
            >
              <Icon size={17} strokeWidth={isActive ? 2.5 : 1.9} className="shrink-0" />
              <span className="text-[8.5px] sm:text-[9px] mt-0.5 tracking-tighter leading-tight truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
