import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function EbookModal({ isOpen, onClose, onSave, initialData }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    coverImage: '',
    category: 'Content', // 'Content' | 'Supplement'
    type: 'Main', // 'Main' | 'Upsell' | 'Bonus'
    releaseType: 'Manual', // 'Immediate' | 'Via Integration' | 'Manual' | 'Days After Purchase'
    salesPageUrl: '',
    subtitle: '',
    description: '',
    tag: 'Main',
    isActive: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        coverImage: initialData.coverImage || initialData.cover || '',
        category: initialData.category === 'Suplemento' ? 'Supplement' : (initialData.category === 'Conteúdo' ? 'Content' : (initialData.category || 'Content')),
        type: initialData.type === 'Principal' ? 'Main' : (initialData.type === 'Bônus' ? 'Bonus' : (initialData.type || 'Main')),
        releaseType: initialData.releaseType || initialData.release_mode || 'Manual',
        salesPageUrl: initialData.salesPageUrl || '',
        subtitle: initialData.subtitle || '',
        description: initialData.description || '',
        tag: initialData.tag || 'Main',
        isActive: initialData.isActive !== false
      });
    } else {
      setFormData({
        title: '',
        coverImage: '',
        category: 'Content',
        type: 'Main',
        releaseType: 'Manual',
        salesPageUrl: '',
        subtitle: '',
        description: '',
        tag: 'Main',
        isActive: true
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.75) => {
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
    const compressed = await compressImage(file, 400, 400, 0.75);
    if (compressed) {
      setFormData(prev => ({ ...prev, coverImage: compressed }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">
            {initialData ? 'Edit Product' : 'New Product'}
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
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Complete Protocol"
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Product Logo (optional) - Drag & Drop Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Product Image / Cover (optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
            >
              {formData.coverImage ? (
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="text-left min-w-0">
                      <span className="text-xs font-bold text-blue-600 block truncate">Image uploaded</span>
                      <span className="text-[10px] text-slate-400">Click to change image</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, coverImage: '' }));
                    }}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors shrink-0"
                    title="Remove Image"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={20} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Upload image</span>
                  <span className="text-[10px] text-slate-400">or click to browse files</span>
                </>
              )}
            </div>
          </div>

          {/* Product Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Product Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="Content">Content</option>
              <option value="Supplement">Supplement</option>
            </select>
          </div>

          {/* Grid: Type & Release */}
          <div className="grid grid-cols-2 gap-3">
            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Main">Main</option>
                <option value="Upsell">Upsell</option>
                <option value="Bonus">Bonus</option>
              </select>
            </div>

            {/* Release */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Release Mode
              </label>
              <select
                value={formData.releaseType}
                onChange={(e) => setFormData({ ...formData, releaseType: e.target.value })}
                className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Immediate">Immediate</option>
                <option value="Via Integration">Via Integration</option>
                <option value="Manual">Manual</option>
                <option value="Days After Purchase">Days After Purchase</option>
              </select>
            </div>
          </div>

          {/* Sales Page URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Sales Page URL (optional)
            </label>
            <input
              type="url"
              value={formData.salesPageUrl}
              onChange={(e) => setFormData({ ...formData, salesPageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Bottom Actions */}
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
