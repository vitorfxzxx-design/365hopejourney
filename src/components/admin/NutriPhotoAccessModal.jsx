import React, { useState, useEffect } from 'react';
import { X, Camera, Calendar, User, Mail, Shield, Check, Clock } from 'lucide-react';

export default function NutriPhotoAccessModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    periodType: '30_days',
    customDays: 30,
    status: 'Active',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        periodType: initialData.periodType || '30_days',
        customDays: initialData.customDays || 30,
        status: initialData.status || 'Active',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        periodType: '30_days',
        customDays: 30,
        status: 'Active',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in both name and email.');
      return;
    }

    let durationText = 'Monthly Plan ($9.90/mo)';
    let planType = 'monthly';
    let planPrice = '$9.90';
    let expiresAt = new Date();

    if (formData.periodType === '30_days' || formData.periodType === 'monthly') {
      expiresAt.setDate(expiresAt.getDate() + 30);
      durationText = 'Monthly Plan ($9.90/mo)';
      planType = 'monthly';
      planPrice = '$9.90';
    } else if (formData.periodType === '1_year' || formData.periodType === 'annual') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      durationText = 'Annual Plan ($29.90/yr)';
      planType = 'annual';
      planPrice = '$29.90';
    } else if (formData.periodType === '7_days') {
      expiresAt.setDate(expiresAt.getDate() + 7);
      durationText = '7 Days Trial';
      planType = 'trial';
      planPrice = 'Trial';
    } else if (formData.periodType === '90_days') {
      expiresAt.setDate(expiresAt.getDate() + 90);
      durationText = '90 Days (Quarterly)';
      planType = 'quarterly';
      planPrice = '$24.90';
    } else if (formData.periodType === 'lifetime') {
      expiresAt = null;
      durationText = 'Lifetime (Vitalício)';
      planType = 'lifetime';
      planPrice = 'Lifetime';
    } else if (formData.periodType === 'custom') {
      const days = parseInt(formData.customDays, 10) || 30;
      expiresAt.setDate(expiresAt.getDate() + days);
      durationText = `${days} Days Custom`;
      planType = 'custom';
      planPrice = 'Custom';
    }

    onSave({
      ...formData,
      planType,
      planPrice,
      durationText,
      expiresAt: expiresAt ? expiresAt.toLocaleDateString() : 'Never',
      grantedAt: initialData?.grantedAt || new Date().toLocaleDateString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {initialData ? 'Edit NutriPhoto Access' : 'Grant NutriPhoto Access'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Set user plan type and validity period
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Camila Silva"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              User Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. camila@gmail.com"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Access Plan & Period (Plano de Acesso)
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                { id: '30_days', label: 'Monthly Plan ($9.90/mo)', sub: '30 Days' },
                { id: '1_year', label: 'Annual Plan ($29.90/yr)', sub: '365 Days' },
                { id: 'lifetime', label: 'Lifetime Access', sub: 'No Expiry' },
                { id: 'custom', label: 'Custom Days', sub: 'Manual' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, periodType: opt.id })}
                  className={`p-2.5 rounded-xl text-left transition-all border ${
                    formData.periodType === opt.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{opt.sub}</div>
                </button>
              ))}
            </div>

            {formData.periodType === 'custom' && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.customDays}
                  onChange={(e) => setFormData({ ...formData, customDays: e.target.value })}
                  placeholder="Number of days"
                  className="w-28 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
                <span className="text-xs text-slate-500 font-medium">days of full access</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden transition-all cursor-pointer"
            >
              <option value="Active">Active (Ativo)</option>
              <option value="Paused">Paused (Pausado)</option>
              <option value="Expired">Expired (Expirado)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Check size={15} />
              {initialData ? 'Save Changes' : 'Grant Access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

