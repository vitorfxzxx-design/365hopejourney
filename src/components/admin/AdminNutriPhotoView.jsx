import React, { useState } from 'react';
import {
  ArrowLeft, Camera, Plus, Search, Mail, Edit2, Trash2, Ban, CheckCircle2, Clock, Calendar, Sparkles, Shield, UserCheck
} from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import NutriPhotoAccessModal from './NutriPhotoAccessModal';

export default function AdminNutriPhotoView({ onBack }) {
  const {
    currentUser,
    nutriUsers,
    grantNutriPhotoAccess,
    updateNutriPhotoUser,
    deleteNutriPhotoUser,
    toggleNutriPhotoUserStatus
  } = useEbooks();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Paused' | 'Expired'
  const [planFilter, setPlanFilter] = useState('All'); // 'All' | 'monthly' | 'annual'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [nutriphotoActive, setNutriphotoActive] = useState(() => {
    try {
      return localStorage.getItem('health365_nutriphoto_tab_active') !== 'false';
    } catch (e) {
      return true;
    }
  });

  const handleToggleTab = () => {
    const nextState = !nutriphotoActive;
    setNutriphotoActive(nextState);
    localStorage.setItem('health365_nutriphoto_tab_active', String(nextState));
  };

  const usersList = Array.isArray(nutriUsers) ? nutriUsers : [];

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || u.status?.toLowerCase() === statusFilter.toLowerCase();

    const uPlan = (u.planType || (u.periodType === '1_year' ? 'annual' : 'monthly')).toLowerCase();
    const matchesPlan =
      planFilter === 'All' || uPlan === planFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalUsers = usersList.length;
  const activeCount = usersList.filter(u => u.status?.toLowerCase() === 'active').length;
  const expiredCount = usersList.filter(u => u.status?.toLowerCase() === 'expired').length;
  const monthlyCount = usersList.filter(u => (u.planType === 'monthly' || u.periodType === '30_days') && u.status?.toLowerCase() === 'active').length;
  const annualCount = usersList.filter(u => (u.planType === 'annual' || u.periodType === '1_year') && u.status?.toLowerCase() === 'active').length;

  const handleCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleToggleStatus = (user) => {
    toggleNutriPhotoUserStatus(user.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove NutriPhoto AI access for this user?')) {
      deleteNutriPhotoUser(id);
    }
  };

  const handleSaveUser = (formData) => {
    if (editingUser) {
      updateNutriPhotoUser(editingUser.id, formData);
    } else {
      grantNutriPhotoAccess(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Hub
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                NutriPhoto AI
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={11} /> AI Scanner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage members with access to the NutriPhoto AI food scanner and their access period
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
          >
            <Plus size={15} /> Grant Access
          </button>
        </div>

        {/* Global Module Switch */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base shrink-0">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">
                NutriPhoto Module in Member Area
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Toggle visibility of the NutriPhoto calorie scanner tab for authorized members.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleTab}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
              nutriphotoActive ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                nutriphotoActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{activeCount}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Authorized users</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Monthly Plan ($9.90)</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{monthlyCount}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">30-day subscribers</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Annual Plan ($29.90)</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{annualCount}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">1-year VIP members</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expired / Paused</div>
            <div className="text-2xl font-black text-slate-500 mt-1">{expiredCount}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Needs renewal</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search authorized users by name or email..."
              className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden shadow-xs"
            />
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full sm:w-48 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden shadow-xs cursor-pointer"
          >
            <option value="All">All Plans</option>
            <option value="monthly">Monthly Plan ($9.90)</option>
            <option value="annual">Annual Plan ($29.90)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden shadow-xs cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {/* NutriPhoto Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Plan / Type</th>
                  <th className="py-4 px-6">Granted On</th>
                  <th className="py-4 px-6">Expires On</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      No members found with NutriPhoto access.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isActive = user.status === 'Active';
                    const isExpired = user.status === 'Expired';
                    const isPaused = user.status === 'Paused';
                    const isAnnual = (user.planType === 'annual' || user.periodType === '1_year');
                    const isMonthly = (user.planType === 'monthly' || user.periodType === '30_days');

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name */}
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 text-slate-600 font-mono text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <Mail size={13} className="text-slate-400" />
                            {user.email}
                          </span>
                        </td>

                        {/* Plan / Type */}
                        <td className="py-4 px-6">
                          {isAnnual ? (
                            <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 border border-emerald-200">
                              <Sparkles size={12} className="text-emerald-600" />
                              <span>Annual Plan ($29.90)</span>
                            </span>
                          ) : isMonthly ? (
                            <span className="bg-blue-50 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 border border-blue-200">
                              <Clock size={12} className="text-blue-600" />
                              <span>Monthly Plan ($9.90)</span>
                            </span>
                          ) : (
                            <span className="bg-purple-50 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 border border-purple-200">
                              <Shield size={12} className="text-purple-600" />
                              <span>{user.durationText || 'Custom Plan'}</span>
                            </span>
                          )}
                        </td>

                        {/* Granted On */}
                        <td className="py-4 px-6 text-slate-500 font-medium text-[11px]">
                          {user.grantedAt || '09/01/2026'}
                        </td>

                        {/* Expires On */}
                        <td className="py-4 px-6 text-slate-700 font-semibold text-[11px]">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {user.expiresAt || '10/01/2026'}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6">
                          {isActive && (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          )}
                          {isPaused && (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Paused
                            </span>
                          )}
                          {isExpired && (
                            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-rose-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Expired
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                                isActive ? 'text-amber-500 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-800'
                              }`}
                              title={isActive ? 'Pause Access' : 'Reactivate Access'}
                            >
                              <Ban size={15} />
                            </button>

                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit Plan and Access"
                            >
                              <Edit2 size={15} />
                            </button>

                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Revoke Access"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 px-2">
          <span>Total Members: {totalUsers}</span>
          <span className="text-emerald-700">Active: {activeCount}</span>
          <span className="text-blue-700">Monthly ($9.90): {monthlyCount}</span>
          <span className="text-emerald-700">Annual ($29.90): {annualCount}</span>
          <span className="text-rose-600">Expired: {expiredCount}</span>
        </div>
      </div>

      {/* Access Modal */}
      <NutriPhotoAccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        initialData={editingUser}
      />
    </div>
  );
}
