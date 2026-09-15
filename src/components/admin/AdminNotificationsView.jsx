import React, { useState } from 'react';
import { ArrowLeft, Plus, Bell, Trash2, Send, CheckCircle2 } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import NotificationModal from './NotificationModal';

export default function AdminNotificationsView({ onBack }) {
  const { broadcastPushNotification } = useEbooks();

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveNotification = (newNotif) => {
    if (broadcastPushNotification) {
      broadcastPushNotification(newNotif);
    }
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('hopejourney_notifications', JSON.stringify(updated));
  };

  const handleDeleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('hopejourney_notifications', JSON.stringify(updated));
  };

  const [resendingId, setResendingId] = useState(null);

  const handleResendNotification = (notif) => {
    if (broadcastPushNotification) {
      broadcastPushNotification({
        ...notif,
        sentAt: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    setResendingId(notif.id);
    setTimeout(() => {
      setResendingId(null);
    }, 1800);
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
              Notifications - 365hopejourney
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Send push notifications to your users
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={15} /> New Notification
          </button>
        </div>

        {/* Content Area */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-1">
              <Bell size={28} strokeWidth={1.5} />
            </div>

            <h3 className="font-extrabold text-slate-900 text-sm">
              No notifications
            </h3>
            <p className="text-xs text-slate-400 font-medium max-w-xs">
              Create your first push notification
            </p>

            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              Create Notification
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const isResending = resendingId === notif.id;
              return (
                <div
                  key={notif.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{notif.title}</h4>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.2 rounded-full">
                          Sent
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">
                        {notif.sentAt} • Target: {notif.sendTo === 'all' ? 'All' : 'Buyers'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Resend Push Button */}
                    <button
                      onClick={() => handleResendNotification(notif)}
                      disabled={isResending}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        isResending
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200/80 active:scale-95'
                      }`}
                      title="Resend this push notification to all active users"
                    >
                      {isResending ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Resent!</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Resend Push</span>
                        </>
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
                      title="Delete Notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNotification}
      />
    </div>
  );
}
