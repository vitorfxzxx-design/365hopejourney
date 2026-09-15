import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Heart, MessageSquare, CheckCircle2, X, Upload } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import { sortPostsByDateDesc } from '../../utils/dateUtils';

export default function CommunityView() {
  const { posts, addPost, toggleLikePost, isPostLiked, currentUser } = useEbooks();
  const [newText, setNewText] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all' | 'with_photo' | 'text_only'
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const fileInputRef = useRef(null);

  // Dynamic user avatar linked directly with Profile photo
  const [userAvatar, setUserAvatar] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.avatar) return parsed.avatar;
      }
    } catch (e) {}
    return currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('health365_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.avatar) {
          setUserAvatar(parsed.avatar);
          return;
        }
      }
    } catch (e) {}
    if (currentUser?.avatar) {
      setUserAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  const compressImage = (file, maxWidth = 500, maxHeight = 500, quality = 0.65) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const compressed = await compressImage(file, 500, 500, 0.65);
    if (compressed) {
      setNewImageUrl(compressed);
      setShowImageInput(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newText.trim() && !newImageUrl.trim()) return;
    addPost(newText, newImageUrl || null);
    setNewText('');
    setNewImageUrl('');
    setShowImageInput(false);
    setSubmittedNotice(true);
    setTimeout(() => {
      setSubmittedNotice(false);
    }, 6000);
  };

  // Only approved posts appear for users
  const approvedPosts = (posts || []).filter(
    (p) => p.status !== 'pending' && p.status !== 'pendente' && p.status !== 'rejected' && p.status !== 'rejeitado'
  );

  const filteredPosts = approvedPosts.filter((post) => {
    const hasPhoto = post.image && post.image.trim() !== '';
    if (mediaFilter === 'with_photo') return hasPhoto;
    if (mediaFilter === 'text_only') return !hasPhoto;
    return true;
  });

  const sortedPosts = sortPostsByDateDesc(filteredPosts);

  const countWithPhoto = approvedPosts.filter(p => p.image && p.image.trim() !== '').length;
  const countTextOnly = approvedPosts.filter(p => !p.image || p.image.trim() === '').length;

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">
        Community
      </h2>

      {/* Submission Feedback Toast */}
      {submittedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3.5 mb-4 shadow-xs flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold">Post submitted for review!</p>
            <p className="text-emerald-700 mt-0.5">Once approved by an admin, it will appear in the community.</p>
          </div>
          <button
            onClick={() => setSubmittedNotice(false)}
            className="text-emerald-500 hover:text-emerald-800 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Composer Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs mb-4">
        <div className="flex gap-3">
          <img
            src={userAvatar}
            alt="My Avatar"
            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200/80"
          />
          <div className="flex-1">
            <textarea
              rows={2}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full text-xs text-slate-800 placeholder-slate-400 border border-slate-200 rounded-2xl p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
            />

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Image Preview or URL input */}
            {showImageInput && (
              <div className="mt-2 space-y-2">
                {newImageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={newImageUrl}
                      alt="Upload preview"
                      className="w-24 h-20 object-cover rounded-xl border border-slate-200 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setNewImageUrl('')}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xs border border-white text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full text-xs text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-slate-50 transition-colors"
                  title="Upload photo from device"
                >
                  <ImageIcon size={18} />
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!newText.trim() && !newImageUrl.trim()}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  (newText.trim() || newImageUrl.trim())
                    ? 'bg-brand-500 text-white shadow-xs hover:bg-brand-600 active:scale-95'
                    : 'bg-brand-200/60 text-white/90 cursor-not-allowed'
                }`}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Block: All / With Photos / Text Only */}
      <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl mb-4 border border-slate-200/80">
        <button
          onClick={() => setMediaFilter('all')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
            mediaFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>All</span>
          <span className="ml-1 text-[10px] text-slate-400 font-semibold">({approvedPosts.length})</span>
        </button>
        <button
          onClick={() => setMediaFilter('with_photo')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            mediaFilter === 'with_photo'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon size={13} className={mediaFilter === 'with_photo' ? 'text-blue-600' : 'text-slate-400'} />
          <span>With photos</span>
          <span className="text-[10px] text-slate-400 font-semibold">({countWithPhoto})</span>
        </button>
        <button
          onClick={() => setMediaFilter('text_only')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            mediaFilter === 'text_only'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare size={13} className={mediaFilter === 'text_only' ? 'text-blue-600' : 'text-slate-400'} />
          <span>Text only</span>
          <span className="text-[10px] text-slate-400 font-semibold">({countTextOnly})</span>
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {sortedPosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs text-xs text-slate-400 font-medium">
            No posts found in this category.
          </div>
        ) : (
          sortedPosts.map((post) => {
            const liked = isPostLiked(post.id);
            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3"
              >
                {/* Author */}
                <div className="flex items-center gap-3">
                  {post.avatar ? (
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {(post.author || 'M').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{post.author}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{post.date}</p>
                  </div>
                </div>

                {/* Content Text */}
                {post.text && (
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {post.text}
                  </p>
                )}

                {/* Post Image */}
                {post.image && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 max-h-[420px] flex items-center justify-center">
                    <img
                      src={post.image}
                      alt="Post visual"
                      className="w-full h-auto max-h-[420px] object-contain rounded-2xl"
                    />
                  </div>
                )}

                {/* Actions - Likes Only */}
                <div className="flex items-center pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 transition-all py-1 px-2 -ml-2 rounded-xl active:scale-110 ${
                      liked
                        ? 'text-rose-500 font-bold bg-rose-50/50'
                        : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50 font-medium'
                    }`}
                    title={liked ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      size={16}
                      className={`transition-all duration-200 ${
                        liked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                      }`}
                    />
                    <span className="text-[12px]">{post.likes || 0}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
