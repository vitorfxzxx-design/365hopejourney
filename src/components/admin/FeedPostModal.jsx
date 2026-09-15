import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Calendar, Image as ImageIcon } from 'lucide-react';

export default function FeedPostModal({ isOpen, onClose, onSave, initialData }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    publishDate: '',
    scheduleDate: '',
    status: 'Active' // 'Active' | 'Draft'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        image: initialData.image || '',
        publishDate: initialData.publishDate || '',
        scheduleDate: initialData.scheduleDate || '',
        status: initialData.status === 'Rascunho' ? 'Draft' : (initialData.status || 'Active')
      });
    } else {
      setFormData({
        title: '',
        content: '',
        image: '',
        publishDate: '',
        scheduleDate: '',
        status: 'Active'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, image: event.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    // Extract title from first line if not explicitly set
    const lines = formData.content.trim().split('\n');
    const computedTitle = formData.title || lines[0] || 'Feed Announcement';

    onSave({
      ...formData,
      title: computedTitle,
      status: 'Active',
      date: formData.publishDate || new Date().toLocaleDateString('en-US')
    });
    onClose();
  };

  const handleDraft = (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    const lines = formData.content.trim().split('\n');
    const computedTitle = formData.title || lines[0] || 'Feed Draft';

    onSave({
      ...formData,
      title: computedTitle,
      status: 'Draft',
      date: formData.publishDate || new Date().toLocaleDateString('en-US')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            {initialData ? 'Edit Post' : 'New Post'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Content
            </label>
            <textarea
              rows={5}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your post here..."
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-2xl p-3.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden resize-y"
            />
          </div>

          {/* Image (optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Image (optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {formData.image ? (
              <div className="relative inline-block mt-1">
                <div className="w-28 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
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
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <Upload size={22} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Click to upload an image</span>
              </div>
            )}
          </div>

          {/* Publication Date (optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-500" />
              Publication date (optional)
            </label>
            <input
              type="datetime-local"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Defines the date displayed on the post. If empty, the current date will be used upon publishing.
            </p>
          </div>

          {/* Schedule for (optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-500" />
              Schedule for (optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduleDate}
              onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDraft}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              Publish Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
