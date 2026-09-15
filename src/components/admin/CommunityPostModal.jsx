import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, User, Calendar, Heart } from 'lucide-react';
import DateTimePicker from './DateTimePicker';

const getNowUSFormatted = () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
};

export default function CommunityPostModal({ isOpen, onClose, onSave, initialData }) {
  const avatarInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    author: '',
    avatar: '',
    text: '',
    likes: 0,
    comments: 0,
    date: '',
    image: '',
    status: 'approved' // 'pending' | 'approved' | 'rejected'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        author: initialData.author || '',
        avatar: initialData.avatar || '',
        text: initialData.text || '',
        likes: initialData.likes || 0,
        comments: initialData.comments || 0,
        date: initialData.date || getNowUSFormatted(),
        image: initialData.image || '',
        status: initialData.status === 'aprovado' ? 'approved' : (initialData.status === 'pendente' ? 'pending' : (initialData.status === 'rejeitado' ? 'rejected' : (initialData.status || 'approved')))
      });
    } else {
      setFormData({
        author: '',
        avatar: '',
        text: '',
        likes: 0,
        comments: 0,
        date: getNowUSFormatted(),
        image: '',
        status: 'approved'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.75) => {
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

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const compressed = await compressImage(file, 120, 120, 0.7);
    if (compressed) {
      setFormData(prev => ({ ...prev, avatar: compressed }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const compressed = await compressImage(file, 500, 500, 0.65);
    if (compressed) {
      setFormData(prev => ({ ...prev, image: compressed }));
    }
  };

  const handleRemoveAvatar = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.text.trim()) return;

    onSave({
      ...formData,
      likes: parseInt(formData.likes) || 0,
      avatar: formData.avatar || '',
      date: formData.date || new Date().toLocaleDateString('en-US')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            {initialData ? 'Edit Post' : 'New Community Post'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Top Row: Avatar & Author Name */}
          <div className="flex items-start gap-4">
            {/* Avatar upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Avatar
              </label>
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div className="relative">
                {formData.avatar ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-14 h-14 rounded-full border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <User size={20} />
                  </div>
                )}

                {formData.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xs border border-white"
                    title="Remove avatar"
                  >
                    <X size={11} strokeWidth={3} />
                  </button>
                )}
              </div>
              <span
                onClick={() => avatarInputRef.current?.click()}
                className="text-[10px] text-slate-400 font-medium block mt-1 cursor-pointer hover:underline text-center"
              >
                or upload photo
              </span>
            </div>

            {/* Author Name */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Author Name
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Charlotte Miller"
                className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Post Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Post Content
            </label>
            <textarea
              rows={4}
              required
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Write the testimonial / transformation story here..."
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-2xl p-3.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden resize-y"
            />
          </div>

          {/* Number of Likes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Likes Count
            </label>
            <input
              type="number"
              min="0"
              value={formData.likes}
              onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
              placeholder="0"
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Post Date */}
          <div className="relative z-30">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-500" />
              Post Date
            </label>
            <DateTimePicker
              value={formData.date}
              onChange={(newDate) => setFormData(prev => ({ ...prev, date: newDate }))}
              placeholder="MM/DD/YYYY HH:mm"
            />
          </div>

          {/* Post Image (optional) */}
          <div className="relative z-10">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Post / Transformation Image (optional)
            </label>
            <p className="text-[10px] text-slate-400 mb-2">
              Recommended: Square image 1080 x 1080 pixels
            </p>
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {formData.image ? (
              <div className="relative inline-block mt-1">
                <div className="w-36 h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                  <img src={formData.image} alt="Transformation Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 border-2 border-white"
                  title="Remove image"
                >
                  <X size={13} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <Upload size={22} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Upload transformation image</span>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              {initialData ? 'Save' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
