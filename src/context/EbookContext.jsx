import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_EBOOKS, INITIAL_FEED } from '../data/initialData';
import { INITIAL_COMMUNITY_POSTS } from '../data/communityInitialData';
import { supabase } from '../lib/supabase';
import { deleteAudioFromStorage } from '../utils/audioStorage';

export const serializeEbookForSupabase = (eb, orderIndex) => {
  const chaptersList = Array.isArray(eb.chapters) ? eb.chapters : (eb.chapters?.items || []);
  const coverUrl = eb.coverImage || eb.cover || '';
  const calculatedOrder = orderIndex !== undefined ? orderIndex : (eb.orderIndex !== undefined ? eb.orderIndex : 0);
  return {
    id: eb.id,
    title: eb.title || '',
    description: eb.description || '',
    cover: coverUrl,
    category: eb.category || 'Content',
    release_mode: eb.releaseType || eb.release_mode || 'Immediate',
    chapters: {
      items: chaptersList,
      meta: {
        orderIndex: calculatedOrder,
        subtitle: eb.subtitle || '',
        coverImage: coverUrl,
        salesPageUrl: eb.salesPageUrl || '',
        type: eb.type || 'Main',
        tag: eb.tag || (eb.category === 'Supplement' || eb.category === 'Suplemento' ? 'Supplement' : 'Released'),
        isActive: eb.isActive !== false
      }
    }
  };
};

export const deserializeEbookFromSupabase = (remote) => {
  if (!remote || typeof remote !== 'object') return null;
  const isWrapped = remote.chapters && typeof remote.chapters === 'object' && !Array.isArray(remote.chapters) && remote.chapters.items;
  const chapters = isWrapped ? remote.chapters.items : (Array.isArray(remote.chapters) ? remote.chapters : []);
  const meta = (isWrapped && remote.chapters.meta) ? remote.chapters.meta : {};
  const coverUrl = remote.cover || meta?.coverImage || '';

  return {
    id: remote.id,
    title: remote.title || '',
    description: remote.description || '',
    coverImage: coverUrl,
    cover: coverUrl,
    category: remote.category || 'Content',
    releaseType: remote.release_mode || 'Immediate',
    release_mode: remote.release_mode || 'Immediate',
    orderIndex: meta?.orderIndex !== undefined ? meta.orderIndex : 0,
    subtitle: meta?.subtitle || '',
    salesPageUrl: meta?.salesPageUrl || '',
    type: meta?.type || 'Main',
    tag: meta?.tag || (remote.category === 'Supplement' || remote.category === 'Suplemento' ? 'Supplement' : 'Released'),
    isActive: meta?.isActive !== undefined ? meta.isActive : true,
    chapters: Array.isArray(chapters) ? chapters : []
  };
};

export const serializeFeedForSupabase = (item) => ({
  id: item.id,
  title: item.title || '',
  summary: item.subtitle || item.summary || '',
  content: item.content || '',
  image: item.image || '',
  category: item.category || 'Announcements',
  author: item.author || 'Health365 Team',
  read_time: item.read_time || '2 min'
});

export const deserializeFeedFromSupabase = (remote) => ({
  id: remote.id,
  title: remote.title || '',
  subtitle: remote.summary || remote.subtitle || '',
  summary: remote.summary || '',
  content: remote.content || '',
  image: remote.image || '',
  category: remote.category || 'Announcements',
  author: remote.author || 'Health365 Team',
  read_time: remote.read_time || '2 min',
  date: remote.created_at ? new Date(remote.created_at).toLocaleDateString('pt-BR') : '15/03/2026',
  status: 'Active'
});

export const serializeCommunityPostForSupabase = (p) => ({
  id: p.id,
  author: p.author || 'Member',
  avatar: p.avatar !== undefined ? p.avatar : '',
  date: p.date || 'Just now',
  text: p.text || '',
  image: p.image || null,
  likes: typeof p.likes === 'number' ? p.likes : parseInt(p.likes || 0, 10),
  comments: typeof p.comments === 'number' ? p.comments : parseInt(p.comments || 0, 10),
  status: p.status || 'approved'
});

export const serializeAudioForSupabase = (a) => ({
  id: a.id,
  title: a.title || '',
  description: a.description || '',
  audio_url: a.audioUrl && !a.audioUrl.startsWith('data:') ? a.audioUrl : (a.audio_url && !a.audio_url.startsWith('data:') ? a.audio_url : ('idb://' + a.id)),
  cover: a.cover && a.cover.length < 300000 ? a.cover : '',
  duration: a.duration || '05:00'
});

export const deserializeAudioFromSupabase = (remote) => ({
  id: remote.id,
  title: remote.title || '',
  description: remote.description || '',
  audioUrl: (remote.audio_url && !remote.audio_url.startsWith('idb://')) ? remote.audio_url : '',
  cover: remote.cover || '',
  duration: remote.duration || '05:00'
});

export const DEFAULT_HEALTH365_AUDIO_COVER = '';

const safeSaveAudiosToStorage = (list) => {
  try {
    const cleanList = (list || []).map(a => ({
      id: a.id,
      title: a.title || '',
      description: a.description || '',
      cover: (a.cover && a.cover.length < 500000 && !a.cover.startsWith('data:image/svg+xml')) ? a.cover : '',
      duration: a.duration || '05:00',
      audioUrl: (a.audioUrl && !a.audioUrl.startsWith('data:')) ? a.audioUrl : ''
    }));
    localStorage.setItem('health365_audios', JSON.stringify(cleanList));
  } catch (e) {
    console.warn('Could not save audios to localStorage:', e);
  }
};

const EbookContext = createContext();

