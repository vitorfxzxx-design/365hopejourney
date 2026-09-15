import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

export default function ChapterModal({ isOpen, onClose, onSave, initialData, defaultNumber }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    thumbnail: '',
    gammaUrl: '',
    subtitle: '',
    number: 1,
    status: 'released'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        thumbnail: initialData.thumbnail || '',
        gammaUrl: initialData.gammaUrl || '',
        subtitle: initialData.subtitle || '',
        number: initialData.number || 1,
        status: initialData.status || 'released'
      });
    } else {
      setFormData({
        title: '',
        thumbnail: '',
        gammaUrl: '',
        subtitle: '',
        number: defaultNumber || 1,
        status: 'released'
      });
    }
  }, [initialData, defaultNumber, isOpen]);

  if (!isOpen) return null;

  const compressImage = (file, maxWidth = 500, maxHeight = 500, quality = 0.85) => {
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    const compressed = await compressImage(file);
    if (compressed) {
      setFormData(prev => ({ ...prev, thumbnail: compressed }));
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, thumbnail: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            {initialData ? 'Edit Content' : 'New Content'}
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
          {/* Content Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Content Name
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Part 1 - Introduction"
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Content URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Content URL (Embed / Presentation Link)
            </label>
            <input
              type="text"
              value={formData.gammaUrl}
              onChange={(e) => setFormData({ ...formData, gammaUrl: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
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
              {initialData ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
