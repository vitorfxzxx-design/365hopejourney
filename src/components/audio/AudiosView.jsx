import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Play, Pause } from 'lucide-react';
import { useEbooks, DEFAULT_HOPEJOURNEY_AUDIO_COVER } from '../../context/EbookContext';
import { getAudioFromStorage } from '../../utils/audioStorage';

// Helper to format seconds to M:SS (e.g. 195 -> 3:15)
function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Parse string duration like "06:12" or "3:30" to seconds
function parseDurationStringToSeconds(durStr) {
  if (!durStr || typeof durStr !== 'string') return 0;
  const parts = durStr.split(':').map(p => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export default function AudiosView() {
  const { audios, appSettings } = useEbooks();
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const audioRef = useRef(null);

  const sectionTitle = appSettings?.audioSectionTitle || localStorage.getItem('health365_audio_section_title') || 'Audios & Meditations';
  const defaultCover = appSettings?.defaultAudioCover || localStorage.getItem('health365_default_audio_cover') || '';

  const getCoverForAudio = (audio) => {
    if (audio?.cover && !audio.cover.includes('unsplash.com') && !audio.cover.startsWith('data:image/svg+xml')) {
      return audio.cover;
    }
    if (defaultCover && !defaultCover.startsWith('data:image/svg+xml')) {
      return defaultCover;
    }
    return '';
  };

  // Handle Play / Pause (Exact matching robust logic from Admin)
  const handlePlayPause = async (audio) => {
    if (!audio) return;

    if (playingAudioId === audio.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (playingAudioId === audio.id && !isPlaying) {
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
        return;
      }
    }

    // Switch to new audio
    setPlayingAudioId(audio.id);
    setCurrentTime(0);

    let src = audio.audioUrl;
    if (!src || !src.startsWith('data:')) {
      try {
        const stored = await getAudioFromStorage(audio.id);
        if (stored) {
          src = stored;
        }
      } catch (err) {}
    }
    if (!src) {
      src = audio.audioUrl || '';
    }

    if (audioRef.current && src) {
      audioRef.current.src = src;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Error playing user audio track:', err);
      });
    }
  };

  // Update time during playback
  const handleTimeUpdate = () => {
    if (!isDragging && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Loaded metadata (duration)
  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setPlayingAudioId(null);
    setCurrentTime(0);
  };

  // Interactive scrubbing with Pointer Events (Mouse + Touch drag)
  const handleScrubStart = (e, audio, targetDuration) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX || (e.touches && e.touches[0]?.clientX) || 0, rect.right));
    const ratio = Math.max(0, Math.min(1, (clickX - rect.left) / rect.width));

    setIsDragging(true);
    setDragProgress(ratio);

    const actualDuration = (audioRef.current && audioRef.current.duration) ? audioRef.current.duration : targetDuration;
    if (actualDuration > 0 && audioRef.current) {
      audioRef.current.currentTime = ratio * actualDuration;
      setCurrentTime(ratio * actualDuration);
    }

    // If not currently playing this track, start it
    if (playingAudioId !== audio.id) {
      handlePlayPause(audio);
    }

    const handlePointerMove = (moveEvent) => {
      const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0]?.clientX) || 0;
      const moveRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setDragProgress(moveRatio);
      if (actualDuration > 0 && audioRef.current) {
        setCurrentTime(moveRatio * actualDuration);
      }
    };

    const handlePointerUp = (upEvent) => {
      const clientX = upEvent.clientX || (upEvent.changedTouches && upEvent.changedTouches[0]?.clientX) || 0;
      const finalRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setIsDragging(false);
      if (actualDuration > 0 && audioRef.current) {
        audioRef.current.currentTime = finalRatio * actualDuration;
        setCurrentTime(finalRatio * actualDuration);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4">
      {/* Hidden Global Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        crossOrigin="anonymous"
        playsInline
        preload="auto"
      />

      <h2 className="text-xl font-bold text-slate-800 tracking-tight px-1">
        {sectionTitle}
      </h2>

      <div className="space-y-3">
        {audios.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <Headphones size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No audios available at the moment.</p>
          </div>
        ) : (
          audios.map((audio) => {
            const isCurrent = playingAudioId === audio.id;
            const fallbackDuration = parseDurationStringToSeconds(audio.duration) || 200;
            const totalSecs = (isCurrent && duration > 0) ? duration : fallbackDuration;
            const currentSecs = isCurrent ? currentTime : 0;
            const progressRatio = isDragging && isCurrent
              ? dragProgress
              : (totalSecs > 0 ? Math.min(1, Math.max(0, currentSecs / totalSecs)) : 0);

            const progressPercentage = `${(progressRatio * 100).toFixed(2)}%`;

            return (
              <div
                key={audio.id}
                className={`bg-white rounded-3xl border p-4 shadow-xs flex flex-col gap-3 transition-all ${
                  isCurrent
                    ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Top Row: Cover, Title & Big Green Play Button */}
                <div className="flex items-center justify-between gap-3">
                  <div className="w-12 h-12 min-w-[48px] max-w-[48px] rounded-xl overflow-hidden border border-slate-100 shadow-xs shrink-0 bg-emerald-50/60 flex items-center justify-center">
                    {getCoverForAudio(audio) ? (
                      <img
                        src={getCoverForAudio(audio)}
                        alt={audio.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <img
                        src="/logo.png"
                        alt="365 Hope Journey"
                        className="w-8 h-8 rounded-full object-cover shadow-xs"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {audio.title}
                    </h4>
                    {audio.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {audio.description}
                      </p>
                    )}
                  </div>

                  {/* Play / Pause Circular Button */}
                  <button
                    type="button"
                    onClick={() => handlePlayPause(audio)}
                    className="w-11 h-11 min-w-[44px] rounded-full flex items-center justify-center text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-90 shrink-0 cursor-pointer"
                    title={isCurrent && isPlaying ? 'Pause' : 'Play'}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause size={18} className="fill-white" />
                    ) : (
                      <Play size={18} className="ml-0.5 fill-white" />
                    )}
                  </button>
                </div>

                {/* Bottom Row: Interactive Scrub Bar & Time Display */}
                <div className="space-y-1.5 pt-1">
                  {/* Scrub Track */}
                  <div
                    onPointerDown={(e) => handleScrubStart(e, audio, totalSecs)}
                    className="h-3 relative flex items-center cursor-pointer group touch-none select-none"
                  >
                    {/* Background Bar */}
                    <div className="w-full h-1.5 bg-slate-200/90 rounded-full overflow-hidden relative">
                      {/* Active Progress Fill */}
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: progressPercentage }}
                      />
                    </div>

                    {/* Draggable Circle Thumb / Handle */}
                    <div
                      className={`w-3.5 h-3.5 bg-emerald-600 border-2 border-white rounded-full shadow-sm absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform cursor-grab active:cursor-grabbing ${
                        isCurrent ? 'scale-100 hover:scale-125' : 'scale-0 group-hover:scale-100'
                      }`}
                      style={{ left: progressPercentage }}
                    />
                  </div>

                  {/* Time Labels */}
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 font-mono select-none px-0.5">
                    <span>{formatTime(currentSecs)}</span>
                    <span>{audio.duration || formatTime(totalSecs)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
