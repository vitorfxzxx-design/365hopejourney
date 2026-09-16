import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Edit2,
  Mail,
  LogOut,
  Bell,
  Check,
  ChevronRight,
  ArrowRight,
  Shield,
  Sparkles,
  Zap,
  Plus,
  X,
  LifeBuoy,
  MessageSquare,
  CreditCard,
  FileText,
  Calendar,
  Star,
  Send,
  Settings as SettingsIcon,
  CheckCircle2,
  Globe,
  ExternalLink,
  Lock,
  Image as ImageIcon,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';

export default function ProfileView() {
  const { logout, deleteAccount, updateMemberProfile, currentUser, credits, addCredits, openRechargeModal, members, getUserCreditTransactions, setCurrentTab } = useEbooks();

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Active language state (EN / ES)
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('hopejourney_lang') || 'en';
  });

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('hopejourney_lang', newLang);
  };

  // Helper to format any date string into Month + Year (e.g., "09/08/2026" or "2026-09-08" -> "Sep 2026" / "Sept 2026")
  const formatMemberSince = (rawDate, targetLang = 'en') => {
    if (!rawDate) return targetLang === 'es' ? 'Sept 2026' : 'Sep 2026';

    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'];
    const months = targetLang === 'es' ? monthNamesEs : monthNamesEn;

    // If it's already a formatted string like "Sep 2026"
    if (/^[A-Za-z]{3,4}\s+\d{4}$/.test(rawDate.trim())) {
      return rawDate.trim();
    }

    try {
      // Check for formats like "9/8/2026" or "09/08/2026" or "01/09/2026"
      const parts = rawDate.split(/[\/\-.]/);
      if (parts.length === 3) {
        let monthIdx = -1;
        let year = '2026';

        if (parts[2].length === 4) {
          // Format: M/D/YYYY or D/M/YYYY
          const first = parseInt(parts[0], 10);
          const second = parseInt(parts[1], 10);
          year = parts[2];

          // If first > 12, then it is DD/MM/YYYY
          if (first > 12 && second >= 1 && second <= 12) {
            monthIdx = second - 1;
          } else if (first >= 1 && first <= 12) {
            // Default to MM/DD/YYYY standard
            monthIdx = first - 1;
          }
        } else if (parts[0].length === 4) {
          // YYYY-MM-DD
          year = parts[0];
          monthIdx = parseInt(parts[1], 10) - 1;
        }

        if (monthIdx >= 0 && monthIdx < 12) {
          return `${months[monthIdx]} ${year}`;
        }
      }

      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        return `${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
      }
    } catch (e) {}

    return targetLang === 'es' ? 'Sept 2026' : 'Sep 2026';
  };

  // Find member's actual registration date
  const userEmail = (currentUser?.email || 'grace@gmail.com').toLowerCase();
  const currentMemberRecord = members?.find(m => (m.email || '').toLowerCase() === userEmail);
  const realRegistrationDate = currentMemberRecord?.date || '09/08/2026';

  // User Profile
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          memberSince: parsed.memberSince || formatMemberSince(realRegistrationDate, lang)
        };
      }
      if (currentUser) {
        return {
          name: currentUser.name || 'Grace Taylor',
          email: currentUser.email || 'grace@gmail.com',
          avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          memberSince: formatMemberSince(realRegistrationDate, lang)
        };
      }
      return {
        name: 'Grace Taylor',
        email: 'grace@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        memberSince: formatMemberSince(realRegistrationDate, lang)
      };
    } catch (e) {
      return {
        name: 'Grace Taylor',
        email: 'grace@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        memberSince: formatMemberSince(realRegistrationDate, lang)
      };
    }
  });

  // Keep synced if currentUser or registration record changes
  useEffect(() => {
    const formattedSince = formatMemberSince(currentMemberRecord?.date || realRegistrationDate, lang);
    const updated = {
      name: currentUser?.name || profile.name || 'Grace Taylor',
      email: currentUser?.email || profile.email || 'grace@gmail.com',
      avatar: currentUser?.avatar || profile.avatar,
      memberSince: formattedSince
    };
    setProfile(updated);
    setEditName(updated.name);
    setEditEmail(updated.email);
    setEditAvatar(updated.avatar);
    localStorage.setItem('hopejourney_user_profile', JSON.stringify(updated));
  }, [currentUser, currentMemberRecord, lang]);


  // Check if current logged in user is admin
  const isUserAdmin = currentUser?.role === 'admin' ||
    (currentUser?.email || '').toLowerCase() === 'vitorfxzxx@gmail.com' ||
    (profile?.email || '').toLowerCase() === 'vitorfxzxx@gmail.com' ||
    (currentUser?.name || '').toLowerCase().includes('admin');

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'edit_profile' | 'support' | 'feedback' | 'subscription' | 'history' | 'policies' | 'settings' | null

  // Edit form state
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);

  // Helper to handle image file and compress it
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setEditAvatar(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Push notifications state
  const [pushEnabled, setPushEnabled] = useState(() => {
    try {
      return localStorage.getItem('hopejourney_push_enabled') === 'true';
    } catch (e) {
      return true;
    }
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updated = { ...profile, name: editName, email: editEmail, avatar: editAvatar };
    setProfile(updated);
    if (updateMemberProfile) {
      await updateMemberProfile({ name: editName, email: editEmail, avatar: editAvatar });
    }
    localStorage.setItem('hopejourney_user_profile', JSON.stringify(updated));
    setActiveModal(null);
  };

  const handleSendFeedback = (e) => {
    e.preventDefault();
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackText('');
      setActiveModal(null);
    }, 1800);
  };

  const handleLogout = () => {
    if (window.confirm(lang === 'es' ? '¿Estás seguro de que deseas cerrar sesión?' : 'Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMsg = lang === 'es'
      ? '¿Estás seguro de que deseas eliminar permanentemente tu cuenta? Todos tus datos y oraciones guardadas se eliminarán de forma irreversible.'
      : 'Are you sure you want to permanently delete your account? All your personal data, spiritual journey progress, and saved prayers will be irreversibly erased.';
    
    if (window.confirm(confirmMsg)) {
      setActiveModal(null);
      await deleteAccount(profile.email);
    }
  };

  // Content translations
  const t = {
    en: {
      memberSince: 'MEMBER SINCE',
      credits: 'Grace Credits',
      editProfile: 'Edit Profile',
      manageSubs: 'Manage Subscriptions',
      manageSubsDesc: 'View and manage your active plans',
      settingsAndSupport: 'Settings and Support',
      settingsSubtitle: 'Manage your account, get help and customize your spiritual journey.',
      helpSupport: 'Help & Support',
      helpSupportDesc: 'Get help with your account',
      feedbacks: 'Feedbacks',
      feedbacksDesc: 'Share your thoughts and prayer praises',
      manageSubscriptionsItem: 'Manage Subscriptions',
      manageSubscriptionsDesc: 'Plan Information and Access',
      historyCredits: 'History Credits',
      historyCreditsDesc: 'View your usage and prayer credit transactions',
      policies: 'Policies',
      policiesDesc: 'Terms, Privacy & Subscription policies',
      logout: 'Log Out',
      addCredits: 'Add Credits',
      vipTag: 'VIP Member',
      pushNotifications: 'Push Notifications',
      pushNotificationsDesc: 'Get daily morning devotional & prayer reminders',
      pushEnabledBadge: 'Active',
      pushDisabledBadge: 'Disabled',
      pushEnableBtn: 'Enable',
      pushDisableBtn: 'Disable',
      deleteAccount: 'Delete Account',
      deleteAccountDesc: 'Permanently remove your account and all data',
      dangerZone: 'Danger Zone',
      spiritualDisclaimerTitle: 'Faith & Spiritual Purpose Disclaimer',
      spiritualDisclaimerText: 'DailyGrace devotionals, prayer audios, and AI Spiritual Guide are designed for spiritual inspiration, faith building, and daily reflection. They do not substitute professional mental health therapy or clinical counseling.'
    },
    es: {
      memberSince: 'MIEMBRO DESDE',
      credits: 'Hope Credits',
      editProfile: 'Editar Perfil',
      manageSubs: 'Gestionar Suscripciones',
      manageSubsDesc: 'Ver y administrar tus planes activos',
      settingsAndSupport: 'Configuración y Soporte',
      settingsSubtitle: 'Administra tu cuenta, recibe ayuda y personaliza tu experiencia espiritual.',
      helpSupport: 'Ayuda y Soporte',
      helpSupportDesc: 'Recibe ayuda con tu cuenta',
      feedbacks: 'Comentarios',
      feedbacksDesc: 'Comparte tus testimonios y opiniones',
      manageSubscriptionsItem: 'Gestionar Suscripciones',
      manageSubscriptionsDesc: 'Información del plan y cancelaciones',
      historyCredits: 'Historial de Créditos',
      historyCreditsDesc: 'Revisa tu historial de uso y créditos',
      policies: 'Políticas',
      policiesDesc: 'Términos, Privacidad y Políticas de suscripción',
      logout: 'Cerrar Sesión',
      addCredits: 'Recargar',
      vipTag: 'Miembro VIP',
      pushNotifications: 'Notificaciones Push',
      pushNotificationsDesc: 'Recibe recordatorios diarios de oración y devocionales',
      pushEnabledBadge: 'Activo',
      pushDisabledBadge: 'Desactivado',
      pushEnableBtn: 'Activar',
      pushDisableBtn: 'Desactivar',
      deleteAccount: 'Eliminar Cuenta',
      deleteAccountDesc: 'Eliminar permanentemente tu cuenta y todos los datos',
      dangerZone: 'Zona de Peligro',
      spiritualDisclaimerTitle: 'Exención de Responsabilidad Espiritual',
      spiritualDisclaimerText: 'Los contenidos de 365hopejourney y la Guía Espiritual IA tienen un propósito de edificación de fe y reflexión personal.'
    }
  }[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-teal-50/20 to-slate-50/60 p-4 max-w-md mx-auto pb-28 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Glass Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/95 via-emerald-50/30 to-white/90 border border-emerald-100 shadow-sm p-5 space-y-4.5">
        
        {/* Decorative soft emerald glows */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-100/30 rounded-full blur-2xl pointer-events-none" />

        {/* Top Control Bar: Language Switcher + Edit Profile + Settings Gear */}
        <div className="flex items-center justify-between relative z-10">
          
          {/* EN / ES Language Toggle Pill */}
          <div className="flex items-center bg-white border border-emerald-100 shadow-2xs rounded-full p-0.5">
            <button
              onClick={() => handleSetLang('en')}
              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                lang === 'en'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span>🇺🇸</span>
              <span>EN</span>
            </button>
            <button
              onClick={() => handleSetLang('es')}
              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                lang === 'es'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span>🇪🇸</span>
              <span>ES</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Profile Pill */}
            <button
              onClick={() => setActiveModal('edit_profile')}
              className="flex items-center gap-1.5 bg-white hover:bg-emerald-50/80 border border-emerald-100 text-slate-700 hover:text-emerald-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs transition-all active:scale-95"
            >
              <Edit2 size={12} className="text-emerald-600" />
              <span>{t.editProfile}</span>
            </button>

            {/* Settings Gear Button (Only for regular members with account actions) */}
            {!isUserAdmin && (
              <button
                onClick={() => setActiveModal('settings')}
                className="w-8 h-8 rounded-full bg-white hover:bg-emerald-50/80 border border-emerald-100 text-slate-600 hover:text-emerald-800 flex items-center justify-center shadow-2xs transition-all active:scale-95"
                title="Settings"
              >
                <SettingsIcon size={14} />
              </button>
            )}
          </div>
        </div>

        {/* User Identity Section: Name on Top, Photo Below Name */}
        <div className="flex flex-col items-center text-center pt-2 pb-1 relative z-10 space-y-3">
          {/* User Name on Top */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight capitalize">
                {profile.name}
              </h2>
              <Sparkles size={18} className="text-emerald-500 shrink-0 fill-emerald-100" />
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                {t.vipTag}
              </span>
            </div>
          </div>

          {/* Avatar Photo below name with proportionate framing */}
          <div className="relative group mt-1">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-500 to-teal-400 p-[3px] shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border-2 border-white">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
            <button
              onClick={() => setActiveModal('edit_profile')}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center border-2 border-white shadow-sm hover:scale-105 transition-all active:scale-95"
              title="Change avatar"
            >
              <Camera size={14} />
            </button>
          </div>
        </div>


        {/* Stats Row: Member Since & Health365 Credits */}
        <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
          
          {/* Member Since Card */}
          <div className="bg-white/95 border border-emerald-100 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
              <Calendar size={17} />
            </div>
            <div className="min-w-0">
              <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                {t.memberSince}
              </span>
              <span className="block text-xs font-bold text-slate-800 truncate">
                {profile.memberSince || 'Jan 2026'}
              </span>
            </div>
          </div>

          {/* Health365 Credits Card */}
          <div
            onClick={openRechargeModal}
            className="bg-white/95 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs cursor-pointer hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap size={17} className="fill-white" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                  Credits
                </span>
                <span className="block text-xs font-black text-slate-900">
                  {credits ?? 20}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openRechargeModal();
              }}
              className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 shrink-0"
              title="Recharge Credits"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Manage Subscriptions Highlight Card (Emerald / Teal gradient) */}
        <button
          onClick={() => setActiveModal('subscription')}
          className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white p-3.5 flex items-center justify-between shadow-md hover:shadow-lg transition-all active:scale-98 text-left group"
        >
          {/* Arc highlight */}
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/15 rounded-full blur-xs pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black tracking-tight">{t.manageSubs}</h4>
              <p className="text-[10px] text-white/85 font-medium truncate">
                {t.manageSubsDesc}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-xs group-hover:translate-x-0.5 transition-transform shrink-0 relative z-10">
            <ArrowRight size={14} />
          </div>
        </button>
      </div>

      {/* Push Notifications Toggle Card - Positioned between User Info Box and Settings & Support */}
      <div className="bg-white/95 border border-emerald-100 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-3 hover:border-emerald-200 transition-all">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bell size={19} className="animate-wiggle" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-900 tracking-tight">
                {t.pushNotifications}
              </h4>
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                pushEnabled
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {pushEnabled ? t.pushEnabledBadge : t.pushDisabledBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
              {t.pushNotificationsDesc}
            </p>
          </div>
        </div>

        {/* Clear, unmistakable Active/Disabled Action Button */}
        <button
          type="button"
          onClick={async () => {
            const nextState = !pushEnabled;
            setPushEnabled(nextState);
            localStorage.setItem('hopejourney_push_enabled', nextState.toString());

            // If enabling, request system browser push permission
            if (nextState && typeof window !== 'undefined' && 'Notification' in window) {
              try {
                let perm = Notification.permission;
                if (perm === 'default') {
                  perm = await Notification.requestPermission();
                }
                if (perm === 'granted') {
                  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                      type: 'SHOW_NOTIFICATION',
                      title: '365hopejourney Daily Push Active! ✨',
                      message: 'You will now receive your daily morning devotionals, prayers, and uplifting scripture reminders.'
                    });
                  } else {
                    new Notification('365hopejourney Daily Push Active! ✨', {
                      body: 'You will now receive your daily morning devotionals, prayers, and uplifting scripture reminders.',
                      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>"
                    });
                  }
                }
              } catch (e) {
                console.warn('Error requesting push permission:', e);
              }
            }
          }}
          className={`py-2 px-3.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 ${
            pushEnabled
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
          }`}
          aria-label="Toggle Push Notifications"
        >
          {pushEnabled ? (
            <>
              <Check size={14} strokeWidth={3} className="text-white" />
              <span>{t.pushDisableBtn}</span>
            </>
          ) : (
            <>
              <Bell size={14} className="text-slate-600" />
              <span>{t.pushEnableBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Settings and Support Section Header */}
      <div className="space-y-1 px-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 tracking-tight font-serif flex items-center gap-1.5">
            <span>{t.settingsAndSupport}</span>
            <Sparkles size={16} className="text-emerald-500 fill-emerald-100" />
          </h3>
          <div className="w-6 h-6 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-xs transform rotate-45" />
          </div>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {t.settingsSubtitle}
        </p>
      </div>

      {/* Settings & Support Navigation List */}
      <div className="space-y-2.5">
        
        {/* Admin Dashboard Entry (Visible for Administrators) */}
        {isUserAdmin && (
          <button
            onClick={() => setCurrentTab('admin')}
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-3.5 flex items-center justify-between shadow-md hover:shadow-lg transition-all text-left group cursor-pointer border border-emerald-500/30 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Shield size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white">
                    Admin Dashboard
                  </h4>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-300 font-bold px-1.5 py-0.5 rounded-full uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  Manage products, members, audios & settings
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:bg-emerald-500 transition-colors shrink-0">
              <ArrowRight size={13} />
            </div>
          </button>
        )}

        {/* 1. Help & Support */}
        <button
          onClick={() => setActiveModal('support')}
          className="w-full bg-white hover:bg-slate-50/90 border border-emerald-100/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all text-left group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100/60">
              <LifeBuoy size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t.helpSupport}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {t.helpSupportDesc}
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-emerald-100 group-hover:text-emerald-700 text-slate-400 flex items-center justify-center transition-colors shrink-0">
            <ArrowRight size={13} />
          </div>
        </button>

        {/* 2. Feedbacks */}
        <button
          onClick={() => setActiveModal('feedback')}
          className="w-full bg-white hover:bg-slate-50/90 border border-emerald-100/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all text-left group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100/60">
              <MessageSquare size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t.feedbacks}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {t.feedbacksDesc}
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-emerald-100 group-hover:text-emerald-700 text-slate-400 flex items-center justify-center transition-colors shrink-0">
            <ArrowRight size={13} />
          </div>
        </button>

        {/* 3. Manage Subscriptions Item */}
        <button
          onClick={() => setActiveModal('subscription')}
          className="w-full bg-white hover:bg-slate-50/90 border border-emerald-100/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all text-left group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
              <CreditCard size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t.manageSubscriptionsItem}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {t.manageSubscriptionsDesc}
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-emerald-100 group-hover:text-emerald-700 text-slate-400 flex items-center justify-center transition-colors shrink-0">
            <ArrowRight size={13} />
          </div>
        </button>

        {/* 4. History Credits */}
        <button
          onClick={() => setActiveModal('history')}
          className="w-full bg-white hover:bg-slate-50/90 border border-emerald-100/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all text-left group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/60">
              <Zap size={18} className="fill-amber-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t.historyCredits}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {t.historyCreditsDesc}
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-emerald-100 group-hover:text-emerald-700 text-slate-400 flex items-center justify-center transition-colors shrink-0">
            <ArrowRight size={13} />
          </div>
        </button>

        {/* 5. Policies */}
        <button
          onClick={() => setActiveModal('policies')}
          className="w-full bg-white hover:bg-slate-50/90 border border-emerald-100/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all text-left group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100/60">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t.policies}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {t.policiesDesc}
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-emerald-100 group-hover:text-emerald-700 text-slate-400 flex items-center justify-center transition-colors shrink-0">
            <ArrowRight size={13} />
          </div>
        </button>
      </div>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full bg-white hover:bg-red-50/60 border border-red-100 text-red-600 rounded-2xl p-3.5 flex items-center justify-center gap-2 font-bold text-xs shadow-2xs transition-all active:scale-98"
        >
          <LogOut size={16} />
          <span>{t.logout}</span>
        </button>
      </div>

      {/* ================= MODALS ================= */}

      {/* EDIT PROFILE MODAL */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-slate-900">{t.editProfile}</h3>

            {/* Hidden file inputs for Camera and Gallery */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="user"
              onChange={handleImageFileChange}
              className="hidden"
            />
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {/* Photo Avatar Preview & Action Buttons */}
            <div className="flex flex-col items-center gap-3 bg-emerald-50/60 border border-emerald-100/80 rounded-2xl p-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-500 to-teal-400 p-[2.5px] shadow-md">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src={editAvatar}
                      alt={editName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Source Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full pt-1">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2 px-3 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                >
                  <Camera size={14} className="text-emerald-600" />
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="py-2 px-3 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                >
                  <ImageIcon size={14} className="text-emerald-600" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HELP & SUPPORT MODAL */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <LifeBuoy size={24} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{t.helpSupport}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Our support team is here to assist you with any questions or prayer inquiries.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <a
                href="mailto:corefysystems@gmail.com?subject=365hopejourney Support Request"
                className="w-full bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-emerald-600" />
                  <span>corefysystems@gmail.com</span>
                </div>
                <ExternalLink size={14} className="text-slate-400" />
              </a>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {activeModal === 'feedback' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <MessageSquare size={24} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{t.feedbacks}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                How has your devotional experience with 365hopejourney been?
              </p>
            </div>

            {feedbackSent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1">
                <CheckCircle2 size={24} className="text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-900">Thank you for your feedback!</h4>
                <p className="text-[11px] text-emerald-700">Your praises and thoughts bless our community.</p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-3">
                {/* Star rating */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={24}
                        className={star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your testimonies, blessings, or suggestions..."
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-2xl p-3 h-24 focus:border-emerald-500 focus:outline-hidden"
                  required
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <Send size={14} />
                  <span>Send Feedback</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MANAGE SUBSCRIPTIONS MODAL */}
      {activeModal === 'subscription' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <CreditCard size={24} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{t.manageSubs}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of your active 365hopejourney membership.
              </p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Plan Status</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check size={11} /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Tier</span>
                <span className="font-bold text-slate-800">VIP Lifetime Sanctuary Access</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Auto-renew</span>
                <span className="font-bold text-slate-800">Lifetime Plan</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* HISTORY CREDITS MODAL */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <Zap size={24} className="fill-amber-400" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{t.historyCredits}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current Balance: <strong className="text-emerald-750 font-black">{credits ?? 20} Grace Credits</strong>
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(() => {
                const txs = getUserCreditTransactions ? getUserCreditTransactions(currentUser?.email || profile.email) : [];
                if (!txs || txs.length === 0) {
                  return (
                    <div className="text-center py-5 text-xs text-slate-400">
                      No credit transactions recorded yet.
                    </div>
                  );
                }
                return txs.map((tx) => (
                  <div key={tx.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block leading-tight">{tx.title}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {tx.subtitle || 'Transaction'} {tx.date ? `• ${tx.date}` : ''}
                      </span>
                    </div>
                    <span className={`font-black text-xs shrink-0 ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`} {tx.amount === 1 ? 'Credit' : 'Credits'}
                    </span>
                  </div>
                ));
              })()}
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                openRechargeModal();
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95 transition-opacity"
            >
              <Sparkles size={14} />
              <span>Recharge Grace Credits</span>
            </button>
          </div>
        </div>
      )}

      {/* POLICIES MODAL */}
      {activeModal === 'policies' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileText size={24} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{t.policies}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                DailyGrace App is committed to privacy, spiritual growth and data protection.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 max-h-56 overflow-y-auto">
              <p className="font-semibold text-slate-800">1. Terms of Use</p>
              <p className="text-[11px] leading-relaxed">
                DailyGrace devotionals, guides, audio sanctuary, and AI Spiritual Guide are designed for spiritual uplifting and personal prayer reflection.
              </p>
              <p className="font-semibold text-slate-800 pt-1">2. Privacy & GDPR</p>
              <p className="text-[11px] leading-relaxed">
                Your personal details, prayers, and reflections are strictly confidential and encrypted.
              </p>
              <p className="font-semibold text-amber-800 pt-1">3. {t.spiritualDisclaimerTitle}</p>
              <p className="text-[11px] leading-relaxed text-amber-900/90 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60">
                {t.spiritualDisclaimerText}
              </p>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS / ACCOUNT MODAL (Only for regular members) */}
      {activeModal === 'settings' && !isUserAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <SettingsIcon size={24} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Account Settings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage your account and data preferences.</p>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-rose-500 block">
                {t.dangerZone}
              </span>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-98"
              >
                <Trash2 size={14} />
                <span>{t.deleteAccount}</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center leading-tight">
                {t.deleteAccountDesc}
              </p>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
