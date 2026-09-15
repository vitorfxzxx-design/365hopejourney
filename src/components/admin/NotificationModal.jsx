import React, { useState, useEffect } from 'react';
import { X, Bell, Send, Sparkles } from 'lucide-react';

export default function NotificationModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetUrl: '',
    sendTo: 'all' // 'all' | 'buyers'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        message: '',
        targetUrl: '',
        sendTo: 'all'
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    // Send real browser notification if permission allowed
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(formData.title, {
        body: formData.message,
        icon: '🍏'
      });
    }

    onSave({
      id: 'notif-' + Date.now(),
      ...formData,
      sentAt: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Bell size={16} className="text-blue-600" />
            New Push Notification
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notification Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. New Ancestral Diet chapter released!"
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Push Message *
            </label>
            <textarea
              rows={3}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="e.g. Check your app now for new anti-inflammatory recipes."
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-2xl p-3.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Destination URL (optional)
            </label>
            <input
              type="text"
              value={formData.targetUrl}
              onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Send To
            </label>
            <select
              value={formData.sendTo}
              onChange={(e) => setFormData({ ...formData, sendTo: e.target.value })}
              className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="all">All registered members</option>
              <option value="buyers">Active Buyers Only</option>
            </select>
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send size={13} />
              Send Push
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
