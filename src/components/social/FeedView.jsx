import React from 'react';
import { useEbooks } from '../../context/EbookContext';
import { INITIAL_FEED } from '../../data/initialData';

export default function FeedView({ isEmbedded = false }) {
  const { feedItems } = useEbooks();

  return (
    <div className={isEmbedded ? "space-y-4" : "p-4 max-w-md mx-auto pb-24"}>
      {!isEmbedded && (
        <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">
          Feed
        </h2>
      )}

      <div className="space-y-4">
        {feedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4"
          >
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="font-semibold text-slate-700 text-xs mt-1">
                  {item.subtitle}
                </p>
              )}
            </div>

            <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-normal">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
