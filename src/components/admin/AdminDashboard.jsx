import React, { useState, useEffect } from 'react';
import {
  Package, Newspaper, Users, Bell, Zap, Globe, UserCheck, HelpCircle, Headphones, Camera,
  Edit, ExternalLink, Copy, Check, Plus, Trash2, ArrowLeft, Shield, Sparkles, LogOut,
  Layers
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useEbooks } from '../../context/EbookContext';
import AdminProductsView from './AdminProductsView';
import AdminFeedView from './AdminFeedView';
import AdminCommunityView from './AdminCommunityView';
import AdminNotificationsView from './AdminNotificationsView';
import AdminMembersView from './AdminMembersView';
import AdminSpecialistsView from './AdminSpecialistsView';
import AdminAudiosView from './AdminAudiosView';
import AdminNutriPhotoView from './AdminNutriPhotoView';

export default function AdminDashboard({ onBack }) {
  const {
    appSettings,
    setAppSettings,
    adminSubSection,
    setAdminSubSection,
    setCurrentTab,
    logout
  } = useEbooks();

  const [copied, setCopied] = useState(''); // '' | 'member' | 'admin'

  // 1. Products
  if (adminSubSection === 'products' || adminSubSection === 'produtos') {
    return <AdminProductsView onBack={() => setAdminSubSection('dashboard')} />;
  }

  // 2. Feed
  if (adminSubSection === 'feed') {
    return <AdminFeedView onBack={() => setAdminSubSection('dashboard')} />;
  }

  // 3. Community
  if (adminSubSection === 'community' || adminSubSection === 'comunidade') {
    return <AdminCommunityView onBack={() => setAdminSubSection('dashboard')} />;
  }

  // 4. Notifications
  if (adminSubSection === 'notifications' || adminSubSection === 'notificacoes') {
    return <AdminNotificationsView onBack={() => setAdminSubSection('dashboard')} />;
  }

  // 5. Members
  if (adminSubSection === 'members' || adminSubSection === 'membros') {
    return <AdminMembersView onBack={() => setAdminSubSection('dashboard')} />;
  }

  // 6. Specialists
  if (adminSubSection === 'specialists' || adminSubSection === 'especialistas') {
    return <AdminSpecialistsView onBack={() => setAdminSubSection('dashboard')} />;
  }

  // 7. Audios
  if (adminSubSection === 'audios') {
    return <AdminAudiosView onBack={() => setAdminSubSection('dashboard')} />;
  }

  // 8. NutriPhoto (NutriFoto)
  if (adminSubSection === 'nutriphoto' || adminSubSection === 'nutrifoto') {
    return <AdminNutriPhotoView onBack={() => setAdminSubSection('dashboard')} />;
  }

  const gridButtons = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'feed', label: 'Feed', icon: Newspaper },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'members', label: 'Members', icon: UserCheck },
    { id: 'specialists', label: 'Specialists', icon: HelpCircle },
    { id: 'audios', label: 'Audios', icon: Headphones },
    { id: 'nutriphoto', label: 'NutriFoto', icon: Camera },
  ];


  return (
    <div className="min-h-screen bg-slate-100 flex justify-center p-3 sm:p-6 pb-20">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Admin Hub Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{appSettings.iconEmoji || '✨'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">
                  {appSettings.name || '365hopejourney'}
                </h1>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {appSettings.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {appSettings.slug || '/365hopejourney'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
                setCurrentTab('home');
                if (onBack) onBack();
              }}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              View App
            </button>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
              title="Log out of Admin"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* URL Boxes & Action Buttons */}
        <div className="p-5 space-y-3 bg-slate-50/50 border-b border-slate-100">
          {/* Members App URL */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Members Area URL (Share with customers)
            </span>
            <div className="bg-white rounded-2xl border border-slate-200 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-slate-400 shrink-0">👥</span>
                <span className="text-xs text-slate-600 truncate font-mono">
                  {window.location.origin}/members
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/members`);
                  setCopied('member');
                  setTimeout(() => setCopied(''), 2000);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                title="Copy Members URL"
              >
                {copied === 'member' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Admin URL */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Admin Login URL (Private access)
            </span>
            <div className="bg-white rounded-2xl border border-slate-200 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-slate-400 shrink-0">🔐</span>
                <span className="text-xs text-slate-600 truncate font-mono">
                  {window.location.origin}/admin
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/admin`);
                  setCopied('admin');
                  setTimeout(() => setCopied(''), 2000);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                title="Copy Admin URL"
              >
                {copied === 'admin' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Blue Edit & Open Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminSubSection('products')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
            >
              <Edit size={15} />
              Edit Products & Gamma URLs
            </button>
            <button
              onClick={() => setCurrentTab('home')}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl shadow-xs transition-colors"
              title="Open full application"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Sub-section View or Grid */}
        {adminSubSection === 'dashboard' ? (
          /* 3x3 Button Grid */
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {gridButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setAdminSubSection(btn.id)}
                    className="p-4 bg-white hover:bg-slate-50/90 border border-slate-200/90 rounded-2xl shadow-xs flex flex-col items-center justify-center gap-2 transition-all hover:border-blue-400 hover:shadow-md active:scale-95 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="font-bold text-[11px] text-slate-700 group-hover:text-blue-600 tracking-tight">
                      {btn.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Other Sub-sections */
          <div className="p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <button
                onClick={() => setAdminSubSection('dashboard')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Back to Hub</span>
              </button>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                {adminSubSection}
              </span>
            </div>

            {/* INTEGRATIONS */}
            {(adminSubSection === 'integrations' || adminSubSection === 'integracoes') && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Checkout Webhook Integrations</h3>
                  <p className="text-xs text-slate-400">Automatically grant access as soon as a customer completes purchase in Hotmart or PerfectPay.</p>
                </div>

                {/* 2. Hotmart Webhook */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-xs text-slate-800">Webhook Hotmart</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={appSettings.hotmartWebhookUrl || 'https://fitbuvxhovynlecwmdrc.supabase.co/functions/v1/hotmart-webhook'}
                      onChange={(e) => setAppSettings({ ...appSettings, hotmartWebhookUrl: e.target.value })}
                      className="flex-1 text-xs font-mono bg-white border border-slate-200 rounded-xl p-2.5 text-slate-700"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(appSettings.hotmartWebhookUrl || 'https://fitbuvxhovynlecwmdrc.supabase.co/functions/v1/hotmart-webhook');
                        setCopied('hotmart');
                        setTimeout(() => setCopied(''), 2000);
                      }}
                      className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors shrink-0"
                      title="Copy Hotmart Webhook URL"
                    >
                      {copied === 'hotmart' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Paste this URL into Hotmart Webhook (Postback) tool under <strong>Purchase Approved</strong>.
                  </p>
                </div>

                {/* 3. PerfectPay Webhook */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-xs text-slate-800">Webhook PerfectPay</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={appSettings.perfectpayWebhookUrl || 'https://fitbuvxhovynlecwmdrc.supabase.co/functions/v1/perfectpay-webhook'}
                      onChange={(e) => setAppSettings({ ...appSettings, perfectpayWebhookUrl: e.target.value })}
                      className="flex-1 text-xs font-mono bg-white border border-slate-200 rounded-xl p-2.5 text-slate-700"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(appSettings.perfectpayWebhookUrl || 'https://fitbuvxhovynlecwmdrc.supabase.co/functions/v1/perfectpay-webhook');
                        setCopied('perfectpay');
                        setTimeout(() => setCopied(''), 2000);
                      }}
                      className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors shrink-0"
                      title="Copy PerfectPay Webhook URL"
                    >
                      {copied === 'perfectpay' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Paste this URL in PerfectPay Webhooks settings for <strong>Sale Approved</strong>.
                  </p>
                </div>

                {/* 4. Logs de Webhooks */}
                <WebhookLogsSection />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WebhookLogsSection() {
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_webhook_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [expandedLogId, setExpandedLogId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWebhookLogs = async () => {
    setIsRefreshing(true);
    try {
      if (db) {
        const q = query(collection(db, 'webhook_logs'), orderBy('created_at', 'desc'), limit(50));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const formatted = snap.docs.map(doc => {
            const item = doc.data();
            return {
              id: doc.id,
              platform: item.platform || 'Webhook',
              event: item.event || 'sale_approved',
              status: item.status || 'Aprovado',
              email: item.customer_email || item.email || '-',
              product: item.product_name || item.product || '-',
              date: item.created_at || new Date().toLocaleString('pt-BR'),
              payload: item.payload || item
            };
          });
          setLogs(formatted);
          localStorage.setItem('hopejourney_webhook_logs', JSON.stringify(formatted));
        }
      }
    } catch (err) {
      console.warn('Webhook logs notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWebhookLogs();
    const interval = setInterval(fetchWebhookLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden mt-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Logs de Webhooks</h3>
          <p className="text-[11px] text-slate-400">Últimos 50 webhooks recebidos das plataformas</p>
        </div>
        <button
          type="button"
          onClick={fetchWebhookLogs}
          disabled={isRefreshing}
          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
        >
          <span className={isRefreshing ? 'animate-spin inline-block' : ''}>🔄</span>
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/60">
              <th className="py-3 px-4">Plataforma</th>
              <th className="py-3 px-4">Evento</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                  Nenhum webhook recebido ainda. Faça uma compra de teste para visualizar aqui.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const isApproved = log.status?.toLowerCase().includes('aprovad') || log.status?.toLowerCase().includes('approved') || log.status === 'OK' || log.status === '200';
                
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="px-2 py-0.5 rounded-lg font-bold text-[11px] bg-slate-100 text-slate-700 border border-slate-200/60">
                            {log.platform}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {log.event}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{log.date}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable JSON Payload Viewer */}
                    {isExpanded && (
                      <tr className="bg-slate-900 text-emerald-400">
                        <td colSpan={4} className="p-4 font-mono text-[11px] leading-relaxed overflow-x-auto">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[10px] font-sans font-bold">
                            <span>PAYLOAD RECEBIDO ({log.platform}):</span>
                            <span>E-mail: {log.email}</span>
                          </div>
                          <pre className="whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {typeof log.payload === 'object' ? JSON.stringify(log.payload, null, 2) : log.payload}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
