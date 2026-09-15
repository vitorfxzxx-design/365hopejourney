import React, { useState } from 'react';
import {
  ArrowLeft, Plus, Search, Mail, Edit2, Trash2, Ban, CheckCircle2, UserCheck
} from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import MemberModal from './MemberModal';

export default function AdminMembersView({ onBack }) {
  const { members, setMembers, addMember, updateMember, deleteMember } = useEbooks();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Blocked' | 'Pending'

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Use actual members from Context
  const allMembers = members || [];

  // Filtering
  const filteredMembers = allMembers.filter((m) => {
    const matchesSearch =
      (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || statusFilter === 'Todos' || m.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalMembers = allMembers.length;
  const activeCount = allMembers.filter(m => m.status?.toLowerCase() === 'active' || m.status?.toLowerCase() === 'ativo').length;
  const blockedCount = allMembers.filter(m => m.status?.toLowerCase() === 'blocked' || m.status?.toLowerCase() === 'bloqueado').length;

  const handleCreateMember = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setModalOpen(true);
  };

  const handleToggleBlock = async (member) => {
    const newStatus = (member.status === 'Blocked' || member.status === 'Bloqueado') ? 'Active' : 'Blocked';
    if (updateMember) {
      updateMember(member.id, { status: newStatus });
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      if (deleteMember) {
        deleteMember(memberId);
      }
    }
  };

  const handleSaveMember = async (formData) => {
    const cleanEmail = (formData.email || '').trim().toLowerCase();
    const formattedData = {
      ...formData,
      email: cleanEmail
    };

    if (editingMember) {
      if (updateMember) {
        updateMember(editingMember.id, formattedData);
      }
    } else {
      if (addMember) {
        addMember(formattedData);
      }
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Members
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage buyers and member access
            </p>
          </div>

          <button
            onClick={handleCreateMember}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={15} /> Add Member
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden shadow-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden shadow-xs cursor-pointer"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Members Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Registration Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No members found matching the applied filters.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const isBlocked = member.status === 'Blocked' || member.status === 'Bloqueado';
                    const isPending = member.status === 'Pending' || member.status === 'Pendente';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name */}
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {member.name}
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 text-slate-600 font-mono text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <Mail size={13} className="text-slate-400" />
                            {member.email}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6">
                          {isBlocked ? (
                            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-rose-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Blocked
                            </span>
                          ) : isPending ? (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Pending
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {member.type || 'Manual'}
                        </td>

                        {/* Registration Date */}
                        <td className="py-4 px-6 text-slate-500 font-medium">
                          {member.date || '12/19/2025'}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Block / Unblock */}
                            <button
                              onClick={() => handleToggleBlock(member)}
                              className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                                isBlocked ? 'text-emerald-600' : 'text-rose-400 hover:text-rose-600'
                              }`}
                              title={isBlocked ? 'Unblock Member' : 'Block Access'}
                            >
                              <Ban size={15} />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleEditMember(member)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit Member"
                            >
                              <Edit2 size={15} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Delete Member"
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
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 px-2">
          <span>Total: {totalMembers} members</span>
          <span>Active: {activeCount}</span>
          <span>Blocked: {blockedCount}</span>
        </div>
      </div>

      {/* Member Modal */}
      <MemberModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMember}
        initialData={editingMember}
      />
    </div>
  );
}
