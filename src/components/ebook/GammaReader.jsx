import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { normalizeGammaUrl } from '../../utils/gammaUtils';

export default function GammaReader({ ebook, chapter, onBack, onNext, onPrev, hasNext, hasPrev }) {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  const embedUrl = normalizeGammaUrl(chapter?.gammaUrl);

  // Auto-dismiss loading screen ultra fast (300ms) so content appears immediately
  useEffect(() => {
    setIsLoading(true);
    setIframeError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [embedUrl, chapter?.id]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            title="Back to chapters"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-slate-100 truncate">
              {chapter?.title || 'Reading'}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {ebook?.title}
            </p>
          </div>
        </div>

        {/* Quick Nav actions (Previous / Next Chapters) */}
        <div className="flex items-center">
          <div className="flex items-center bg-slate-800/80 rounded-full p-0.5 border border-slate-700/60">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className={`p-1.5 rounded-full transition-colors ${
                hasPrev ? 'text-slate-200 hover:bg-slate-700 active:scale-95 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Previous chapter"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`p-1.5 rounded-full transition-colors ${
                hasNext ? 'text-slate-200 hover:bg-slate-700 active:scale-95 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Next chapter"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-950 relative overflow-y-auto">
        {embedUrl ? (
          // Interactive Content Iframe Viewer
          <div className="relative w-full flex-1 min-h-[calc(100vh-56px)]">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xs z-10 transition-opacity duration-200">
                <div className="w-7 h-7 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-2.5" />
                <p className="text-xs text-slate-300 font-medium tracking-wide">Loading content...</p>
              </div>
            )}
            <iframe
              src={embedUrl}
              title={chapter.title}
              loading="eager"
              className="w-full h-full min-h-[calc(100vh-56px)] border-0"
              allow="fullscreen"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setIframeError(true);
              }}
            />
          </div>
        ) : (
          // Rich Built-in Native Slide Preview
          <div className="max-w-md mx-auto w-full p-4 flex flex-col gap-4 pb-12">
            {/* Reading Mode Banner */}
            <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-3 text-xs text-emerald-200/90 flex items-start gap-2.5">
              <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-300">Reading Mode</p>
                <p className="text-[11px] text-emerald-200/70 mt-0.5">
                  Explore the key highlights and protocol contents below.
                </p>
              </div>
            </div>

            {/* Simulated Gamma Card 1: Hero Cover */}
            <div className="bg-gradient-to-b from-emerald-100 via-emerald-50 to-teal-50 text-slate-900 rounded-3xl overflow-hidden shadow-xl border border-emerald-200/50">
              <div className="p-6 pb-4">
                <h2 className="font-extrabold text-2xl text-emerald-950 leading-tight tracking-tight font-serif">
                  {chapter?.previewContent?.headline || chapter?.title}
                </h2>
                <p className="text-xs text-emerald-800/90 mt-2 font-medium">
                  {chapter?.previewContent?.subheadline || chapter?.subtitle || 'Practical transformative guide.'}
                </p>
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={chapter.thumbnail || ebook.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                  alt="Chapter Visual"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Simulated Gamma Card 2: Content Slide */}
            <div className="bg-gradient-to-b from-emerald-50/90 to-teal-50/90 text-slate-900 rounded-3xl p-6 shadow-xl border border-emerald-200/50">
              <h3 className="font-bold text-xl text-emerald-950 font-serif mb-3">
                What You Believe Is Wrong
              </h3>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm mb-2">The Lies We Are Told</h4>
                  <ul className="space-y-1.5 pl-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span><strong>Pain is normal after 40:</strong> Aging does not require painful physical decline.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span><strong>Genetics dictate 90% of health:</strong> Epigenetics and nutrition control gene expression.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span><strong>Medication is the only solution:</strong> Medications often mask symptoms while underlying root causes remain.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-emerald-200/60 mt-4">
                  <h4 className="font-bold text-emerald-950 text-sm mb-1">The Ancestral Truth</h4>
                  <p className="text-slate-700 text-xs">
                    Your body possesses powerful natural self-healing mechanisms when fueled with authentic nutrient density and freed from modern industrial seed oils.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
