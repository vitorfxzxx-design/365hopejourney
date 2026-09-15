import React from 'react';
import { ArrowLeft, ChevronRight, Lock, Plus, ExternalLink, Sparkles } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';

export default function ChapterList({ ebook, onBack, onSelectChapter, onAddChapter }) {
  const chapters = ebook?.chapters || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-xs">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        {ebook.coverImage && (
          <img
            src={ebook.coverImage}
            alt={ebook.title}
            className="w-7 h-7 rounded-md object-cover border border-slate-200"
          />
        )}

        <h1 className="font-bold text-slate-800 text-[15px] truncate flex-1">
          {ebook.title}
        </h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* eBook Overview Banner */}
        {ebook.description && (
          <div className="mb-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
            <Sparkles size={16} className="text-brand-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{ebook.description}</p>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-slate-800">
            Contents
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {chapters.length} {chapters.length === 1 ? 'part' : 'parts'}
          </span>
        </div>

        {/* Chapter Cards List */}
        <div className="space-y-2.5">
          {chapters.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
              <p className="text-slate-500 text-xs mb-3">No chapters added yet.</p>
              <button
                onClick={onAddChapter}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-2 rounded-xl hover:bg-brand-100 transition-colors"
              >
                <Plus size={14} /> Add First Chapter
              </button>
            </div>
          ) : (
            chapters.map((chapter, index) => {
              const isLocked = chapter.status === 'locked';

              return (
                <div
                  key={chapter.id || index}
                  onClick={() => {
                    if (!isLocked) {
                      onSelectChapter(chapter.id);
                    }
                  }}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-3 flex items-center gap-3 select-none ${
                    isLocked
                      ? 'border-slate-100 opacity-70 cursor-not-allowed bg-slate-50/50'
                      : 'border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-md cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  {/* Number Badge */}
                  <div
                    className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isLocked
                        ? 'bg-slate-200/70 text-slate-400'
                        : 'bg-brand-100 text-brand-700'
                    }`}
                  >
                    {chapter.number || index + 1}
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-[13px] leading-snug line-clamp-2 ${isLocked ? 'text-slate-500' : 'text-slate-800'}`}>
                      {chapter.title}
                    </h3>
                    {isLocked ? (
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        Content not available
                      </p>
                    ) : chapter.subtitle ? (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate font-normal">
                        {chapter.subtitle}
                      </p>
                    ) : null}
                  </div>

                  {/* Right Icon */}
                  <div className="shrink-0 text-slate-400 pr-1">
                    {isLocked ? (
                      <Lock size={16} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-brand-500" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
