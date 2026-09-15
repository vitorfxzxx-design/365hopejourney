import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, User } from 'lucide-react';

export default function MemberModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'Active', // 'Active' | 'Blocked' | 'Pending'
    type: 'Manual',
    date: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        status: initialData.status === 'ativo' || initialData.status === 'Ativo' ? 'Active' : (initialData.status === 'Bloqueado' ? 'Blocked' : (initialData.status === 'Pendente' ? 'Pending' : (initialData.status || 'Active'))),
        type: initialData.type || 'Manual',
        date: initialData.date || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        status: 'Active',
        type: 'Manual',
        date: new Date().toLocaleDateString('en-US')
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    onSave({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      date: formData.date || new Date().toLocaleDateString('en-US')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            {initialData ? 'Edit Member' : 'Add Member'}
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
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Member full name"
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Access Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Access Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
              <option value="Pending">Pending</option>
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              {initialData ? 'Save' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
