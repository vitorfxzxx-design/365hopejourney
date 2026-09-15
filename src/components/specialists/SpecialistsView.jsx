import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, User, CheckCircle2, AlertCircle, Zap, Plus, X, Loader2 } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { generateSpecialistAIResponse } from '../../lib/geminiService';

export default function SpecialistsView() {
  const { currentUser, credits, useCredit, addCredits, openRechargeModal, appSettings } = useEbooks();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Read the active member profile (name & avatar)
  const memberProfile = (() => {
    try {
      const saved = localStorage.getItem('hopejourney_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: currentUser?.name || 'Member',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    };
  })();

  const userEmail = currentUser?.email || 'member@gmail.com';
  const rawFirstName = memberProfile.name && memberProfile.name.toLowerCase() !== 'member'
    ? memberProfile.name.split(/\s+/)[0]
    : (currentUser?.name && currentUser.name.toLowerCase() !== 'member' ? currentUser.name.split(/\s+/)[0] : 'Friend');
  const userFirstName = rawFirstName ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase() : 'Friend';
  const userAvatar = memberProfile.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const aiDoctorAvatar = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80';

  const defaultWelcomeMsg = {
    id: 'msg-welcome',
    sender: 'ai',
    text: `Hello ${userFirstName}! ✨ I am your 365hopejourney Spiritual Guide. How may I support your heart, your prayers, and your reflections today?`,
    time: 'Just now'
  };

  const [messages, setMessages] = useState(() => {
    try {
      const storageKey = `hopejourney_ai_chat_${userEmail}`;
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [defaultWelcomeMsg];
    } catch (e) {
      return [defaultWelcomeMsg];
    }
  });

  // Load chat history from Firestore for this user
  useEffect(() => {
    let isMounted = true;
    const cleanEmail = (userEmail || '').trim().toLowerCase();

    const fetchDBChatHistory = async () => {
      try {
        if (!cleanEmail || !db) return;
        const q = query(
          collection(db, 'specialist_questions'),
          where('author_email', '==', cleanEmail),
          orderBy('created_at', 'asc')
        );
        const snap = await getDocs(q);

        if (!snap.empty && isMounted) {
          const loadedMessages = [defaultWelcomeMsg];
          snap.docs.forEach(docSnap => {
            const item = docSnap.data();
            if (item.text) {
              const timeStr = item.date || 'Earlier';
              loadedMessages.push({
                id: `db-user-${docSnap.id}`,
                sender: 'user',
                text: item.text,
                time: timeStr
              });
            }
            if (item.answer) {
              const timeStr = item.date || 'Earlier';
              loadedMessages.push({
                id: `db-ai-${docSnap.id}`,
                sender: 'ai',
                text: item.answer,
                time: timeStr
              });
            }
          });
          setMessages(loadedMessages);
          localStorage.setItem(`hopejourney_ai_chat_${cleanEmail}`, JSON.stringify(loadedMessages));
        }
      } catch (err) {
        console.warn('Could not sync chat from Firestore, using local state:', err);
      }
    };

    fetchDBChatHistory();

    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  // Keep welcome message updated with user's name
  useEffect(() => {
    if (messages.length > 0 && messages[0].id === 'msg-welcome' && !messages[0].text.includes(userFirstName)) {
      setMessages(prev => [
        {
          ...prev[0],
          text: `Hello ${userFirstName}! ✨ I am your 365hopejourney Spiritual Guide. How may I support your heart, your prayers, and your reflections today?`
        },
        ...prev.slice(1)
      ]);
    }
  }, [userFirstName]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Save to localStorage
  useEffect(() => {
    try {
      const storageKey = `hopejourney_ai_chat_${userEmail}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, userEmail]);

  const quickPrompts = [
    '🕊️ A prayer for peace and anxious thoughts',
    '📖 Bible verse & motivation for my current struggle',
    '🌅 Rekindle my hope & spark for living today',
    '⏳ Guidance while waiting for a breakthrough'
  ];

  const generateLocalResponse = (userQuestion) => {
    const q = (userQuestion || '').toLowerCase();

    if (q.includes('anxiety') || q.includes('anxious') || q.includes('fear') || q.includes('panic') || q.includes('stress') || q.includes('worry') || q.includes('ansiedade') || q.includes('medo')) {
      return `${userFirstName}, take a quiet, gentle breath and let your shoulders drop. You are safe and deeply held in God's love. 🕊️

In this moment, let the promise of Philippians 4:6-7 anchor your soul:
"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds."

What this means for your heart:
Anxiety often tries to make us fight tomorrow's battles today. But God is walking with you step by step. When you surrender what you cannot control, His peace creates a fortress around your thoughts. Your life is valuable, and this storm will pass.

A prayer for your peace:
"Loving Father, pour Your calming presence over ${userFirstName}. Silence every fearful thought and fill their heart with deep serenity and unshakable faith. In Your name, Amen." 🙏✨

How does your spirit feel right now as you pause and reflect?`;
    }

    if (q.includes('sad') || q.includes('grief') || q.includes('depress') || q.includes('heavy') || q.includes('cry') || q.includes('hurt') || q.includes('pain') || q.includes('alone') || q.includes('lonely') || q.includes('triste') || q.includes('dor')) {
      return `${userFirstName}, your tender heart and your tears are precious before God. 🤍

Remember Psalm 34:18 and Psalm 30:5:
"The Lord is close to the brokenhearted and saves those who are crushed in spirit."
"Weeping may endure for a night, but joy comes with the morning."

What this means for you:
This heavy season is a passage, not your final destination. God is gently mending the broken pieces of your spirit. The spark in your eyes and the joy in your heart will return, brighter and stronger than ever before.

A prayer of comfort:
"Lord, hold ${userFirstName} closely today. Heal the silent hurts of their soul and breathe fresh life and radiant hope into their spirit. Amen." 🌅🕊️

What is one comforting thought you can hold onto today?`;
    }

    if (q.includes('hope') || q.includes('spark') || q.includes('give up') || q.includes('lost') || q.includes('tired') || q.includes('exhausted') || q.includes('purpose') || q.includes('esperança') || q.includes('desistir') || q.includes('brilho')) {
      return `${userFirstName}, let this truth reignite the fire within you: your story is not over. ✨

Stand on Jeremiah 29:11:
"'For I know the plans I have for you,' declares the Lord, 'plans to prosper you and not to harm you, plans to give you hope and a future.'"
And Isaiah 40:31:
"Those who hope in the Lord will renew their strength. They will soar on wings like eagles."

What this means for your journey:
Every trial you have survived has prepared you for the blessings ahead. The spark that made you love life is still inside you—it is just waiting to be rekindled. You have a divine calling, and your future is filled with purpose.

A prayer for renewed strength:
"Father, ignite a renewed passion for life in ${userFirstName}. Dispel every shadow of doubt and show them the beautiful future You have in store. Amen." 🌿✨

What is one blessing you are dreaming of seeing come to life?`;
    }

    if (q.includes('wait') || q.includes('patience') || q.includes('future') || q.includes('decision') || q.includes('esperar')) {
      return `${userFirstName}, God is never late, and your season of waiting is building your testimony. ⏳✨

Reflect on Ecclesiastes 3:11 and Romans 8:28:
"He has made everything beautiful in its time."
"All things work together for good to those who love God."

What this means for you:
While you wait, God is preparing both the blessing and you. Trust His perfect timing. What is truly meant for you will never pass you by.

A prayer for patience:
"Lord, grant ${userFirstName} clear guidance, restful patience, and unwavering trust in Your divine plan. Amen." 🕊️🌸`;
    }

    // General Spiritual Guidance & Hope Encouragement
    return `${userFirstName}, it is such a blessing to connect with your heart today. ✨

Be encouraged by Joshua 1:9:
"Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."

You are deeply loved, protected, and called to live with radiant faith, joy, and peace. Whatever is on your mind regarding "${userQuestion}", know that God's grace is more than enough to lift you up today.

A prayer for your day:
"Heavenly Father, bless ${userFirstName} with peace, clarity, and an overflowing enthusiasm for life. Guide their steps and fill their day with light. Amen." 🙏🤍

Tell me, how can I best pray for and support your journey today?`;
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    // Check Credits balance
    if ((credits ?? 0) <= 0) {
      openRechargeModal();
      return;
    }

    // Deduct 1 credit
    useCredit(1, userEmail, 'Spiritual Guide Question', 'Prayer & Reflection Consultation');

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text: text,
      time: currentTime
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const humanDelayMs = 1200 + Math.floor(Math.random() * 800);

    setTimeout(async () => {
      let aiResponseText = '';
      try {
        let currentSettings = appSettings;
        try {
          const saved = localStorage.getItem('hopejourney_settings');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') currentSettings = parsed;
          }
        } catch (e) {}

        const activeApiKey = (currentSettings?.claudeApiKey || currentSettings?.geminiApiKey || import.meta.env?.VITE_ANTHROPIC_API_KEY || '').trim();

        if (activeApiKey) {
          const historyForAI = messages.slice(1).map(m => ({
            sender: m.sender,
            text: m.text
          }));

          aiResponseText = await generateSpecialistAIResponse({
            userQuestion: text,
            userFirstName: userFirstName,
            conversationHistory: historyForAI,
            apiKey: activeApiKey,
            customPrompt: currentSettings?.aiSystemPrompt || '',
            aiModel: currentSettings?.aiModel || 'claude-sonnet-4-5-20250929',
            aiTone: currentSettings?.aiTone || 'warm_encouraging',
            temperature: typeof currentSettings?.aiTemperature === 'number' ? currentSettings.aiTemperature : 0.7
          });
        }
      } catch (err) {
        console.warn('AI API response notice, using local knowledge base:', err);
      }

      if (!aiResponseText || typeof aiResponseText !== 'string' || aiResponseText.trim().length === 0) {
        aiResponseText = generateLocalResponse(text);
      }

      let cleanReply = aiResponseText.trim();
      cleanReply = cleanReply
        .replace(/^(?:Hello|Hi|Hey|Greetings|Olá)\s+[^!.,:\n]+[!.,:]?\s*/i, '')
        .trim();

      const aiMsg = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: cleanReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      // Save consultation to Firestore
      try {
        if (db) {
          const qId = 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
          await setDoc(doc(db, 'specialist_questions', qId), {
            id: qId,
            author_email: (userEmail || '').trim().toLowerCase(),
            author_name: memberProfile.name || userFirstName,
            text: text,
            date: currentTime,
            status: 'answered_by_ai',
            answer: cleanReply,
            created_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Error saving question to Firestore:', err);
      }
    }, humanDelayMs);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-md mx-auto px-4 pt-3 pb-[78px]">
      {/* Specialist Header */}
      <div className="flex items-center justify-between px-1 mb-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xl shadow-xs overflow-hidden">
              <img
                src={aiDoctorAvatar}
                alt="365hopejourney Spiritual Guide"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Spiritual Guide
              </h2>
              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                <Sparkles size={10} /> 24/7 AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Sanctuary AI Mentor
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 2 && (
        <div className="mb-2 space-y-1 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Suggested questions:
          </span>
          <div className="flex flex-col gap-1">
            {quickPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-left text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-300 py-1.5 px-2.5 rounded-xl font-medium transition-all shadow-xs cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 p-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-300 shadow-xs shrink-0 bg-emerald-100">
                  <img
                    src={aiDoctorAvatar}
                    alt="Spiritual Guide"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-3xl p-4 shadow-xs text-xs leading-relaxed space-y-2.5 ${
                  isUser
                    ? 'bg-brand-500 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line text-xs leading-relaxed space-y-2 font-normal">
                  {msg.text}
                </div>
                <span
                  className={`block text-[9px] text-right font-medium pt-1 ${
                    isUser ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-300 shadow-xs shrink-0 bg-slate-100">
                  <img
                    src={userAvatar}
                    alt={userFirstName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-300 shadow-xs shrink-0 bg-emerald-100">
              <img
                src={aiDoctorAvatar}
                alt="Spiritual Guide"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl py-2.5 px-4 shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Docked Section: Credits & Input Bar */}
      <div className="shrink-0 pt-2">
        {/* Credits Notice Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 px-1">
          <div
            onClick={openRechargeModal}
            className="flex items-center gap-1.5 font-semibold text-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-2.5 py-1 rounded-full shadow-2xs cursor-pointer hover:border-amber-300 transition-colors"
          >
            <Zap size={12} className="fill-amber-500 text-amber-500" />
            <span>Credits: <strong className="text-amber-900">{credits ?? 20}</strong></span>
            <span className="text-[10px] text-amber-600 font-normal">(-1/msg)</span>
          </div>
          <button
            type="button"
            onClick={openRechargeModal}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
          >
            <Plus size={12} /> Add Credits
          </button>
        </div>

        {/* Input Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="bg-white rounded-3xl border border-slate-200 p-1.5 flex items-center gap-2 shadow-xs"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              (credits ?? 0) > 0
                ? 'Ask for prayers, reflections, or spiritual guidance...'
                : 'Out of credits! Click Add Credits to recharge...'
            }
            className="flex-1 text-xs text-slate-800 placeholder-slate-400 px-3.5 py-2 bg-transparent focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className={`p-2.5 rounded-2xl flex items-center justify-center transition-all ${
              inputMessage.trim() && !isTyping
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-xs active:scale-95 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={15} />
          </button>
        </form>

        {/* Spiritual AI Disclaimer */}
        <p className="text-[10px] text-slate-400 text-center leading-tight pt-1 px-2">
          <AlertCircle size={10} className="inline-block mr-1 text-slate-400 -mt-0.5" />
          365hopejourney AI is designed for spiritual comfort, reflection, and inspiration.
        </p>
      </div>
    </div>
  );
}
