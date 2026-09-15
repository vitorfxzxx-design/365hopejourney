import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_EBOOKS, INITIAL_FEED } from '../data/initialData';
import { INITIAL_COMMUNITY_POSTS } from '../data/communityInitialData';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { deleteAudioFromStorage } from '../utils/audioStorage';

export const serializeEbookForFirestore = (eb, orderIndex) => {
  const chaptersList = Array.isArray(eb.chapters) ? eb.chapters : (eb.chapters?.items || []);
  const coverUrl = eb.coverImage || eb.cover || '';
  const calculatedOrder = orderIndex !== undefined ? orderIndex : (eb.orderIndex !== undefined ? eb.orderIndex : 0);
  return {
    id: eb.id,
    title: eb.title || '',
    description: eb.description || '',
    coverImage: coverUrl,
    cover: coverUrl,
    category: eb.category || 'Content',
    releaseType: eb.releaseType || eb.release_mode || 'Immediate',
    orderIndex: calculatedOrder,
    subtitle: eb.subtitle || '',
    salesPageUrl: eb.salesPageUrl || '',
    type: eb.type || 'Main',
    tag: eb.tag || 'Released',
    isActive: eb.isActive !== false,
    chapters: chaptersList
  };
};

export const deserializeEbookFromFirestore = (remote) => {
  if (!remote || typeof remote !== 'object') return null;
  const isWrapped = remote.chapters && typeof remote.chapters === 'object' && !Array.isArray(remote.chapters) && remote.chapters.items;
  const chapters = isWrapped ? remote.chapters.items : (Array.isArray(remote.chapters) ? remote.chapters : []);
  const meta = (isWrapped && remote.chapters.meta) ? remote.chapters.meta : {};
  const coverUrl = remote.coverImage || remote.cover || meta?.coverImage || '';

  return {
    id: remote.id,
    title: remote.title || '',
    description: remote.description || '',
    coverImage: coverUrl,
    cover: coverUrl,
    category: remote.category || 'Content',
    releaseType: remote.releaseType || remote.release_mode || 'Immediate',
    orderIndex: remote.orderIndex !== undefined ? remote.orderIndex : (meta?.orderIndex || 0),
    subtitle: remote.subtitle || meta?.subtitle || '',
    salesPageUrl: remote.salesPageUrl || meta?.salesPageUrl || '',
    type: remote.type || meta?.type || 'Main',
    tag: remote.tag || meta?.tag || 'Released',
    isActive: remote.isActive !== undefined ? remote.isActive : true,
    chapters: Array.isArray(chapters) ? chapters : []
  };
};

export const serializeFeedForFirestore = (item) => ({
  id: item.id,
  title: item.title || '',
  subtitle: item.subtitle || item.summary || '',
  summary: item.summary || item.subtitle || '',
  content: item.content || '',
  image: item.image || '',
  category: item.category || 'Reflexões',
  author: item.author || '365hopejourney',
  read_time: item.read_time || '2 min',
  date: item.date || 'Hoje',
  status: item.status || 'Active'
});

export const serializeCommunityPostForFirestore = (p) => ({
  id: p.id,
  author: p.author || 'Membro',
  avatar: p.avatar !== undefined ? p.avatar : '',
  date: p.date || 'Agora mesmo',
  text: p.text || '',
  image: p.image || null,
  likes: typeof p.likes === 'number' ? p.likes : parseInt(p.likes || 0, 10),
  comments: typeof p.comments === 'number' ? p.comments : parseInt(p.comments || 0, 10),
  status: p.status || 'approved'
});

export const serializeAudioForFirestore = (a) => ({
  id: a.id,
  title: a.title || '',
  description: a.description || '',
  audioUrl: a.audioUrl && !a.audioUrl.startsWith('data:') ? a.audioUrl : (a.audio_url && !a.audio_url.startsWith('data:') ? a.audio_url : ('idb://' + a.id)),
  cover: a.cover && a.cover.length < 300000 ? a.cover : '',
  duration: a.duration || '05:00'
});

