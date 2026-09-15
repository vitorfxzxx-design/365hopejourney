import React from 'react';
import { BookOpen, Lock, Clock } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';

export default function EbookCard({ ebook, onClick }) {
  const { checkEbookAccess } = useEbooks();
  const chapterCount = ebook.chapters ? ebook.chapters.length : 0;
  
  const access = checkEbookAccess ? checkEbookAccess(ebook) : { isLocked: false };
  const isLocked = access.isLocked;

  const handleClick = () => {
    if (isLocked) return;
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={`group bg-white rounded-2xl overflow-hidden border shadow-xs transition-all duration-200 flex flex-col ${
        isLocked
          ? 'opacity-85 border-amber-200/80 cursor-not-allowed'
          : 'border-slate-200/80 hover:shadow-md cursor-pointer active:scale-[0.98]'
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={ebook.coverImage || ebook.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
          alt={ebook.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isLocked ? 'grayscale-[35%] brightness-90' : 'group-hover:scale-105'
          }`}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Locked Overlay with Days Countdown Badge */}
        {isLocked ? (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center text-white">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 mb-1.5 shadow-lg">
              <Lock size={16} />
            </div>
            <span className="text-[11px] font-black tracking-wide text-amber-200 uppercase">
              Unlocks in {access.remainingDays} {access.remainingDays === 1 ? 'day' : 'days'}
            </span>
            <span className="text-[9.5px] text-slate-300/80 mt-0.5 font-medium">
              Available on {access.unlockDate}
            </span>
          </div>
        ) : (
          ebook.tag && (
            <div className="absolute top-2.5 right-2.5">
              <span className="bg-brand-500/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs tracking-wide">
                {ebook.tag}
              </span>
            </div>
          )
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
          {isLocked ? (
            <span className="flex items-center gap-1 font-semibold text-amber-600 text-[10.5px]">
              <Clock size={12} />
              Drip Content
            </span>
          ) : (
            <span className="flex items-center gap-1 font-medium text-brand-600">
              <BookOpen size={12} />
              {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
