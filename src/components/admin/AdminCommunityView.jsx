import React, { useState } from 'react';
import {
  ArrowLeft, Plus, Edit2, Trash2, Heart, Clock, CheckCircle2,
  XCircle, Check, Sparkles, Image as ImageIcon, MessageSquare
} from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import CommunityPostModal from './CommunityPostModal';
import { INITIAL_COMMUNITY_POSTS } from '../../data/communityInitialData';
import { sortPostsByDateDesc } from '../../utils/dateUtils';

export default function AdminCommunityView({ onBack }) {
  const { posts, addCommunityPost, updateCommunityPost, deleteCommunityPost } = useEbooks();

  // Active status filter tab: 'pending' | 'approved' | 'rejected'
  const [filterTab, setFilterTab] = useState('approved');
  // Media filter: 'all' | 'with_photo' | 'text_only'
  const [mediaFilter, setMediaFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Initialize or fallback to rich social proof posts
  const allCommunityPosts = posts && posts.length > 0 ? posts : INITIAL_COMMUNITY_POSTS;

  const pending = allCommunityPosts.filter(p => p.status === 'pending' || p.status === 'pendente');
  const approved = allCommunityPosts.filter(p => p.status !== 'pending' && p.status !== 'pendente' && p.status !== 'rejected' && p.status !== 'rejeitado');
  const rejected = allCommunityPosts.filter(p => p.status === 'rejected' || p.status === 'rejeitado');

  const statusFilteredPosts =
    filterTab === 'pending' ? pending :
    filterTab === 'rejected' ? rejected :
    approved;

  const countAll = statusFilteredPosts.length;
  const countWithPhoto = statusFilteredPosts.filter(p => p.image && p.image.trim() !== '').length;
  const countTextOnly = statusFilteredPosts.filter(p => !p.image || p.image.trim() === '').length;

  const rawDisplayedPosts = statusFilteredPosts.filter(post => {
    const hasPhoto = post.image && post.image.trim() !== '';
    if (mediaFilter === 'with_photo') return hasPhoto;
    if (mediaFilter === 'text_only') return !hasPhoto;
    return true;
  });

  const displayedPosts = sortPostsByDateDesc(rawDisplayedPosts);

  const handleCreatePost = () => {
    setEditingPost(null);
    setModalOpen(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this community post?')) {
      deleteCommunityPost(postId);
    }
  };

  const handleSavePost = (formData) => {
    if (editingPost) {
      updateCommunityPost(editingPost.id, formData);
    } else {
      addCommunityPost(formData);
    }
    setModalOpen(false);
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
              Back to Apps
            </button>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Community - Health365
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create simulated and moderated member posts for social proof
            </p>
          </div>

          <button
            onClick={handleCreatePost}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={15} /> New Post
          </button>
        </div>

        {/* Filter Bars: Status Tabs + Media Type Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs Bar */}
          <div className="flex items-center gap-2 bg-white/70 p-1 rounded-2xl border border-slate-200/80 w-fit">
            <button
              onClick={() => setFilterTab('pending')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'pending'
                  ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock size={13} />
              <span>Pending</span>
              {pending.length > 0 && (
                <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                  {pending.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterTab('approved')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'approved'
                  ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Approved</span>
              <span className="ml-1 text-[10px] font-bold text-slate-500">
                {approved.length}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('rejected')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'rejected'
                  ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <XCircle size={13} className="text-rose-500" />
              <span>Rejected</span>
              <span className="ml-1 text-[10px] font-bold text-slate-500">
                {rejected.length}
              </span>
            </button>
          </div>

          {/* Media Type Filter Tabs (All / With photos / Text only) */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl border border-slate-200/80 w-fit">
            <button
              onClick={() => setMediaFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                mediaFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] text-slate-400 font-semibold">({countAll})</span>
            </button>
            <button
              onClick={() => setMediaFilter('with_photo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
        </div>

        {/* Content Area */}
        {displayedPosts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs flex flex-col items-center justify-center gap-3">
            <Clock size={42} strokeWidth={1.5} className="text-slate-300" />
            <p className="text-xs text-slate-500 font-medium">
              {filterTab === 'pending'
                ? 'No posts awaiting review'
                : filterTab === 'rejected'
                ? 'No rejected posts'
                : 'No approved posts yet'}
            </p>
          </div>
        ) : (
          /* 3-Column Grid of Community Posts */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3 hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="space-y-3">
                  {/* Author Row */}
                  <div className="flex items-center gap-2.5">
                    {post.avatar ? (
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {(post.author || 'M').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {post.author}
                        </h4>
                        {(post.status === 'pending' || post.status === 'pendente') ? (
                          <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0 border border-amber-200/60">
                            <Clock size={9} /> Pending Review
                          </span>
                        ) : (post.status === 'rejected' || post.status === 'rejeitado') ? (
                          <span className="bg-rose-50 text-rose-700 text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0 border border-rose-200/60">
                            <XCircle size={9} /> Rejected
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0 border border-emerald-200/60">
                            <Check size={9} strokeWidth={3} /> Approved
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        {post.date}
                      </p>
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-xs text-slate-700 leading-relaxed font-normal line-clamp-4">
                    {post.text}
                  </p>

                  {/* Transformation Image */}
                  {post.image && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 max-h-[420px] flex items-center justify-center">
                      <img
                        src={post.image}
                        alt="Transformation Proof"
                        className="w-full h-auto max-h-[420px] object-contain rounded-2xl"
                      />
                    </div>
                  )}
                </div>

                {/* Footer: Likes, Quick Approve / Reject, Edit & Delete */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Heart size={14} className="text-slate-400" />
                      {post.likes || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(post.status === 'pending' || post.status === 'pendente') && (
                      <>
                        <button
                          onClick={() => updateCommunityPost(post.id, { status: 'approved' })}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200/60 transition-colors flex items-center gap-1"
                          title="Approve Post"
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button
                          onClick={() => updateCommunityPost(post.id, { status: 'rejected' })}
                          className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/60 transition-colors flex items-center gap-1"
                          title="Reject Post"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}

                    {(post.status === 'rejected' || post.status === 'rejeitado') && (
                      <button
                        onClick={() => updateCommunityPost(post.id, { status: 'approved' })}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200/60 transition-colors flex items-center gap-1"
                        title="Approve Post"
                      >
                        <CheckCircle2 size={12} /> Approve
                      </button>
                    )}

                    <button
                      onClick={() => handleEditPost(post)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Edit Post"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community Post Modal */}
      <CommunityPostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePost}
        initialData={editingPost}
      />
    </div>
  );
}
