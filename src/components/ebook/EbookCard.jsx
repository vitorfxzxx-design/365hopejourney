import React from 'react';
import { BookOpen } from 'lucide-react';

export default function EbookCard({ ebook, onClick }) {
  const chapterCount = ebook.chapters ? ebook.chapters.length : 0;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col active:scale-[0.98]"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={ebook.coverImage || ebook.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
          alt={ebook.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Released Badge overlay on top-right */}
        {ebook.tag && (
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-brand-500/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs tracking-wide">
              {ebook.tag}
            </span>
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="font-bold text-slate-800 text-[13px] leading-tight line-clamp-2">
          {ebook.title}
        </h3>

        {ebook.subtitle && (
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-normal">
            {ebook.subtitle}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-medium text-brand-600">
            <BookOpen size={12} />
            {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
          </span>
        </div>
      </div>
    </div>
  );
}
