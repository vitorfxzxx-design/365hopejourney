import React, { useState, useEffect } from 'react';
import { EbookProvider, useEbooks } from './context/EbookContext';
import MobileHeader from './components/layout/MobileHeader';
import BottomNav from './components/layout/BottomNav';
import EbookCard from './components/ebook/EbookCard';
import ChapterList from './components/ebook/ChapterList';
import GammaReader from './components/ebook/GammaReader';
import FeedView from './components/social/FeedView';
import CommunityView from './components/social/CommunityView';
import ProfileView from './components/profile/ProfileView';
import SpecialistsView from './components/specialists/SpecialistsView';
import AudiosView from './components/audio/AudiosView';
import AdminDashboard from './components/admin/AdminDashboard';
import ChapterModal from './components/admin/ChapterModal';
import MemberLoginView from './components/auth/MemberLoginView';
import AdminLoginView from './components/auth/AdminLoginView';
import TermsAndPrivacyView from './components/legal/TermsAndPrivacyView';
import HelpSupportView from './components/legal/HelpSupportView';
import { Bell, X, Sparkles, ShieldAlert } from 'lucide-react';
import RechargeCreditsModal from './components/credits/RechargeCreditsModal';

function MainAppContent() {
  const {
    currentUser,
    ebooks,
    currentTab,
    setCurrentTab,
    selectedEbookId,
    selectedChapterId,
    activeEbook,
    activeChapter,
    openEbook,
    openChapter,
    backToEbooks,
    backToChapters,
    nextChapter,
    prevChapter,
    addChapter,
    rechargeModalOpen,
    closeRechargeModal,
    activePushNotification,
    dismissPushNotification
  } = useEbooks();

  const [addChapterModalOpen, setAddChapterModalOpen] = useState(false);
  const [homeSubTab, setHomeSubTab] = useState('contents'); // 'contents' | 'feed'

  // Listen to browser URL path and hash changes for /admin vs /members routing
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.toLowerCase());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isLegalRoute = currentPath.includes('/terms') || currentPath.includes('/privacy') || window.location.hash.includes('terms') || window.location.hash.includes('privacy');
  const isHelpRoute = currentPath.includes('/help') || currentPath.includes('/support') || window.location.hash.includes('help') || window.location.hash.includes('support');
  const isAdminRoute = currentPath.includes('/admin') || window.location.hash.includes('admin');

  // If accessing public Help & Support page (/help)
  if (isHelpRoute) {
    return <HelpSupportView onBack={() => {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }} />;
  }

  // If accessing public Terms or Privacy page
  if (isLegalRoute) {
    return <TermsAndPrivacyView onBack={() => {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }} />;
  }

  // If not authenticated
  if (!currentUser) {
    if (isAdminRoute) {
      return <AdminLoginView />;
    }
    return <MemberLoginView />;
  }

  // If in Admin Mode
  if (currentTab === 'admin') {
    return (
      <AdminDashboard
        onBack={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
          setCurrentTab('home');
        }}
      />
    );
  }

  // If inside Reader
  if (activeEbook && activeChapter) {
    const currentIndex = activeEbook.chapters?.findIndex(c => c.id === activeChapter.id) ?? -1;
    const hasNext = currentIndex >= 0 && currentIndex < (activeEbook.chapters?.length || 0) - 1;
    const hasPrev = currentIndex > 0;

    return (
      <GammaReader
        ebook={activeEbook}
        chapter={activeChapter}
        onBack={backToChapters}
        onNext={nextChapter}
        onPrev={prevChapter}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    );
  }

  // If inside an eBook Chapter List
  if (activeEbook) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center">
        <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative">
          <ChapterList
            ebook={activeEbook}
            onBack={backToEbooks}
            onSelectChapter={openChapter}
            onAddChapter={() => setAddChapterModalOpen(true)}
          />

          <ChapterModal
            isOpen={addChapterModalOpen}
            onClose={() => setAddChapterModalOpen(false)}
            onSave={(data) => addChapter(activeEbook.id, data)}
            defaultNumber={(activeEbook.chapters?.length || 0) + 1}
          />
          <BottomNav />
        </div>
      </div>
    );
  }

  // Main Tabs Rendering
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative">
        {/* Real-time In-App Push Notification Toast Banner */}
        {activePushNotification && (
          <div className="absolute top-3 left-3 right-3 z-50 animate-in slide-in-from-top duration-300">
            <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md flex items-start justify-between gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Bell size={18} className="animate-wiggle" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">365hopejourney Push</span>
                  <span className="text-[10px] text-slate-400">• Just now</span>
                </div>
                <h4 className="text-xs font-black text-white truncate mt-0.5">{activePushNotification.title}</h4>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5 line-clamp-2">{activePushNotification.message}</p>
                {activePushNotification.targetUrl && (
                  <a
                    href={activePushNotification.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline mt-1"
                  >
                    Open Link →
                  </a>
                )}
              </div>
              <button
                onClick={dismissPushNotification}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center shrink-0 transition-colors"
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        <MobileHeader />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'home' && (
            <div className="p-4 pb-32">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-3 px-1">
                My Products
              </h2>

              {/* Sub-tab Switcher: Contents (pre-selected) | Feed */}
              <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl mb-4 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setHomeSubTab('contents')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    homeSubTab === 'contents'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Contents</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    ({ebooks.filter(eb => eb.isActive !== false).length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setHomeSubTab('feed')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    homeSubTab === 'feed'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Feed</span>
                </button>
              </div>

              {homeSubTab === 'contents' ? (
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="font-bold text-slate-700 text-sm">Contents</span>
                    <span className="text-xs font-bold text-slate-400">{ebooks.filter(eb => eb.isActive !== false).length}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {ebooks.filter(eb => eb.isActive !== false).map((ebook) => (
                      <EbookCard
                        key={ebook.id}
                        ebook={ebook}
                        onClick={() => openEbook(ebook.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <FeedView isEmbedded={true} />
              )}

              {/* Medical & Legal Disclaimer Banner */}
              <div className="mt-5 p-3.5 bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-start gap-2.5 text-slate-500">
                <ShieldAlert size={15} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10.5px] leading-relaxed font-normal text-slate-500">
                  <strong className="font-bold text-slate-700 block mb-0.5">Medical & Educational Disclaimer</strong>
                  The contents, protocols, and materials provided in this app are for informational and educational purposes only and do not constitute or replace professional medical advice, diagnosis, or treatment. Always consult a qualified physician or healthcare provider regarding any health condition or dietary changes.
                </p>
              </div>
            </div>
          )}

          {currentTab === 'audios' && <AudiosView />}
          {currentTab === 'feed' && <FeedView />}
          {currentTab === 'community' && <CommunityView />}
          {currentTab === 'specialists' && <SpecialistsView />}
          {currentTab === 'profile' && <ProfileView />}
        </main>

        <RechargeCreditsModal isOpen={rechargeModalOpen} onClose={closeRechargeModal} />
        <BottomNav />
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('health365_ebooks');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-black">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">365hopejourney Recovery</h3>
              <p className="text-xs text-slate-500 mt-1">
                A visual update occurred. Click below to refresh smoothly.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md active:scale-98"
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <EbookProvider>
        <MainAppContent />
      </EbookProvider>
    </ErrorBoundary>
  );
}
