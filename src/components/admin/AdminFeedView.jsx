import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Calendar, Image as ImageIcon } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import FeedPostModal from './FeedPostModal';

export default function AdminFeedView({ onBack }) {
  const { feedItems, addFeedItem, updateFeedItem, deleteFeedItem } = useEbooks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const handleCreatePost = () => {
    setEditingPost(null);
    setModalOpen(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this feed post?')) {
      if (deleteFeedItem) {
        deleteFeedItem(postId);
      }
    }
  };

  const handleSavePost = (formData) => {
    if (editingPost) {
      if (updateFeedItem) {
        updateFeedItem(editingPost.id, formData);
      }
    } else {
      if (addFeedItem) {
        addFeedItem(formData);
      }
    }
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
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
              Feed - DailyGrace App
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage official announcements and feed articles
            </p>
          </div>

          <button
            onClick={handleCreatePost}
            className="bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={15} /> New Post
          </button>
        </div>

        {/* Feed Posts List */}
        <div className="space-y-3">
          {feedItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
              <p className="text-xs text-slate-400 mb-3">No feed posts added yet.</p>
              <button
                onClick={handleCreatePost}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
              >
                + Create First Post
              </button>
            </div>
          ) : (
            feedItems.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                {/* Status & Date */}
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {post.status || 'Active'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {post.date || '15/03/2026'}
                  </span>
                </div>

                {/* Title & Preview */}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Attached Image (if any) */}
                {post.image && (
                  <div className="w-24 h-16 rounded-xl overflow-hidden border border-slate-200">
                    <img src={post.image} alt="Post Attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Edit Post"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feed Post Modal */}
      <FeedPostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePost}
        initialData={editingPost}
      />
    </div>
  );
}