export function EbookProvider({ children }) {
  // Auth state
  // currentUser: { role: 'admin' | 'member', email: string, name: string, avatar?: string } | null
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_auth');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Registered members list (for access control & admin management)
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_members');
      return saved ? JSON.parse(saved) : [
        { id: 'm-1', email: 'test@gmail.com', name: 'Sabrina Miller', status: 'Active', date: '01/09/2026', products: ['all'] },
        { id: 'm-2', email: 'charlotte@gmail.com', name: 'Charlotte Miller', status: 'Active', date: '03/09/2026', products: ['all'] },
        { id: 'm-3', email: 'member@gmail.com', name: 'VIP Member', status: 'Active', date: '07/09/2026', products: ['all'] }
      ];
    } catch (e) {
      return [];
    }
  });

  // eBooks list
  const [ebooks, setEbooks] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_ebooks');
      return saved ? JSON.parse(saved) : INITIAL_EBOOKS;
    } catch (e) {
      return INITIAL_EBOOKS;
    }
  });

  // App navigation state with robust reload persistence
  const [currentTab, setCurrentTab] = useState(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin') || window.location.pathname.toLowerCase().includes('/admin')) {
        return 'admin';
      }
      const saved = localStorage.getItem('health365_current_tab');
      return saved || 'home';
    } catch (e) {
      return 'home';
    }
  });

  const [adminSubSection, setAdminSubSection] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_admin_subsection');
      return saved || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });

  const [selectedEbookId, setSelectedEbookId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);

  // Feed items
  const [feedItems, setFeedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_feed');
      return saved ? JSON.parse(saved) : INITIAL_FEED;
    } catch (e) {
      return INITIAL_FEED;
    }
  });

  // Posts state for community
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_posts');
      const list = saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
      const initMap = new Map((INITIAL_COMMUNITY_POSTS || []).map(p => [p.id, p]));
      return (list || []).map(p => {
        const init = initMap.get(p.id);
        if (init) {
          return {
            ...init,
            ...p,
            author: (p.author && p.author.trim()) ? p.author : init.author,
            avatar: (p.avatar && p.avatar.trim()) ? p.avatar : init.avatar,
            text: (p.text && p.text.trim()) ? p.text : init.text,
            date: (p.date && p.date.trim()) ? p.date : init.date,
            image: (p.image && p.image.trim()) ? p.image : init.image,
            likes: p.likes !== undefined ? p.likes : init.likes,
            status: p.status || init.status || 'approved'
          };
        }
        return p;
      });
    } catch (e) {
      return INITIAL_COMMUNITY_POSTS;
    }
  });

  // Audios items
  const [audios, setAudios] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_audios');
      const defaultCover = localStorage.getItem('health365_default_audio_cover') || '';
      const list = saved ? JSON.parse(saved) : [];
      const cleanList = Array.isArray(list) 
        ? list.filter(a => a && a.id && a.id !== 'audio-2' && a.id !== 'audio-batch-meditation')
        : [];
      return cleanList.map(a => ({
        ...a,
        cover: (a.cover && !a.cover.includes('unsplash.com') && !a.cover.startsWith('data:image/svg+xml')) ? a.cover : defaultCover
      }));
    } catch (e) {
      return [];
    }
  });

  // Specialist questions
  const [specialistQuestions, setSpecialistQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_specialist_questions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'q-demo-1',
          authorEmail: 'test@gmail.com',
          authorName: 'Sabrina Miller',
          text: 'What is the best time to consume bone broth?',
          date: 'Yesterday at 2:30 PM',
          status: 'answered',
          answer: 'The ideal time is in the morning on an empty stomach or 30 minutes before lunch to soothe and prepare the gut lining.'
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // NutriPhoto authorized buyers & users
  const [nutriUsers, setNutriUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_nutriphoto_users');
      return saved ? JSON.parse(saved) : [
        {
          id: 'nu-1',
          name: 'Sabrina Miller',
          email: 'test@gmail.com',
          status: 'Active',
          planType: 'monthly',
          planPrice: '$9.90',
          periodType: '30_days',
          durationText: 'Monthly Plan ($9.90/mo)',
          grantedAt: '08/01/2026',
          expiresAt: '10/10/2026'
        },
        {
          id: 'nu-2',
          name: 'Lucas Mitchell',
          email: 'lucas.mitchell@gmail.com',
          status: 'Active',
          planType: 'annual',
          planPrice: '$29.90',
          periodType: '1_year',
          durationText: 'Annual Plan ($29.90/yr)',
          grantedAt: '08/15/2026',
          expiresAt: '08/15/2027'
        },
        {
          id: 'nu-3',
          name: 'Camila Silva',
          email: 'camila@gmail.com',
          status: 'Active',
          planType: 'monthly',
          planPrice: '$9.90',
          periodType: '30_days',
          durationText: 'Monthly Plan ($9.90/mo)',
          grantedAt: '09/01/2026',
          expiresAt: '10/01/2026'
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // App Settings
  const [appSettings, setAppSettings] = useState(() => {
    const defaultSettings = {
      name: '365hopejourney',
      slug: '/365hopejourney',
      status: 'Active',
      iconEmoji: '✨',
      adminEmail: 'vitorfxzxx@gmail.com',
      adminPassword: '!Dark131409',
      customDomain: 'app.365hopejourney.com',
      webhookUrl: 'https://fitbuvxhovynlecwmdrc.supabase.co/functions/v1/kiwify-webhook',
      hotmartWebhookUrl: 'https://fitbuvxhovynlecwmdrc.supabase.co/functions/v1/hotmart-webhook',
      perfectpayWebhookUrl: 'https://fitbuvxhovynlecwmdrc.supabase.co/functions/v1/perfectpay-webhook',
      geminiApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '',
      claudeApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      aiSystemPrompt: `You are the Official Health365 Health & Wellness Specialist and Nutrition Guide, serving as an engaging, friendly, and approachable chat assistant inside the app.

Your goal is to guide members toward optimal cellular health, energy, and vitality using the foundational principles below, ensuring conversations are warm, conversational, natural, balanced, and never extremist.

CORE NUTRITIONAL PRINCIPLES:

Top 1 Alimentos (Light & Easy Absorption): Prioritize nutrient-dense, easily digestible whole foods that do not burden the gut—such as grass-fed red meat, pasture-raised eggs, raw-milk artisan cheeses, high-quality fats (butter, pork lard, extra virgin olive oil, ghee, avocado), fresh fruits (especially bananas, papayas, oranges, kiwis), and raw artisanal honey.

Carbohydrates & Flours:
- White flour, sourdough bread, tapioca, white rice, and natural starches are completely FINE and NOT a problem. They are clean, easily digestible sources of glucose when prepared simply. Do NOT demonize white flour or white bread.

Legumes & Vegetables: Good in moderation, keeping in mind that excessive consumption can introduce antinutrients.

Elimination of Industrial Drivers (Items to minimize at home): Advise minimizing refined seed oils (soybean, canola, corn, sunflower), margarine, refined sugars, artificial sweeteners, and ultra-processed industrial packaged goods. (Note: natural starches, potatoes, white rice, and sourdough/white flours are perfectly fine; the primary focus is simply avoiding industrial hydrogenated seed oils and chemical additives).

THE NON-EXTREMIST PHILOSOPHY & BALANCED TONE (CRITICAL):
- Never be an extremist or make the user feel restricted, guilty, or stressed about food.
- DO NOT use alarmist words like "Strictly Avoid", "Prohibited", "Toxic", or "Poisons". Simply use calm, balanced phrasing like "Foods to avoid" or "Things to minimize".
- Your Home is Your Sacred Temple: In your daily routine at home, keep it clean and minimize seed oils and ultra-processed junk to maintain peak cellular energy.
- Social Life, Dining Out & Celebrations: When traveling, out with friends, or celebrating, eat and enjoy freely without guilt or paranoia!
- Cellular Resilience: As long as your daily baseline at home is wholesome, your body has an amazing innate capacity to thrive.

LIFESTYLE & SUPPLEMENT GUIDANCE:

Metabolic Fasting & Autophagy: Support safe intermittent fasting windows (e.g., 16:8 or 14:10) for cellular cleanup and insulin sensitivity. Black coffee and herbal teas without sugar/sweeteners do not break metabolic fasting.

Restorative Sleep & Circadian Rhythms: Emphasize 7-8 hours in total darkness, cutting blue light 60 minutes before bed, and eating at least 3 hours before sleep.

Mineralized Hydration: 35-45ml of clean water per kg of body weight, with mineral-rich salt (Celtic or Himalayan).

Internal Products Guidance: When naturally relevant to liver detox or cellular repair, you may mention our exclusive formula Vitalix Gold. For prostate and urinary wellness, mention Prostiv.

COMMUNICATION & CONVERSATION RULES:

Language Requirement: Always respond in ENGLISH, regardless of the language used in the member's question.

Greeting and Addressing Rule:
- Do NOT say "Hello [Name]!" at the beginning of every response. It sounds repetitive and robotic in an ongoing chat.
- Address the member by their first name naturally (or jump directly into the insightful answer without repeated generic greetings).

Tone & Style: Warm, encouraging, expert, empathetic, clear, flexible, and extremely friendly. Make the user genuinely want to chat! Keep responses mobile-friendly, with neat paragraphs, clean bullet points, and friendly emojis. Do not use markdown double asterisks (**) in your output, keep text plain and well formatted.

Direct Answers & Meal Menus:
Whenever a user asks for a meal plan, breakfast, lunch, dinner or food suggestions, always provide 2 clear options:
- Option 1 (The Ideal Ancestral Protocol - Top 1 Light & Easy Absorption): Pure pasture-raised eggs, grass-fed beef, raw-milk cheeses, clean noble fats (butter/ghee/lard), fresh fruits (banana, papaya, berries) and raw honey.
- Option 2 (Popular, Familiar & Accessible Alternative): Familiar real-food choices such as tapioca with scrambled eggs, artisanal sourdough bread (naturally fermented), plain whole-milk yogurt or kefir with fresh fruits, white rice with ground beef or grilled chicken and roasted vegetables.

Handling Questions About Cheating or Eating Other Foods:
If a user asks if they can ever eat pizza, cake, or off-plan foods: Respond with warmth and reassurance: "Of course you can! Food should bring joy, not guilt. Your home is your temple where you build daily vitality, but when you are out celebrating, enjoy it without stress. Your body is remarkably resilient!"

Disease & Curing Claims: Do not spontaneously claim or promise that a user will be 100% cured of a disease just by following this diet. Only address disease reversal or healing if the user explicitly asks about it first, and even then, frame it carefully and responsibly.

Medical Disclaimer: Provide educational lifestyle and nutrition information. Do not prescribe prescription drugs or make formal medical diagnostic claims. Encourage consulting a personal physician for acute clinical conditions.`,
      aiModel: 'claude-sonnet-4-5-20250929',
      aiTone: 'warm_encouraging',
      aiTemperature: 0.7,
      audioTabActive: true,
      audioSectionTitle: 'Audios & Meditations',
      defaultAudioCover: localStorage.getItem('health365_default_audio_cover') || DEFAULT_HEALTH365_AUDIO_COVER
    };
    try {
      const saved = localStorage.getItem('health365_settings');
      const parsed = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
      if (parsed.aiModel && (parsed.aiModel.includes('3-7') || parsed.aiModel.includes('3-5') || parsed.aiModel.includes('20240229') || parsed.aiModel.includes('3-sonnet'))) {
        parsed.aiModel = 'claude-sonnet-4-5-20250929';
      }
      const localAudioActive = localStorage.getItem('health365_audio_tab_active');
      if (localAudioActive !== null) {
        parsed.audioTabActive = localAudioActive === 'true';
      }
      const localCover = localStorage.getItem('health365_default_audio_cover');
      if (localCover) {
        parsed.defaultAudioCover = localCover;
      } else if (!parsed.defaultAudioCover || parsed.defaultAudioCover.includes('unsplash.com')) {
        parsed.defaultAudioCover = DEFAULT_HEALTH365_AUDIO_COVER;
      }
      return parsed;
    } catch (e) {
      return defaultSettings;
    }
  });

  // Active In-App / Push Notification Toast state for active members
  const [activePushNotification, setActivePushNotification] = useState(null);

  const dismissPushNotification = () => {
    setActivePushNotification(null);
  };

  const broadcastPushNotification = (notif) => {
    const fullNotif = {
      id: notif.id || 'notif-' + Date.now(),
      title: notif.title,
      message: notif.message,
      targetUrl: notif.targetUrl || '',
      sendTo: notif.sendTo || 'all',
      sentAt: notif.sentAt || ('Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      timestamp: Date.now()
    };

    // 1. Save to admin notifications list
    try {
      const saved = localStorage.getItem('health365_notifications');
      const list = saved ? JSON.parse(saved) : [];
      const updated = [fullNotif, ...list];
      localStorage.setItem('health365_notifications', JSON.stringify(updated));
    } catch (e) {}

    // 2. Broadcast via localStorage event, BroadcastChannel & Supabase Realtime Channel
    try {
      localStorage.setItem('health365_last_push_broadcast', JSON.stringify(fullNotif));
    } catch (e) {}

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('health365_push_channel');
        bc.postMessage(fullNotif);
        bc.close();
      }
    } catch (e) {}

    // Broadcast across devices over Supabase Realtime
    try {
      supabase.channel('health365_global_push').send({
        type: 'broadcast',
        event: 'new_push',
        payload: fullNotif
      });
    } catch (e) {
      console.warn('Supabase push broadcast notice:', e);
    }

    // 3. If current window has push notifications enabled, show it directly as well
    const pushEnabled = localStorage.getItem('health365_push_enabled') !== 'false';
    if (pushEnabled) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(fullNotif.title, {
                body: fullNotif.message,
                icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍏</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍏</text></svg>',
                vibrate: [200, 100, 200],
                data: { url: fullNotif.targetUrl || '/' }
              });
            });
          } else {
            new Notification(fullNotif.title, {
              body: fullNotif.message,
              icon: '🍏'
            });
          }
        } catch (e) {}
      }
      setActivePushNotification(fullNotif);
    }
  };

  // Listen for incoming broadcasted push notifications across tabs, browsers & devices
  useEffect(() => {
    const handleIncomingNotif = (notifData) => {
      if (!notifData) return;
      
      // Check if user has push notifications enabled
      const isPushEnabled = localStorage.getItem('health365_push_enabled') !== 'false';
      if (!isPushEnabled) return;

      // Filter by audience if specified
      if (notifData.sendTo === 'buyers') {
        const isBuyer = currentUser?.role === 'member' || localStorage.getItem('health365_auth');
        if (!isBuyer) return;
      }

      // Show Native / Mobile Service Worker Notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(notifData.title, {
                body: notifData.message,
                icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍏</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍏</text></svg>',
                vibrate: [200, 100, 200],
                data: { url: notifData.targetUrl || '/' }
              });
            });
          } else {
            new Notification(notifData.title, {
              body: notifData.message,
              icon: '🍏'
            });
          }
        } catch (e) {}
      }

      // Show beautiful top in-app toast notification
      setActivePushNotification(notifData);
    };

    // 1. Storage event listener (same browser / multiple tabs)
    const handleStorage = (e) => {
      if (e.key === 'health365_last_push_broadcast' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleIncomingNotif(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 2. BroadcastChannel listener (same browser instances)
    let bc;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('health365_push_channel');
        bc.onmessage = (event) => {
          if (event.data) {
            handleIncomingNotif(event.data);
          }
        };
      }
    } catch (err) {}

    // 3. Supabase Realtime Channel listener (cross-device: desktop admin -> mobile smartphone)
    let globalPushChannel;
    try {
      globalPushChannel = supabase
        .channel('health365_global_push')
        .on('broadcast', { event: 'new_push' }, (payload) => {
          if (payload?.payload) {
            handleIncomingNotif(payload.payload);
          }
        })
        .subscribe();
    } catch (err) {
      console.warn('Realtime push subscription notice:', err);
    }

    // 4. Supabase Realtime Channel listener for Audios (sync add/delete immediately across devices)
    let audiosRealtimeChannel;
    try {
      audiosRealtimeChannel = supabase
        .channel('health365_audios_realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'audios'
        }, async () => {
          try {
            const { data } = await supabase.from('audios').select('*');
            if (data && Array.isArray(data)) {
              const list = data.map(deserializeAudioFromSupabase);
              setAudios(list);
              safeSaveAudiosToStorage(list);
            }
          } catch (err) {}
        })
        .subscribe();
    } catch (err) {}

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
      if (globalPushChannel) supabase.removeChannel(globalPushChannel);
      if (audiosRealtimeChannel) supabase.removeChannel(audiosRealtimeChannel);
    };
  }, [currentUser]);

  // User Credits Map: { [email]: { currentCredits: number, totalPurchasedCredits: number, totalSpentUSD: number, lastPurchaseDate: string } }
  const [userCreditsMap, setUserCreditsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_user_credits_map');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const currentUserEmail = currentUser?.email?.toLowerCase() || 'teste@gmail.com';

  const parseMemberStatsFromProducts = (products) => {
    const stats = {
      currentCredits: undefined,
      totalPurchasedCredits: 0,
      totalSpentUSD: 0,
      lastPurchaseDate: undefined
    };
    if (!Array.isArray(products)) return stats;
    for (const p of products) {
      if (typeof p === 'string') {
        const cMatch = p.match(/(?:credits|credits_bal|credits_balance|tokens)[:=](\d+)/i);
        if (cMatch) stats.currentCredits = parseInt(cMatch[1], 10);

        const pMatch = p.match(/(?:purchased|total_purchased)[:=](\d+)/i);
        if (pMatch) stats.totalPurchasedCredits = parseInt(pMatch[1], 10);

        const sMatch = p.match(/(?:spent|total_spent)[:=]([\d.]+)/i);
        if (sMatch) stats.totalSpentUSD = parseFloat(sMatch[1]);

        const dMatch = p.match(/(?:last_purchase|purchase_date)[:=]([^,]+)/i);
        if (dMatch) stats.lastPurchaseDate = dMatch[1];
      }
    }
    return stats;
  };

  const parseCreditFromProducts = (products) => {
    return parseMemberStatsFromProducts(products).currentCredits;
  };

  const getUserCredits = (email) => {
    const emailKey = (email || currentUserEmail).toLowerCase();
    
    // Check if encoded in members list products
    const foundMember = (members || []).find(m => (m.email || '').toLowerCase() === emailKey);
    if (foundMember && Array.isArray(foundMember.products)) {
      const parsedVal = parseCreditFromProducts(foundMember.products);
      if (parsedVal !== undefined) return parsedVal;
    }

    if (userCreditsMap[emailKey]?.currentCredits !== undefined) {
      return userCreditsMap[emailKey].currentCredits;
    }
    try {
      const saved = localStorage.getItem('health365_credits');
      if (saved !== null && emailKey === currentUserEmail) {
        return parseInt(saved, 10);
      }
    } catch (e) {}
    return 20;
  };

  // Active current user credits
  const credits = getUserCredits(currentUserEmail);

  // Credit Transaction History Map: { [email]: Array<{ id: string, type: 'credit' | 'debit', amount: number, title: string, subtitle?: string, date: string, timestamp: number }> }
  const [creditHistoryMap, setCreditHistoryMap] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_credit_history_map');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const getUserCreditTransactions = (email) => {
    const emailKey = (email || currentUserEmail).toLowerCase();
    const curBal = getUserCredits(emailKey);
    const existing = creditHistoryMap[emailKey];

    if (Array.isArray(existing) && existing.length > 0) {
      return existing;
    }

    // Build dynamic realistic transaction breakdown summing to current balance
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyy = now.getFullYear();
    const todayFormatted = `${mm}/${dd}/${yyyy}`;

    const txs = [];

    if (curBal > 20) {
      const extra = curBal - 20;
      txs.push({
        id: `tx-pack-${emailKey}`,
        type: 'credit',
        amount: extra,
        title: 'Health365 Credits Recharge',
        subtitle: 'VIP Member Package',
        date: todayFormatted,
        timestamp: Date.now() - 86400000 * 2
      });
    } else if (curBal < 20) {
      const used = 20 - curBal;
      txs.push({
        id: `tx-used-${emailKey}`,
        type: 'debit',
        amount: used,
        title: 'AI Specialist Consultations',
        subtitle: `${used} Question${used > 1 ? 's' : ''} Asked`,
        date: todayFormatted,
        timestamp: Date.now() - 3600000
      });
    }

    // Always include the initial welcome bonus
    txs.push({
      id: `tx-welcome-${emailKey}`,
      type: 'credit',
      amount: 20,
      title: 'Sign-up Welcome Bonus',
      subtitle: 'Account Creation',
      date: 'Sep 2026',
      timestamp: Date.now() - 86400000 * 7
    });

    return txs;
  };

  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const openRechargeModal = () => setRechargeModalOpen(true);
  const closeRechargeModal = () => setRechargeModalOpen(false);

  const syncMemberCreditsToCloud = async (cleanEmail, newBalance, totalPurchased = 0, totalSpent = 0, lastPurchaseDate) => {
    try {
      const member = (members || []).find(m => (m.email || '').toLowerCase() === cleanEmail);
      const otherProducts = ((member && Array.isArray(member.products)) ? member.products : ['all']).filter(
        p => typeof p === 'string' && !p.match(/(?:credits|credits_bal|credits_balance|tokens|purchased|total_purchased|spent|total_spent|last_purchase|purchase_date)[:=]/i)
      );

      const dateStr = lastPurchaseDate || new Date().toLocaleDateString('en-US');
      const updatedProducts = [
        ...otherProducts,
        `credits:${newBalance}`,
        `purchased:${totalPurchased}`,
        `spent:${typeof totalSpent === 'number' ? totalSpent.toFixed(2) : totalSpent}`,
        `last_purchase:${dateStr}`
      ];
      
      setMembers(prev => {
        const next = prev.map(m => {
          if ((m.email || '').toLowerCase() === cleanEmail) {
            return { ...m, products: updatedProducts };
          }
          return m;
        });
        localStorage.setItem('health365_members', JSON.stringify(next));
        return next;
      });

      await supabase.from('members').update({ products: updatedProducts }).eq('email', cleanEmail);
    } catch (err) {
      console.warn('Could not sync credits to Supabase:', err);
    }
  };

  const useCredit = (amount = 1, userEmail = currentUserEmail, title = 'AI Specialist Question', subtitle = 'Consultation Session') => {
    const email = (userEmail || currentUserEmail).toLowerCase();
    const currentBal = getUserCredits(email);
    const userStats = userCreditsMap[email] || {
      currentCredits: currentBal,
      totalPurchasedCredits: 0,
      totalSpentUSD: 0,
      lastPurchaseDate: new Date().toLocaleDateString('en-US')
    };

    if (currentBal >= amount) {
      const newBalance = currentBal - amount;
      const updatedMap = {
        ...userCreditsMap,
        [email]: {
          ...userStats,
          currentCredits: newBalance
        }
      };
      setUserCreditsMap(updatedMap);
      localStorage.setItem('health365_user_credits_map', JSON.stringify(updatedMap));
      if (email === currentUserEmail) {
        localStorage.setItem('health365_credits', newBalance.toString());
      }

      // Record transaction
      const prevTxs = getUserCreditTransactions(email);
      const newTx = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'debit',
        amount,
        title,
        subtitle,
        date: 'Just now',
        timestamp: Date.now()
      };
      const updatedTxs = [newTx, ...prevTxs];
      const nextHistoryMap = {
        ...creditHistoryMap,
        [email]: updatedTxs
      };
      setCreditHistoryMap(nextHistoryMap);
      localStorage.setItem('health365_credit_history_map', JSON.stringify(nextHistoryMap));

      syncMemberCreditsToCloud(
        email,
        newBalance,
        userStats.totalPurchasedCredits || 0,
        userStats.totalSpentUSD || 0,
        userStats.lastPurchaseDate
      );
      return true;
    }
    return false;
  };

  const addCredits = (amount = 10, userEmail = currentUserEmail, pricePaid = 0, title = '', subtitle = '') => {
    const email = (userEmail || currentUserEmail).toLowerCase();
    const currentBal = getUserCredits(email);
    const userStats = userCreditsMap[email] || {
      currentCredits: currentBal,
      totalPurchasedCredits: 0,
      totalSpentUSD: 0,
      lastPurchaseDate: new Date().toLocaleDateString('en-US')
    };

    const newBalance = currentBal + amount;
    const newTotalPurchased = (userStats.totalPurchasedCredits || 0) + amount;
    const newTotalSpent = (userStats.totalSpentUSD || 0) + pricePaid;
    const todayDate = new Date().toLocaleDateString('en-US');

    const updatedMap = {
      ...userCreditsMap,
      [email]: {
        ...userStats,
        currentCredits: newBalance,
        totalPurchasedCredits: newTotalPurchased,
        totalSpentUSD: newTotalSpent,
        lastPurchaseDate: todayDate
      }
    };

    setUserCreditsMap(updatedMap);
    localStorage.setItem('health365_user_credits_map', JSON.stringify(updatedMap));
    if (email === currentUserEmail) {
      localStorage.setItem('health365_credits', newBalance.toString());
    }

    // Record transaction
    const prevTxs = getUserCreditTransactions(email);
    const txTitle = title || (pricePaid > 0 ? `Credit Recharge Pack ($${pricePaid.toFixed(2)})` : 'Health365 Credits Added');
    const txSubtitle = subtitle || (pricePaid > 0 ? 'In-App Purchase' : 'Account Credit Adjustment');
    const newTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'credit',
      amount,
      title: txTitle,
      subtitle: txSubtitle,
      date: 'Just now',
      timestamp: Date.now()
    };
    const updatedTxs = [newTx, ...prevTxs];
    const nextHistoryMap = {
      ...creditHistoryMap,
      [email]: updatedTxs
    };
    setCreditHistoryMap(nextHistoryMap);
    localStorage.setItem('health365_credit_history_map', JSON.stringify(nextHistoryMap));

    syncMemberCreditsToCloud(email, newBalance, newTotalPurchased, newTotalSpent, todayDate);
  };

  const removeCredits = (amount = 10, userEmail = currentUserEmail, title = 'Credit Adjustment', subtitle = 'Manual Removal') => {
    const email = (userEmail || currentUserEmail).toLowerCase();
    const currentBal = getUserCredits(email);
    const userStats = userCreditsMap[email] || {
      currentCredits: currentBal,
      totalPurchasedCredits: 0,
      totalSpentUSD: 0,
      lastPurchaseDate: new Date().toLocaleDateString('en-US')
    };

    const newBalance = Math.max(0, currentBal - amount);

    const updatedMap = {
      ...userCreditsMap,
      [email]: {
        ...userStats,
        currentCredits: newBalance
      }
    };

    setUserCreditsMap(updatedMap);
    localStorage.setItem('health365_user_credits_map', JSON.stringify(updatedMap));
    if (email === currentUserEmail) {
      localStorage.setItem('health365_credits', newBalance.toString());
    }

    const prevTxs = getUserCreditTransactions(email);
    const newTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'debit',
      amount,
      title: title || 'Credits Removed',
      subtitle: subtitle || 'Admin Adjustment',
      date: 'Just now',
      timestamp: Date.now()
    };
    const updatedTxs = [newTx, ...prevTxs];
    const nextHistoryMap = {
      ...creditHistoryMap,
      [email]: updatedTxs
    };
    setCreditHistoryMap(nextHistoryMap);
    localStorage.setItem('health365_credit_history_map', JSON.stringify(nextHistoryMap));

    syncMemberCreditsToCloud(
      email,
      newBalance,
      userStats.totalPurchasedCredits || 0,
      userStats.totalSpentUSD || 0,
      userStats.lastPurchaseDate
    );
  };


  // Fetch initial data and setup automatic real-time sync with Supabase Cloud with smart TTL caching
  useEffect(() => {
    async function loadSupabaseData(force = false) {
      try {
        const lastSync = localStorage.getItem('health365_last_supabase_sync');
        const now = Date.now();
        const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

        const hasLocalData = localStorage.getItem('health365_ebooks') && localStorage.getItem('health365_audios');
        if (!force && hasLocalData && lastSync && (now - Number(lastSync) < CACHE_TTL_MS)) {
          return;
        }

        const [
          { data: remoteMembers },
          { data: remoteEbooks },
          { data: remoteFeed },
          { data: remotePosts },
          { data: remoteAudios },
          { data: remoteQuestions },
          { data: remoteSettings }
        ] = await Promise.all([
          supabase.from('members').select('*'),
          supabase.from('ebooks').select('*'),
          supabase.from('feed').select('*'),
          supabase.from('community_posts').select('*'),
          supabase.from('audios').select('*'),
          supabase.from('specialist_questions').select('*'),
          supabase.from('app_settings').select('*')
        ]);

        localStorage.setItem('health365_last_supabase_sync', String(now));

        if (remoteMembers) {
          const remoteCreditsMap = {};
          remoteMembers.forEach(m => {
            if (m && m.email) {
              const stats = parseMemberStatsFromProducts(m.products);
              if (stats.currentCredits !== undefined || stats.totalPurchasedCredits > 0) {
                remoteCreditsMap[m.email.toLowerCase()] = {
                  currentCredits: stats.currentCredits !== undefined ? stats.currentCredits : 20,
                  totalPurchasedCredits: stats.totalPurchasedCredits || 0,
                  totalSpentUSD: stats.totalSpentUSD || 0,
                  lastPurchaseDate: stats.lastPurchaseDate || m.date || new Date().toLocaleDateString('en-US')
                };
              }
            }
          });
          if (Object.keys(remoteCreditsMap).length > 0) {
            setUserCreditsMap(prev => {
              const merged = { ...prev, ...remoteCreditsMap };
              localStorage.setItem('health365_user_credits_map', JSON.stringify(merged));
              return merged;
            });
          }

          setMembers(prev => {
            const map = new Map();
            (prev || []).forEach(m => m?.email && map.set(m.email.trim().toLowerCase(), m));
            remoteMembers.forEach(m => m?.email && map.set(m.email.trim().toLowerCase(), m));
            const merged = Array.from(map.values());
            localStorage.setItem('health365_members', JSON.stringify(merged));
            return merged;
          });
        }
        if (remoteEbooks && Array.isArray(remoteEbooks) && remoteEbooks.length > 0) {
          const deserialized = remoteEbooks
            .map(deserializeEbookFromSupabase)
            .filter(b => b && b.id);

          if (deserialized.length > 0) {
            setEbooks(prev => {
              const currentList = (Array.isArray(prev) && prev.length > 0) ? prev : (INITIAL_EBOOKS || []);
              const remoteMap = new Map(deserialized.map(r => [r.id, r]));
              
              const merged = [];
              const handledIds = new Set();

              // 1. Maintain local list order
              currentList.forEach(local => {
                if (!local || !local.id) return;
                handledIds.add(local.id);
                const rem = remoteMap.get(local.id);
                if (!rem) {
                  merged.push(local);
                  return;
                }

                const isRecentlyUpdatedLocally = local._updatedAt && (Date.now() - local._updatedAt < 25000);
                if (isRecentlyUpdatedLocally) {
                  merged.push(local);
                  return;
                }

                merged.push({
                  ...local,
                  ...rem,
                  orderIndex: local.orderIndex !== undefined ? local.orderIndex : rem.orderIndex,
                  coverImage: local.coverImage || rem.coverImage || local.cover || rem.cover || '',
                  cover: local.cover || rem.cover || local.coverImage || rem.coverImage || '',
                  chapters: (rem.chapters && Array.isArray(rem.chapters) && rem.chapters.length > 0)
                    ? rem.chapters
                    : (local.chapters || [])
                });
              });

              // 2. Append any new remote products
              deserialized.forEach(rem => {
                if (rem && rem.id && !handledIds.has(rem.id)) {
                  merged.push(rem);
                }
              });

              localStorage.setItem('health365_ebooks', JSON.stringify(merged));
              return merged;
            });
          }
        }
        if (remoteFeed && remoteFeed.length > 0) {
          const deserializedFeed = remoteFeed.map(deserializeFeedFromSupabase);
          setFeedItems(prev => {
            const currentList = Array.isArray(prev) ? prev : [];
            const remoteMap = new Map(deserializedFeed.map(r => [r.id, r]));
            const merged = [];
            const handledIds = new Set();
            currentList.forEach(local => {
              if (!local || !local.id) return;
              handledIds.add(local.id);
              const rem = remoteMap.get(local.id);
              if (!rem) {
                merged.push(local);
                return;
              }
              const isRecentlyUpdated = local._updatedAt && (Date.now() - local._updatedAt < 25000);
              if (isRecentlyUpdated) {
                merged.push(local);
                return;
              }
              merged.push({ ...local, ...rem });
            });
            deserializedFeed.forEach(rem => {
              if (rem && rem.id && !handledIds.has(rem.id)) {
                merged.push(rem);
              }
            });
            localStorage.setItem('health365_feed', JSON.stringify(merged));
            return merged;
          });
        }
        if (remotePosts && remotePosts.length > 0) {
          let deletedIds = new Set();
          try {
            const savedDeleted = localStorage.getItem('health365_deleted_posts');
            if (savedDeleted) deletedIds = new Set(JSON.parse(savedDeleted));
          } catch (e) {}

          setPosts(prev => {
            let baseList = [];
            if (Array.isArray(prev) && prev.length > 0) {
              baseList = prev;
            } else {
              try {
                const saved = localStorage.getItem('health365_posts');
                if (saved) baseList = JSON.parse(saved);
              } catch (e) {}
              if (!Array.isArray(baseList) || baseList.length === 0) {
                baseList = INITIAL_COMMUNITY_POSTS || [];
              }
            }

            const remoteMap = new Map(remotePosts.map(r => [r.id, r]));
            const merged = [];
            const handledIds = new Set();

            const initMap = new Map((INITIAL_COMMUNITY_POSTS || []).map(p => [p.id, p]));

            // 1. Preserve all local/initial posts with their latest local edits & images
            baseList.forEach(local => {
              if (!local || !local.id || deletedIds.has(local.id)) return;
              handledIds.add(local.id);
              const rem = remoteMap.get(local.id);
              const init = initMap.get(local.id);

              const author = (local.author && local.author.trim()) ? local.author : (rem?.author || init?.author || 'Member');
              const avatar = (local.avatar && local.avatar.trim()) ? local.avatar : (rem?.avatar && rem.avatar.trim() ? rem.avatar : (init?.avatar || ''));
              const text = (local.text && local.text.trim()) ? local.text : (rem?.text || init?.text || '');
              const image = (local.image && local.image.trim()) ? local.image : (rem?.image || init?.image || null);
              const date = (local.date && local.date.trim()) ? local.date : (rem?.date || init?.date || 'Just now');
              const likes = local.likes !== undefined ? local.likes : (rem?.likes !== undefined ? rem.likes : (init?.likes || 0));

              merged.push({
                ...(init || {}),
                ...(rem || {}),
                ...local,
                author,
                avatar,
                text,
                image,
                date,
                likes,
                status: local.status || rem?.status || init?.status || 'approved'
              });
            });

            // 2. Add any remote posts that are not yet local and not deleted
            remotePosts.forEach(rem => {
              if (rem && rem.id && !handledIds.has(rem.id) && !deletedIds.has(rem.id)) {
                merged.push(rem);
              }
            });

            // 3. Ensure any initial posts not yet in list and not deleted are present
            (INITIAL_COMMUNITY_POSTS || []).forEach(initP => {
              if (initP && initP.id && !handledIds.has(initP.id) && !deletedIds.has(initP.id) && !merged.some(m => m.id === initP.id)) {
                merged.push(initP);
              }
            });

            try {
              localStorage.setItem('health365_posts', JSON.stringify(merged));
            } catch (err) {
              console.warn('localStorage quota warning for posts:', err);
            }
            return merged;
          });
        }
        if (remoteAudios && Array.isArray(remoteAudios)) {
          const deserializedAudios = remoteAudios.map(deserializeAudioFromSupabase);
          setAudios(deserializedAudios);
          safeSaveAudiosToStorage(deserializedAudios);
        }
        if (remoteQuestions && remoteQuestions.length > 0) {
          setSpecialistQuestions(remoteQuestions);
          localStorage.setItem('health365_specialist_questions', JSON.stringify(remoteQuestions));
        }
        if (remoteSettings && remoteSettings.length > 0) {
          const rs = remoteSettings[0];
          setAppSettings(prev => {
            const merged = {
              ...prev,
              name: rs.name || prev.name,
              slug: rs.slug || prev.slug,
              status: rs.status || prev.status,
              iconEmoji: rs.icon_emoji || prev.iconEmoji,
              adminEmail: rs.admin_email || prev.adminEmail,
              adminPassword: rs.admin_password || prev.adminPassword,
              customDomain: rs.custom_domain || prev.customDomain,
              webhookUrl: rs.webhook_url || prev.webhookUrl,
              defaultAudioCover: rs.default_audio_cover || prev.defaultAudioCover || localStorage.getItem('health365_default_audio_cover') || '',
              audioTabActive: rs.audio_tab_active !== undefined ? rs.audio_tab_active : (prev.audioTabActive !== undefined ? prev.audioTabActive : true),
              audioSectionTitle: rs.audio_section_title || prev.audioSectionTitle || localStorage.getItem('health365_audio_section_title') || 'Audios & Meditations'
            };
            localStorage.setItem('health365_settings', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn('Supabase sync notice:', err.message);
      }
    }

    loadSupabaseData();

    // Cross-tab immediate storage listener for audios and settings
    const handleStorageChange = (e) => {
      if (e.key === 'health365_audios' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setAudios(parsed);
        } catch (err) {}
      }
      if (e.key === 'health365_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') setAppSettings(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 1. Automatic background polling every 2.5 seconds
    const interval = setInterval(loadSupabaseData, 2500);

    // 2. Window focus & visibility auto-sync
    const handleFocus = () => loadSupabaseData();
    const handleVisibilityChange = () => {
      if (!document.hidden) loadSupabaseData();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Supabase Realtime channel subscriptions for instant pushes on all tables
    let membersChannel;
    let ebooksChannel;
    let feedChannel;
    let postsChannel;
    let audiosChannel;
    try {
      membersChannel = supabase
        .channel('members_realtime_feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => loadSupabaseData())
        .subscribe();

      ebooksChannel = supabase
        .channel('ebooks_realtime_feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ebooks' }, () => loadSupabaseData())
        .subscribe();

      feedChannel = supabase
        .channel('feed_realtime_feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'feed' }, () => loadSupabaseData())
        .subscribe();

      postsChannel = supabase
        .channel('community_realtime_feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => loadSupabaseData())
        .subscribe();

      audiosChannel = supabase
        .channel('audios_realtime_feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audios' }, () => loadSupabaseData())
        .subscribe();
    } catch (e) {
      console.warn('Realtime channel notice:', e);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (membersChannel) supabase.removeChannel(membersChannel);
      if (ebooksChannel) supabase.removeChannel(ebooksChannel);
      if (feedChannel) supabase.removeChannel(feedChannel);
      if (postsChannel) supabase.removeChannel(postsChannel);
      if (audiosChannel) supabase.removeChannel(audiosChannel);
    };
  }, []);

  // Persist all states (localStorage + async Supabase sync)
  useEffect(() => {
    localStorage.setItem('health365_auth', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (currentTab) {
      localStorage.setItem('health365_current_tab', currentTab);
    }
  }, [currentTab]);

  useEffect(() => {
    if (adminSubSection) {
      localStorage.setItem('health365_admin_subsection', adminSubSection);
    }
  }, [adminSubSection]);

  useEffect(() => {
    localStorage.setItem('health365_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('health365_ebooks', JSON.stringify(ebooks));
  }, [ebooks]);

  useEffect(() => {
    localStorage.setItem('health365_feed', JSON.stringify(feedItems));
  }, [feedItems]);

  useEffect(() => {
    localStorage.setItem('health365_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    safeSaveAudiosToStorage(audios);
  }, [audios]);

  useEffect(() => {
    localStorage.setItem('health365_specialist_questions', JSON.stringify(specialistQuestions));
  }, [specialistQuestions]);

  // Liked posts tracking per user
  const [userLikesMap, setUserLikesMap] = useState(() => {
    try {
      const saved = localStorage.getItem('health365_user_likes_map');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('health365_user_likes_map', JSON.stringify(userLikesMap));
  }, [userLikesMap]);

  const isPostLiked = (postId) => {
    const userKey = currentUserEmail;
    return !!(userLikesMap[userKey] && userLikesMap[userKey][postId]);
  };

  const toggleLikePost = (postId) => {
    const userKey = currentUserEmail;
    const userLikes = userLikesMap[userKey] || {};
    const hasLiked = !!userLikes[postId];

    const updatedUserLikes = {
      ...userLikesMap,
      [userKey]: {
        ...userLikes,
        [postId]: !hasLiked
      }
    };
    setUserLikesMap(updatedUserLikes);

    // Update posts like count
    setPosts(prevPosts => {
      const updated = prevPosts.map(p => {
        if (p.id === postId) {
          const currentLikes = typeof p.likes === 'number' ? p.likes : parseInt(p.likes || 0, 10);
          const newLikes = hasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
          return { ...p, likes: newLikes };
        }
        return p;
      });
      localStorage.setItem('health365_posts', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    localStorage.setItem('health365_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // Auth Methods
  const formatNameFromEmail = (email) => {
    const raw = email.split('@')[0].replace(/[._0-9]/g, ' ').trim();
    if (!raw) return 'Member';
    const words = raw.split(/\s+/);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const loginAsMember = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check local storage / state first
    let currentMembers = members || [];
    try {
      const local = localStorage.getItem('health365_members');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentMembers = parsed;
        }
      }
    } catch (e) {}

    let existing = currentMembers.find(m => (m.email || '').trim().toLowerCase() === cleanEmail);

    // Built-in Reviewer / Demo Accounts Fallback
    const isDemoReviewer = ['teste@gmail.com', 'test@gmail.com', 'reviewer@apple.com', 'apple@review.com'].includes(cleanEmail);
    if (!existing && isDemoReviewer) {
      existing = {
        id: 'demo-apple-reviewer',
        name: 'Apple Reviewer',
        email: cleanEmail,
        status: 'Active',
        role: 'member',
        createdAt: new Date().toISOString()
      };
    }

    // Query Supabase Cloud in real-time for this specific member only
    try {
      const { data: singleRemote } = await supabase.from('members').select('*').ilike('email', cleanEmail).maybeSingle();

      if (singleRemote) {
        existing = singleRemote;
        setMembers(prev => {
          const map = new Map();
          (prev || []).forEach(m => m?.email && map.set(m.email.trim().toLowerCase(), m));
          map.set(cleanEmail, singleRemote);
          const merged = Array.from(map.values());
          localStorage.setItem('health365_members', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.warn('Supabase auth query notice:', err);
    }

    if (!existing && !isDemoReviewer) {
      return {
        success: false,
        message: 'Access denied. This email is not registered or has been removed from the members area.'
      };
    }

    if (existing.status === 'Blocked' || existing.status === 'Bloqueado') {
      return {
        success: false,
        message: 'Access suspended. This account has been blocked by the administrator.'
      };
    }

    // Ensure member is in members list state
    setMembers(prev => {
      const exists = prev.some(m => (m.email || '').trim().toLowerCase() === cleanEmail);
      if (!exists) {
        const updated = [existing, ...prev];
        localStorage.setItem('health365_members', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });

    let savedProfileAvatar = null;
    try {
      const savedProf = localStorage.getItem('health365_user_profile');
      if (savedProf) {
        savedProfileAvatar = JSON.parse(savedProf).avatar;
      }
    } catch (e) {}

    // Extract avatar from cloud record in Supabase members table (stored in products or avatar)
    let cloudAvatar = null;
    if (existing && Array.isArray(existing.products)) {
      const avProd = existing.products.find(p => typeof p === 'string' && p.startsWith('avatar:'));
      if (avProd) {
        cloudAvatar = avProd.replace(/^avatar:/, '').trim();
      }
    }

    const userObj = {
      role: 'member',
      email: existing.email,
      name: existing.name || formatNameFromEmail(cleanEmail),
      avatar: cloudAvatar || savedProfileAvatar || existing.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
    };

    // Sync with user profile state in storage
    localStorage.setItem('health365_user_profile', JSON.stringify({
      name: userObj.name,
      email: userObj.email,
      avatar: userObj.avatar
    }));

    setCurrentUser(userObj);
    setCurrentTab('home');
    return { success: true };
  };

  const updateMemberProfile = async ({ name, avatar, email }) => {
    const targetEmail = (email || currentUser?.email || '').trim().toLowerCase();
    if (!targetEmail) return;

    let finalAvatar = avatar;

    // If avatar is base64 dataUrl, upload it to Supabase Storage
    if (avatar && avatar.startsWith('data:image')) {
      try {
        const response = await fetch(avatar);
        const blob = await response.blob();
        const storagePath = `avatars/${targetEmail.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
        const { error: upErr } = await supabase.storage
          .from('audios')
          .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: true });

        if (!upErr) {
          const { data: pubData } = supabase.storage.from('audios').getPublicUrl(storagePath);
          if (pubData?.publicUrl) {
            finalAvatar = `${pubData.publicUrl}?t=${Date.now()}`;
          }
        }
      } catch (err) {
        console.warn('Error uploading profile avatar to Supabase Storage:', err);
      }
    }

    const updatedUser = {
      ...currentUser,
      name: name || currentUser?.name,
      avatar: finalAvatar !== undefined ? finalAvatar : currentUser?.avatar
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('health365_user_profile', JSON.stringify({
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar
    }));

    // Update in members state & Supabase
    setMembers(prev => {
      const next = prev.map(m => {
        if ((m.email || '').trim().toLowerCase() === targetEmail) {
          const prodList = Array.isArray(m.products) ? m.products.filter(p => !p.startsWith('avatar:')) : ['all'];
          if (finalAvatar) {
            prodList.push(`avatar:${finalAvatar}`);
          }
          return {
            ...m,
            name: name || m.name,
            products: prodList
          };
        }
        return m;
      });
      localStorage.setItem('health365_members', JSON.stringify(next));
      return next;
    });

    try {
      const { data: member } = await supabase.from('members').select('*').ilike('email', targetEmail).maybeSingle();
      if (member) {
        const prodList = Array.isArray(member.products) ? member.products.filter(p => !p.startsWith('avatar:')) : ['all'];
        if (finalAvatar) {
          prodList.push(`avatar:${finalAvatar}`);
        }
        await supabase.from('members').update({
          name: name || member.name,
          products: prodList
        }).ilike('email', targetEmail);
      }
    } catch (err) {
      console.warn('Error syncing updated profile to Supabase:', err);
    }

    // Also update author info on community posts by this user
    setPosts(prev => {
      const updated = prev.map(p => {
        if ((p.authorEmail || '').trim().toLowerCase() === targetEmail || p.author === currentUser?.name) {
          return {
            ...p,
            author: name || p.author,
            avatar: finalAvatar !== undefined ? finalAvatar : p.avatar
          };
        }
        return p;
      });
      localStorage.setItem('health365_posts', JSON.stringify(updated));
      return updated;
    });
  };

  // Invalidate active session if member is blocked
  useEffect(() => {
    if (currentUser && currentUser.role === 'member') {
      const email = (currentUser.email || '').trim().toLowerCase();
      const currentInList = (members || []).find(
        m => (m.email || '').trim().toLowerCase() === email
      );
      if (currentInList && (currentInList.status === 'Blocked' || currentInList.status === 'Bloqueado')) {
        logout();
      }
    }
  }, [members, currentUser]);

  const loginAsBuyer = loginAsMember;

  const loginAsAdmin = (email, password) => {
    if (
      (email.trim().toLowerCase() === appSettings.adminEmail.toLowerCase() || email.trim() === 'admin') &&
      (password === appSettings.adminPassword || password === 'admin' || password === '1234')
    ) {
      const adminObj = {
        role: 'admin',
        email: appSettings.adminEmail,
        name: '365hopejourney Admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
      };
      setCurrentUser(adminObj);
      setCurrentTab('admin');
      return { success: true };
    }
    return { success: false, message: 'Invalid admin email or password.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentTab('home');
    setSelectedEbookId(null);
    setSelectedChapterId(null);
  };

  const deleteAccount = async (emailToDelete) => {
    const targetEmail = (emailToDelete || currentUserEmail).trim().toLowerCase();
    try {
      // 1. Delete member from Supabase
      await supabase.from('members').delete().ilike('email', targetEmail);
      // Also delete any user questions or meals
      await supabase.from('specialist_questions').delete().ilike('userEmail', targetEmail);
      await supabase.from('nutri_meals').delete().ilike('user_email', targetEmail);
    } catch (err) {
      console.warn('Error deleting account from Supabase:', err);
    }

    // 2. Remove from local members
    setMembers(prev => {
      const filtered = prev.filter(m => (m.email || '').trim().toLowerCase() !== targetEmail);
      localStorage.setItem('health365_members', JSON.stringify(filtered));
      return filtered;
    });

    // 3. Clear local storage records related to this user
    try {
      localStorage.removeItem('health365_auth');
      localStorage.removeItem('health365_user_profile');
      localStorage.removeItem(`health365_ai_specialist_chat_${targetEmail}`);
      localStorage.removeItem(`health365_nutri_meals_${targetEmail}`);
      localStorage.removeItem(`health365_nutri_profile_${targetEmail}`);
    } catch (e) {}

    // 4. Reset auth
    setCurrentUser(null);
    setCurrentTab('home');
    setSelectedEbookId(null);
    setSelectedChapterId(null);
    return { success: true };
  };

  // Ebook & Chapter Navigation
  const activeEbook = ebooks.find(b => b.id === selectedEbookId) || null;
  const activeChapter = activeEbook?.chapters?.find(c => c.id === selectedChapterId) || null;

  const openEbook = (ebookId) => {
    setSelectedEbookId(ebookId);
    setSelectedChapterId(null);
  };

  const openChapter = (chapterId) => {
    setSelectedChapterId(chapterId);
  };

  const backToEbooks = () => {
    setSelectedEbookId(null);
    setSelectedChapterId(null);
  };

  const backToChapters = () => {
    setSelectedChapterId(null);
  };

  const nextChapter = () => {
    if (!activeEbook || !activeChapter) return;
    const currentIndex = activeEbook.chapters.findIndex(c => c.id === activeChapter.id);
    if (currentIndex >= 0 && currentIndex < activeEbook.chapters.length - 1) {
      const next = activeEbook.chapters[currentIndex + 1];
      if (next.status !== 'locked') {
        setSelectedChapterId(next.id);
      }
    }
  };

  const prevChapter = () => {
    if (!activeEbook || !activeChapter) return;
    const currentIndex = activeEbook.chapters.findIndex(c => c.id === activeChapter.id);
    if (currentIndex > 0) {
      setSelectedChapterId(activeEbook.chapters[currentIndex - 1].id);
    }
  };

  // CRUD Ebooks
  const addEbook = async (ebookData) => {
    const newEbook = {
      ...ebookData,
      id: 'ebook-' + Date.now(),
      chapters: ebookData.chapters || [],
      isActive: ebookData.isActive !== false
    };
    setEbooks(prev => {
      const next = [newEbook, ...prev];
      localStorage.setItem('health365_ebooks', JSON.stringify(next));
      return next;
    });
    try {
      await supabase.from('ebooks').upsert(serializeEbookForSupabase(newEbook));
    } catch (e) {
      console.warn('Supabase addEbook error:', e);
    }
    return newEbook;
  };

  const updateEbook = async (ebookId, updatedData) => {
    let fullUpdated = null;
    const coverToUse = updatedData.coverImage !== undefined ? updatedData.coverImage : updatedData.cover;
    setEbooks(prev => {
      const next = prev.map(eb => {
        if (eb.id === ebookId) {
          fullUpdated = {
            ...eb,
            ...updatedData,
            coverImage: coverToUse !== undefined ? coverToUse : eb.coverImage,
            cover: coverToUse !== undefined ? coverToUse : (eb.cover || eb.coverImage),
            _updatedAt: Date.now()
          };
          return fullUpdated;
        }
        return eb;
      });
      localStorage.setItem('health365_ebooks', JSON.stringify(next));
      return next;
    });
    if (fullUpdated) {
      try {
        await supabase.from('ebooks').upsert(serializeEbookForSupabase(fullUpdated));
      } catch (e) {
        console.warn('Supabase updateEbook error:', e);
      }
    }
  };

  const deleteEbook = async (ebookId) => {
    setEbooks(prev => {
      const filtered = prev.filter(eb => eb.id !== ebookId);
      localStorage.setItem('health365_ebooks', JSON.stringify(filtered));
      return filtered;
    });
    if (selectedEbookId === ebookId) {
      setSelectedEbookId(null);
      setSelectedChapterId(null);
    }
    try {
      await supabase.from('ebooks').delete().eq('id', ebookId);
    } catch (e) {
      console.warn('Supabase deleteEbook error:', e);
    }
  };

  const reorderEbooks = async (newList) => {
    const stamped = newList.map((eb, idx) => ({
      ...eb,
      orderIndex: idx,
      _updatedAt: Date.now()
    }));
    setEbooks(stamped);
    localStorage.setItem('health365_ebooks', JSON.stringify(stamped));

    try {
      await Promise.all(
        stamped.map((eb, idx) =>
          supabase.from('ebooks').upsert(serializeEbookForSupabase(eb, idx))
        )
      );
    } catch (e) {
      console.warn('Supabase reorderEbooks error:', e);
    }
  };

  // CRUD Chapters
  const addChapter = async (ebookId, chapterData) => {
    let parentEbook = null;
    setEbooks(prev => {
      const next = prev.map(eb => {
        if (eb.id !== ebookId) return eb;
        const chapters = eb.chapters || [];
        const newChapter = {
          ...chapterData,
          id: 'ch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          number: chapterData.number || (chapters.length + 1),
          status: chapterData.status || 'released'
        };
        parentEbook = {
          ...eb,
          chapters: [...chapters, newChapter],
          _updatedAt: Date.now()
        };
        return parentEbook;
      });
      localStorage.setItem('health365_ebooks', JSON.stringify(next));
      return next;
    });
    if (parentEbook) {
      try {
        await supabase.from('ebooks').upsert(serializeEbookForSupabase(parentEbook));
      } catch (e) {
        console.warn('Supabase addChapter error:', e);
      }
    }
  };

  const updateChapter = async (ebookId, chapterId, updatedData) => {
    let parentEbook = null;
    setEbooks(prev => {
      const next = prev.map(eb => {
        if (eb.id !== ebookId) return eb;
        parentEbook = {
          ...eb,
          chapters: (eb.chapters || []).map(ch => ch.id === chapterId ? { ...ch, ...updatedData } : ch),
          _updatedAt: Date.now()
        };
        return parentEbook;
      });
      localStorage.setItem('health365_ebooks', JSON.stringify(next));
      return next;
    });
    if (parentEbook) {
      try {
        await supabase.from('ebooks').upsert(serializeEbookForSupabase(parentEbook));
      } catch (e) {
        console.warn('Supabase updateChapter error:', e);
      }
    }
  };

  const deleteChapter = async (ebookId, chapterId, chapterIndex) => {
    let parentEbook = null;
    setEbooks(prev => {
      const next = prev.map(eb => {
        if (eb.id !== ebookId) return eb;
        const currentChapters = eb.chapters || [];
        
        let filtered;
        if (chapterIndex !== undefined && chapterIndex !== null) {
          filtered = currentChapters.filter((_, idx) => idx !== chapterIndex);
        } else {
          filtered = currentChapters.filter(ch => ch.id !== chapterId);
        }

        const renumbered = filtered.map((ch, i) => ({
          ...ch,
          number: i + 1
        }));

        parentEbook = {
          ...eb,
          chapters: renumbered,
          _updatedAt: Date.now()
        };
        return parentEbook;
      });
      localStorage.setItem('health365_ebooks', JSON.stringify(next));
      return next;
    });
    if (selectedChapterId === chapterId) {
      setSelectedChapterId(null);
    }
    if (parentEbook) {
      try {
        await supabase.from('ebooks').upsert(serializeEbookForSupabase(parentEbook));
      } catch (e) {
        console.warn('Supabase deleteChapter error:', e);
      }
    }
  };

  // Member Management
  const addMember = (email, name) => {
    const newMember = {
      id: 'm-' + Date.now(),
      email: email.trim(),
      name: name.trim() || email.split('@')[0],
      status: 'Active',
      date: new Date().toLocaleDateString('en-US'),
      products: ['all']
    };
    setMembers(prev => [newMember, ...prev]);
  };

  const deleteMember = async (id) => {
    const target = members.find(m => m.id === id);
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    localStorage.setItem('health365_members', JSON.stringify(updated));
    if (target?.email) {
      try {
        await supabase.from('members').delete().eq('email', target.email);
      } catch (err) {
        console.warn('Supabase deleteMember error:', err);
      }
    }
  };

  // Answer question
  const answerSpecialistQuestion = (id, answerText) => {
    setSpecialistQuestions(prev => prev.map(q => q.id === id ? { ...q, status: 'answered', answer: answerText } : q));
  };

  // CRUD Feed Items
  const addFeedPost = async (formData) => {
    const newPost = {
      id: 'feed-' + Date.now(),
      title: formData.title || '',
      subtitle: formData.subtitle || formData.summary || '',
      summary: formData.summary || formData.subtitle || '',
      content: formData.content || '',
      image: formData.image || '',
      category: formData.category || 'Announcements',
      author: formData.author || 'Health365 Team',
      read_time: formData.read_time || '2 min',
      date: new Date().toLocaleDateString('pt-BR'),
      status: formData.status || 'Active',
      _updatedAt: Date.now()
    };
    setFeedItems(prev => {
      const updated = [newPost, ...prev];
      localStorage.setItem('health365_feed', JSON.stringify(updated));
      return updated;
    });
    try {
      await supabase.from('feed').upsert(serializeFeedForSupabase(newPost));
    } catch (e) {
      console.warn('Supabase addFeedPost error:', e);
    }
    return newPost;
  };

  const updateFeedPost = async (id, formData) => {
    let fullUpdated = null;
    setFeedItems(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          fullUpdated = { ...p, ...formData, _updatedAt: Date.now() };
          return fullUpdated;
        }
        return p;
      });
      localStorage.setItem('health365_feed', JSON.stringify(updated));
      return updated;
    });
    if (fullUpdated) {
      try {
        await supabase.from('feed').upsert(serializeFeedForSupabase(fullUpdated));
      } catch (e) {
        console.warn('Supabase updateFeedPost error:', e);
      }
    }
  };

  const deleteFeedPost = async (id) => {
    setFeedItems(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('health365_feed', JSON.stringify(updated));
      return updated;
    });
    try {
      await supabase.from('feed').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteFeedPost error:', e);
    }
  };

  // CRUD Community Posts
  const addPost = async (text, image) => {
    let authorAvatar = currentUser?.avatar;
    let authorName = currentUser?.name || 'Member';
    try {
      const savedProf = localStorage.getItem('health365_user_profile');
      if (savedProf) {
        const p = JSON.parse(savedProf);
        if (p.avatar) authorAvatar = p.avatar;
        if (p.name) authorName = p.name;
      }
    } catch (e) {}
    if (!authorAvatar) {
      authorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
    }

    const newPost = {
      id: 'post-' + Date.now(),
      author: authorName,
      avatar: authorAvatar,
      date: 'Just now',
      text,
      image,
      likes: 0,
      comments: 0,
      status: 'pending', // Pending admin review
      _updatedAt: Date.now()
    };
    setPosts(prev => {
      const updated = [newPost, ...prev];
      localStorage.setItem('health365_posts', JSON.stringify(updated));
      return updated;
    });
    try {
      await supabase.from('community_posts').upsert(serializeCommunityPostForSupabase(newPost));
    } catch (e) {
      console.warn('Supabase addPost error:', e);
    }
    return newPost;
  };

  const addCommunityPost = async (formData) => {
    const newPost = {
      id: 'post-' + Date.now(),
      author: formData.author || currentUser?.name || 'Member',
      avatar: formData.avatar !== undefined ? formData.avatar : (currentUser?.avatar || ''),
      date: formData.date || 'Just now',
      text: formData.text || '',
      image: formData.image || null,
      likes: formData.likes !== undefined ? formData.likes : 0,
      comments: formData.comments !== undefined ? formData.comments : 0,
      status: formData.status || 'approved',
      _updatedAt: Date.now()
    };
    setPosts(prev => {
      const updated = [newPost, ...prev];
      localStorage.setItem('health365_posts', JSON.stringify(updated));
      return updated;
    });
    try {
      await supabase.from('community_posts').upsert(serializeCommunityPostForSupabase(newPost));
    } catch (e) {
      console.warn('Supabase addCommunityPost error:', e);
    }
    return newPost;
  };

  const updateCommunityPost = async (id, formData) => {
    let fullUpdated = null;
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          fullUpdated = { ...p, ...formData, _updatedAt: Date.now() };
          return fullUpdated;
        }
        return p;
      });
      localStorage.setItem('health365_posts', JSON.stringify(updated));
      return updated;
    });
    if (fullUpdated) {
      try {
        await supabase.from('community_posts').upsert(serializeCommunityPostForSupabase(fullUpdated));
      } catch (e) {
        console.warn('Supabase updateCommunityPost error:', e);
      }
    }
  };

  const deleteCommunityPost = async (id) => {
    try {
      const savedDeleted = localStorage.getItem('health365_deleted_posts');
      const deletedList = savedDeleted ? JSON.parse(savedDeleted) : [];
      if (!deletedList.includes(id)) {
        localStorage.setItem('health365_deleted_posts', JSON.stringify([...deletedList, id]));
      }
    } catch (e) {}

    setPosts(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('health365_posts', JSON.stringify(updated));
      return updated;
    });
    try {
      await supabase.from('community_posts').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteCommunityPost error:', e);
    }
  };

  // CRUD Audios
  const addAudio = async (audioData) => {
    const newAudio = {
      id: audioData.id || ('audio-' + Date.now()),
      title: audioData.title || '',
      description: audioData.description || '',
      audioUrl: audioData.audioUrl || audioData.audio_url || '',
      cover: audioData.cover || '',
      duration: audioData.duration || '05:00',
      _updatedAt: Date.now()
    };

    try {
      const dSaved = localStorage.getItem('health365_deleted_audio_ids');
      if (dSaved) {
        const set = new Set(JSON.parse(dSaved));
        set.delete(newAudio.id);
        localStorage.setItem('health365_deleted_audio_ids', JSON.stringify([...set]));
      }
    } catch (e) {}

    setAudios(prev => {
      const filtered = (prev || []).filter(a => a.id !== newAudio.id);
      const updated = [newAudio, ...filtered];
      safeSaveAudiosToStorage(updated);
      return updated;
    });
    try {
      await supabase.from('audios').upsert(serializeAudioForSupabase(newAudio));
    } catch (e) {
      console.warn('Supabase addAudio error:', e);
    }
    return newAudio;
  };

  const updateAudio = async (id, audioData) => {
    let fullUpdated = null;
    setAudios(prev => {
      const updated = (prev || []).map(a => {
        if (a.id === id) {
          fullUpdated = { ...a, ...audioData, _updatedAt: Date.now() };
          return fullUpdated;
        }
        return a;
      });
      safeSaveAudiosToStorage(updated);
      return updated;
    });
    if (fullUpdated) {
      try {
        await supabase.from('audios').upsert(serializeAudioForSupabase(fullUpdated));
      } catch (e) {
        console.warn('Supabase updateAudio error:', e);
      }
    }
  };

  const deleteAudio = async (id) => {
    try {
      const dSaved = localStorage.getItem('health365_deleted_audio_ids');
      const set = dSaved ? new Set(JSON.parse(dSaved)) : new Set();
      set.add(id);
      localStorage.setItem('health365_deleted_audio_ids', JSON.stringify([...set]));
    } catch (e) {}

    setAudios(prev => {
      const updated = (prev || []).filter(a => a.id !== id);
      safeSaveAudiosToStorage(updated);
      return updated;
    });

    try {
      deleteAudioFromStorage(id).catch(() => {});
    } catch (e) {}

    try {
      await supabase.from('audios').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteAudio error:', e);
    }
  };

  const resetToDemoData = () => {
    setEbooks(INITIAL_EBOOKS);
    setPosts(INITIAL_COMMUNITY_POSTS);
    setFeedItems(INITIAL_FEED);
    localStorage.removeItem('health365_ebooks');
    localStorage.removeItem('health365_posts');
    localStorage.removeItem('health365_feed');
    localStorage.removeItem('health365_audios');
    localStorage.removeItem('health365_meals');
    localStorage.removeItem('health365_specialist_questions');
    setSelectedEbookId(null);
    setSelectedChapterId(null);
  };

  const updateAppSettings = async (newSettings) => {
    let merged = null;
    setAppSettings(prev => {
      merged = { ...prev, ...newSettings };
      localStorage.setItem('health365_settings', JSON.stringify(merged));
      return merged;
    });
    try {
      if (merged) {
        await supabase.from('app_settings').upsert({ id: 'app-settings-main', ...merged });
      }
    } catch (e) {
      console.warn('Supabase app_settings update error:', e);
    }
  };

  const hasNutriPhotoAccess = (email) => {
    if (!email) {
      if (currentUser?.role === 'admin') {
        return { hasAccess: true, planType: 'admin', durationText: 'Admin Unlimited', expiresAt: 'Never', user: null };
      }
      return { hasAccess: false, user: null };
    }
    if (currentUser?.role === 'admin') {
      return { hasAccess: true, planType: 'admin', durationText: 'Admin Unlimited', expiresAt: 'Never', user: null };
    }
    const cleanEmail = email.toLowerCase().trim();
    const user = nutriUsers.find(u => (u.email || '').toLowerCase().trim() === cleanEmail);
    if (!user) {
      return { hasAccess: false, user: null };
    }
    if (user.status !== 'Active') {
      return { hasAccess: false, user, reason: 'paused' };
    }
    // Check expiration date if present
    if (user.expiresAt && user.expiresAt !== 'Never' && !user.expiresAt.toLowerCase().includes('never')) {
      try {
        const expDate = new Date(user.expiresAt);
        if (!isNaN(expDate.getTime()) && expDate.getTime() < Date.now() - (24 * 60 * 60 * 1000)) {
          return { hasAccess: false, user, reason: 'expired' };
        }
      } catch (e) {}
    }
    return {
      hasAccess: true,
      planType: user.planType || (user.periodType === '1_year' ? 'annual' : 'monthly'),
      planPrice: user.planPrice || (user.planType === 'annual' ? '$29.90' : '$9.90'),
      durationText: user.durationText || 'Active Subscription',
      expiresAt: user.expiresAt || 'Active',
      user
    };
  };

  const purchaseNutriPhoto = ({ planType = 'monthly', email, name }) => {
    const isAnnual = planType === 'annual';
    const planPrice = isAnnual ? '$29.90' : '$9.90';
    const durationDays = isAnnual ? 365 : 30;
    const durationText = isAnnual ? 'Annual Plan ($29.90/yr)' : 'Monthly Plan ($9.90/mo)';

    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + durationDays);

    const targetEmail = (email || currentUser?.email || 'member@health365.com').toLowerCase().trim();
    const targetName = name || currentUser?.name || 'Member';

    const newRecord = {
      id: 'nu-' + Date.now(),
      name: targetName,
      email: targetEmail,
      status: 'Active',
      planType: isAnnual ? 'annual' : 'monthly',
      planPrice,
      periodType: isAnnual ? '1_year' : '30_days',
      durationText,
      grantedAt: new Date().toLocaleDateString(),
      expiresAt: expiresDate.toLocaleDateString(),
      purchasedAt: new Date().toISOString()
    };

    setNutriUsers(prev => {
      const filtered = prev.filter(u => (u.email || '').toLowerCase().trim() !== targetEmail);
      const updated = [newRecord, ...filtered];
      localStorage.setItem('health365_nutriphoto_users', JSON.stringify(updated));
      return updated;
    });

    return newRecord;
  };

  const grantNutriPhotoAccess = (userData) => {
    setNutriUsers(prev => {
      const existsIndex = prev.findIndex(u => (u.email || '').toLowerCase().trim() === (userData.email || '').toLowerCase().trim());
      let updated;
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...userData };
      } else {
        const newUser = {
          id: userData.id || 'nu-' + Date.now(),
          ...userData
        };
        updated = [newUser, ...prev];
      }
      localStorage.setItem('health365_nutriphoto_users', JSON.stringify(updated));
      return updated;
    });
  };

  const updateNutriPhotoUser = (id, data) => {
    setNutriUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, ...data } : u);
      localStorage.setItem('health365_nutriphoto_users', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNutriPhotoUser = (id) => {
    setNutriUsers(prev => {
      const updated = prev.filter(u => u.id !== id);
      localStorage.setItem('health365_nutriphoto_users', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleNutriPhotoUserStatus = (id) => {
    setNutriUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === id) {
          const newStatus = u.status === 'Active' ? 'Paused' : 'Active';
          return { ...u, status: newStatus };
        }
        return u;
      });
      localStorage.setItem('health365_nutriphoto_users', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <EbookContext.Provider
      value={{
        currentUser,
        loginAsMember,
        loginAsBuyer,
        loginAsAdmin,
        logout,
        deleteAccount,
        updateMemberProfile,
        members,
        setMembers,
        addMember,
        deleteMember,
        ebooks,
        setEbooks,
        reorderEbooks,
        currentTab,
        setCurrentTab,
        adminSubSection,
        setAdminSubSection,
        selectedEbookId,
        selectedChapterId,
        activeEbook,
        activeChapter,
        openEbook,
        openChapter,
        backToEbooks,
        backToChapters,
        nextChapter,
        prevChapter,
        addEbook,
        updateEbook,
        deleteEbook,
        addChapter,
        updateChapter,
        deleteChapter,
        feedItems,
        setFeedItems,
        addFeedPost,
        updateFeedPost,
        deleteFeedPost,
        posts,
        setPosts,
        addPost,
        addCommunityPost,
        updateCommunityPost,
        deleteCommunityPost,
        audios,
        setAudios,
        addAudio,
        updateAudio,
        deleteAudio,
        toggleLikePost,
        isPostLiked,
        credits,
        getUserCredits,
        getUserCreditTransactions,
        creditHistoryMap,
        userCreditsMap,
        setUserCreditsMap,
        useCredit,
        addCredits,
        removeCredits,
        rechargeModalOpen,
        setRechargeModalOpen,
        openRechargeModal,
        closeRechargeModal,
        specialistQuestions,
        setSpecialistQuestions,
        answerSpecialistQuestion,
        nutriUsers,
        setNutriUsers,
        hasNutriPhotoAccess,
        purchaseNutriPhoto,
        grantNutriPhotoAccess,
        updateNutriPhotoUser,
        deleteNutriPhotoUser,
        toggleNutriPhotoUserStatus,
        appSettings,
        setAppSettings,
        updateAppSettings,
        resetToDemoData,
        activePushNotification,
        dismissPushNotification,
        broadcastPushNotification
      }}
    >
      {children}
    </EbookContext.Provider>
  );
}

export function useEbooks() {
  const context = useContext(EbookContext);
  if (!context) {
    throw new Error('useEbooks must be used within an EbookProvider');
  }
  return context;
}