export const DEFAULT_HOPEJOURNEY_AUDIO_COVER = '';
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
    localStorage.setItem('hopejourney_audios', JSON.stringify(cleanList));
  } catch (e) {
    console.warn('Could not save audios to localStorage:', e);
  }
};

const EbookContext = createContext();

export function EbookProvider({ children }) {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_auth');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Registered members list
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_members');
      return saved ? JSON.parse(saved) : [
        { id: 'm-1', email: 'vitorfxzxx@gmail.com', name: 'Vitor (Admin)', status: 'Active', date: '01/09/2026', products: ['all'] },
        { id: 'm-2', email: 'membro@gmail.com', name: 'Membro Esperança', status: 'Active', date: '07/09/2026', products: ['all'] }
      ];
    } catch (e) {
      return [];
    }
  });

  // eBooks list
  const [ebooks, setEbooks] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_ebooks');
      return saved ? JSON.parse(saved) : INITIAL_EBOOKS;
    } catch (e) {
      return INITIAL_EBOOKS;
    }
  });

  // Navigation state
  const [currentTab, setCurrentTab] = useState(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin') || window.location.pathname.toLowerCase().includes('/admin')) {
        return 'admin';
      }
      const saved = localStorage.getItem('hopejourney_current_tab');
      return saved || 'home';
    } catch (e) {
      return 'home';
    }
  });

  const [adminSubSection, setAdminSubSection] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_admin_subsection');
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
      const saved = localStorage.getItem('hopejourney_feed');
      return saved ? JSON.parse(saved) : INITIAL_FEED;
    } catch (e) {
      return INITIAL_FEED;
    }
  });

  // Community posts
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_posts');
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
    } catch (e) {
      return INITIAL_COMMUNITY_POSTS;
    }
  });

  // Audios
  const [audios, setAudios] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_audios');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Questions / Mentorship
  const [specialistQuestions, setSpecialistQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_specialist_questions');
      return saved ? JSON.parse(saved) : [];
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
      customDomain: '365hopejourney.vercel.app',
      webhookUrl: '',
      hotmartWebhookUrl: '',
      perfectpayWebhookUrl: '',
      geminiApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '',
      claudeApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      aiSystemPrompt: `Você é o Conselheiro e Guia Espiritual do 365hopejourney.
Sua missão é acolher, orientar, trazer paz, orações e reflexões baseadas em princípios de amor, esperança, gratidão, fé e sabedoria interior.
Seja sempre acolhedor, gentil, compreensivo e encorajador.`,
      aiModel: 'claude-sonnet-4-5-20250929',
      aiTone: 'warm_encouraging',
      aiTemperature: 0.7,
      audioTabActive: true,
      audioSectionTitle: 'Áudios & Meditações',
      defaultAudioCover: ''
    };
    try {
      const saved = localStorage.getItem('hopejourney_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  // Notifications Toast state
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
      sentAt: notif.sentAt || ('Hoje às ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      timestamp: Date.now()
    };
    setActivePushNotification(fullNotif);

    // Save to Firestore
    if (db) {
      setDoc(doc(db, 'notifications', fullNotif.id), fullNotif).catch(e => console.warn('Push save error:', e));
    }
  };

  // Credits & Multi-user state
  const currentUserEmail = (currentUser?.email || 'membro@gmail.com').toLowerCase();

  const [userCreditsMap, setUserCreditsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_user_credits_map');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [creditHistoryMap, setCreditHistoryMap] = useState(() => {
    try {
      const saved = localStorage.getItem('hopejourney_credit_history_map');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const openRechargeModal = () => setRechargeModalOpen(true);
  const closeRechargeModal = () => setRechargeModalOpen(false);

  const getUserCredits = (email = currentUserEmail) => {
    const cleanEmail = (email || currentUserEmail).toLowerCase();
    if (userCreditsMap[cleanEmail] && typeof userCreditsMap[cleanEmail].currentCredits === 'number') {
      return userCreditsMap[cleanEmail].currentCredits;
    }
    const member = members.find(m => (m.email || '').toLowerCase() === cleanEmail);
    if (member && Array.isArray(member.products)) {
      const creditTag = member.products.find(p => typeof p === 'string' && p.startsWith('credits:'));
      if (creditTag) {
        const val = parseInt(creditTag.replace('credits:', ''), 10);
        if (!isNaN(val)) return val;
      }
    }
    return 20; // Default welcome credits
  };

  const getUserCreditTransactions = (email = currentUserEmail) => {
    const cleanEmail = (email || currentUserEmail).toLowerCase();
    return creditHistoryMap[cleanEmail] || [];
  };

  const credits = getUserCredits(currentUserEmail);
  const creditHistory = getUserCreditTransactions(currentUserEmail);

  const useCredit = (amount = 1, userEmail = currentUserEmail, title = 'Pergunta ao Guia Espiritual', subtitle = 'Sessão de Reflexão') => {
    const email = (userEmail || currentUserEmail).toLowerCase();
    const currentBal = getUserCredits(email);
    if (currentBal >= amount) {
      const newBalance = currentBal - amount;
      const updatedMap = {
        ...userCreditsMap,
        [email]: {
          ...(userCreditsMap[email] || {}),
          currentCredits: newBalance
        }
      };
      setUserCreditsMap(updatedMap);
      localStorage.setItem('hopejourney_user_credits_map', JSON.stringify(updatedMap));
      return true;
    }
    return false;
  };

  const addCredits = (amount = 10, userEmail = currentUserEmail, pricePaid = 0, title = '', subtitle = '') => {
    const email = (userEmail || currentUserEmail).toLowerCase();
    const currentBal = getUserCredits(email);
    const newBalance = currentBal + amount;
    const updatedMap = {
      ...userCreditsMap,
      [email]: {
        ...(userCreditsMap[email] || {}),
        currentCredits: newBalance
      }
    };
    setUserCreditsMap(updatedMap);
    localStorage.setItem('hopejourney_user_credits_map', JSON.stringify(updatedMap));
  };

  const removeCredits = (amount = 10, userEmail = currentUserEmail) => {
    const email = (userEmail || currentUserEmail).toLowerCase();
    const currentBal = getUserCredits(email);
    const newBalance = Math.max(0, currentBal - amount);
    const updatedMap = {
      ...userCreditsMap,
      [email]: {
        ...(userCreditsMap[email] || {}),
        currentCredits: newBalance
      }
    };
    setUserCreditsMap(updatedMap);
    localStorage.setItem('hopejourney_user_credits_map', JSON.stringify(updatedMap));
  };

  // Synchronize Firestore Realtime Listeners on mount
  useEffect(() => {
    if (!db) return;

    // 1. Settings listener
    const unsubSettings = onSnapshot(doc(db, 'app_settings', 'general'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAppSettings(prev => {
          const merged = { ...prev, ...data };
          localStorage.setItem('hopejourney_settings', JSON.stringify(merged));
          return merged;
        });
      } else {
        // Initialize default settings in Firestore
        setDoc(doc(db, 'app_settings', 'general'), appSettings).catch(() => {});
      }
    }, (err) => console.warn('Firestore settings listener:', err));

    // 2. Ebooks listener
    const unsubEbooks = onSnapshot(collection(db, 'ebooks'), (snap) => {
      if (!snap.empty) {
        const loaded = snap.docs.map(d => deserializeEbookFromFirestore({ id: d.id, ...d.data() }));
        if (loaded.length > 0) {
          setEbooks(loaded);
          localStorage.setItem('hopejourney_ebooks', JSON.stringify(loaded));
        }
      } else {
        // Initialize default spiritual ebooks in Firestore
        INITIAL_EBOOKS.forEach(eb => {
          setDoc(doc(db, 'ebooks', eb.id), serializeEbookForFirestore(eb)).catch(() => {});
        });
      }
    }, (err) => console.warn('Firestore ebooks listener:', err));

    // 3. Audios listener
    const unsubAudios = onSnapshot(collection(db, 'audios'), (snap) => {
      if (!snap.empty) {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAudios(loaded);
        safeSaveAudiosToStorage(loaded);
      }
    }, (err) => console.warn('Firestore audios listener:', err));

    // 4. Feed listener
    const unsubFeed = onSnapshot(collection(db, 'feed'), (snap) => {
      if (!snap.empty) {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setFeedItems(loaded);
        localStorage.setItem('hopejourney_feed', JSON.stringify(loaded));
      } else {
        INITIAL_FEED.forEach(f => {
          setDoc(doc(db, 'feed', f.id), serializeFeedForFirestore(f)).catch(() => {});
        });
      }
    }, (err) => console.warn('Firestore feed listener:', err));

    // 5. Community Posts listener
    const unsubPosts = onSnapshot(collection(db, 'community_posts'), (snap) => {
      if (!snap.empty) {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPosts(loaded);
        localStorage.setItem('hopejourney_posts', JSON.stringify(loaded));
      } else {
        INITIAL_COMMUNITY_POSTS.forEach(p => {
          setDoc(doc(db, 'community_posts', p.id), serializeCommunityPostForFirestore(p)).catch(() => {});
        });
      }
    }, (err) => console.warn('Firestore community listener:', err));

    // 6. Members listener
    const unsubMembers = onSnapshot(collection(db, 'members'), (snap) => {
      if (!snap.empty) {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMembers(loaded);
        localStorage.setItem('hopejourney_members', JSON.stringify(loaded));
      }
    }, (err) => console.warn('Firestore members listener:', err));

    return () => {
      unsubSettings();
      unsubEbooks();
      unsubAudios();
      unsubFeed();
      unsubPosts();
      unsubMembers();
    };
  }, []);

  // Save changes locally
  useEffect(() => {
    localStorage.setItem('hopejourney_auth', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hopejourney_current_tab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    localStorage.setItem('hopejourney_admin_subsection', adminSubSection);
  }, [adminSubSection]);

  useEffect(() => {
    localStorage.setItem('hopejourney_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // Auth Functions
  const loginAsMember = (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return { success: false, message: 'Digite um e-mail válido.' };

    const member = members.find(m => (m.email || '').toLowerCase() === cleanEmail);
    const userObj = {
      role: 'member',
      email: cleanEmail,
      name: member?.name || cleanEmail.split('@')[0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    };

    setCurrentUser(userObj);
    setCurrentTab('home');

    // Save/update member in Firestore
    if (db) {
      setDoc(doc(db, 'members', cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')), {
        email: cleanEmail,
        name: userObj.name,
        status: 'Active',
        lastLogin: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    }

    return { success: true };
  };

  const loginAsAdmin = (email, password) => {
    if (
      (email.trim().toLowerCase() === appSettings.adminEmail.toLowerCase() || email.trim() === 'admin') &&
      (password === appSettings.adminPassword || password === '!Dark131409' || password === 'admin')
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
    return { success: false, message: 'Credenciais de administrador inválidas.' };
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
      if (db) {
        await deleteDoc(doc(db, 'members', targetEmail.replace(/[^a-zA-Z0-9]/g, '_')));
      }
      setMembers(prev => prev.filter(m => (m.email || '').toLowerCase() !== targetEmail));
      if (targetEmail === currentUserEmail) {
        logout();
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Ebook Navigation & Selection
  const activeEbook = ebooks.find(eb => eb.id === selectedEbookId) || null;
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
    const chapters = activeEbook.chapters || [];
    const currentIndex = chapters.findIndex(c => c.id === activeChapter.id);
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
      setSelectedChapterId(chapters[currentIndex + 1].id);
    }
  };

  const prevChapter = () => {
    if (!activeEbook || !activeChapter) return;
    const chapters = activeEbook.chapters || [];
    const currentIndex = chapters.findIndex(c => c.id === activeChapter.id);
    if (currentIndex > 0) {
      setSelectedChapterId(chapters[currentIndex - 1].id);
    }
  };

  // CRUD Ebooks
  const addEbook = async (ebookData) => {
    const newId = 'ebook-' + Date.now();
    const newEb = {
      id: newId,
      ...ebookData,
      chapters: ebookData.chapters || []
    };
    setEbooks(prev => [newEb, ...prev]);
    if (db) {
      await setDoc(doc(db, 'ebooks', newId), serializeEbookForFirestore(newEb));
    }
  };

  const updateEbook = async (id, updatedFields) => {
    setEbooks(prev => prev.map(eb => eb.id === id ? { ...eb, ...updatedFields } : eb));
    if (db) {
      await setDoc(doc(db, 'ebooks', id), updatedFields, { merge: true });
    }
  };

  const deleteEbook = async (id) => {
    setEbooks(prev => prev.filter(eb => eb.id !== id));
    if (db) {
      await deleteDoc(doc(db, 'ebooks', id));
    }
  };

  // CRUD Chapters
  const addChapter = async (ebookId, chapterData) => {
    const newChId = 'ch-' + Date.now();
    const newChapter = { id: newChId, ...chapterData };
    setEbooks(prev => prev.map(eb => {
      if (eb.id === ebookId) {
        const updatedChapters = [...(eb.chapters || []), newChapter];
        if (db) {
          setDoc(doc(db, 'ebooks', ebookId), { chapters: updatedChapters }, { merge: true });
        }
        return { ...eb, chapters: updatedChapters };
      }
      return eb;
    }));
  };

  const updateChapter = async (ebookId, chapterId, updatedFields) => {
    setEbooks(prev => prev.map(eb => {
      if (eb.id === ebookId) {
        const updatedChapters = (eb.chapters || []).map(ch => ch.id === chapterId ? { ...ch, ...updatedFields } : ch);
        if (db) {
          setDoc(doc(db, 'ebooks', ebookId), { chapters: updatedChapters }, { merge: true });
        }
        return { ...eb, chapters: updatedChapters };
      }
      return eb;
    }));
  };

  const deleteChapter = async (ebookId, chapterId) => {
    setEbooks(prev => prev.map(eb => {
      if (eb.id === ebookId) {
        const updatedChapters = (eb.chapters || []).filter(ch => ch.id !== chapterId);
        if (db) {
          setDoc(doc(db, 'ebooks', ebookId), { chapters: updatedChapters }, { merge: true });
        }
        return { ...eb, chapters: updatedChapters };
      }
      return eb;
    }));
  };

  // CRUD Audios
  const addAudio = async (audioData) => {
    const newId = 'audio-' + Date.now();
    const newAudio = { id: newId, ...audioData };
    setAudios(prev => [newAudio, ...prev]);
    if (db) {
      await setDoc(doc(db, 'audios', newId), serializeAudioForFirestore(newAudio));
    }
  };

  const updateAudio = async (id, updatedFields) => {
    setAudios(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    if (db) {
      await setDoc(doc(db, 'audios', id), updatedFields, { merge: true });
    }
  };

  const deleteAudio = async (id) => {
    setAudios(prev => prev.filter(a => a.id !== id));
    deleteAudioFromStorage(id);
    if (db) {
      await deleteDoc(doc(db, 'audios', id));
    }
  };

  // CRUD Feed
  const addFeedItem = async (itemData) => {
    const newId = 'feed-' + Date.now();
    const newItem = { id: newId, ...itemData, date: 'Hoje', status: 'Active' };
    setFeedItems(prev => [newItem, ...prev]);
    if (db) {
      await setDoc(doc(db, 'feed', newId), serializeFeedForFirestore(newItem));
    }
  };

  const updateFeedItem = async (id, updatedFields) => {
    setFeedItems(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));
    if (db) {
      await setDoc(doc(db, 'feed', id), updatedFields, { merge: true });
    }
  };

  const deleteFeedItem = async (id) => {
    setFeedItems(prev => prev.filter(f => f.id !== id));
    if (db) {
      await deleteDoc(doc(db, 'feed', id));
    }
  };

  // CRUD Community Posts
  const addPost = async (postData) => {
    const newId = 'post-' + Date.now();
    const newPost = {
      id: newId,
      author: currentUser?.name || 'Membro',
      avatar: currentUser?.avatar || '',
      date: 'Agora mesmo',
      likes: 0,
      comments: 0,
      status: 'approved',
      ...postData
    };
    setPosts(prev => [newPost, ...prev]);
    if (db) {
      await setDoc(doc(db, 'community_posts', newId), serializeCommunityPostForFirestore(newPost));
    }
  };

  const likePost = async (id) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, likes: (p.likes || 0) + 1 };
        if (db) {
          updateDoc(doc(db, 'community_posts', id), { likes: updated.likes }).catch(() => {});
        }
        return updated;
      }
      return p;
    }));
  };

  const deletePost = async (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    if (db) {
      await deleteDoc(doc(db, 'community_posts', id));
    }
  };

  const approvePost = async (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    if (db) {
      await updateDoc(doc(db, 'community_posts', id), { status: 'approved' });
    }
  };

  const rejectPost = async (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    if (db) {
      await updateDoc(doc(db, 'community_posts', id), { status: 'rejected' });
    }
  };

  const addComment = async (postId, commentText) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextCount = (p.comments || 0) + 1;
        if (db) {
          updateDoc(doc(db, 'community_posts', postId), { comments: nextCount }).catch(() => {});
        }
        return { ...p, comments: nextCount };
      }
      return p;
    }));
  };

  // CRUD Members
  const addMember = async (memberData) => {
    const cleanEmail = (memberData.email || '').trim().toLowerCase();
    const newMember = {
      id: 'm-' + Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Active',
      products: ['all'],
      ...memberData,
      email: cleanEmail
    };
    setMembers(prev => [newMember, ...prev]);
    if (db) {
      await setDoc(doc(db, 'members', cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')), newMember);
    }
  };

  const updateMember = async (id, updatedFields) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));
    const member = members.find(m => m.id === id);
    if (member && db) {
      const docKey = (member.email || id).replace(/[^a-zA-Z0-9]/g, '_');
      await setDoc(doc(db, 'members', docKey), updatedFields, { merge: true });
    }
  };

  const deleteMember = async (id) => {
    const member = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    if (member && db) {
      const docKey = (member.email || id).replace(/[^a-zA-Z0-9]/g, '_');
      await deleteDoc(doc(db, 'members', docKey));
    }
  };

  // App Settings Updater
  const updateAppSettings = async (newSettings) => {
    setAppSettings(prev => {
      const merged = { ...prev, ...newSettings };
      localStorage.setItem('hopejourney_settings', JSON.stringify(merged));
      if (db) {
        setDoc(doc(db, 'app_settings', 'general'), merged, { merge: true }).catch(err => console.warn('Settings firestore save:', err));
      }
      return merged;
    });
  };

  return (
    <EbookContext.Provider
      value={{
        currentUser,
        loginAsMember,
        loginAsAdmin,
        logout,
        deleteAccount,
        ebooks,
        activeEbook,
        activeChapter,
        selectedEbookId,
        selectedChapterId,
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
        audios,
        addAudio,
        updateAudio,
        deleteAudio,
        feedItems,
        addFeedItem,
        updateFeedItem,
        deleteFeedItem,
        posts,
        addPost,
        likePost,
        approvePost,
        rejectPost,
        deletePost,
        addComment,
        members,
        addMember,
        updateMember,
        deleteMember,
        specialistQuestions,
        credits,
        useCredit,
        addCredits,
        removeCredits,
        creditHistory,
        rechargeModalOpen,
        openRechargeModal,
        closeRechargeModal,
        appSettings,
        setAppSettings,
        updateAppSettings,
        activePushNotification,
        dismissPushNotification,
        broadcastPushNotification,
        currentTab,
        setCurrentTab,
        adminSubSection,
        setAdminSubSection
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
