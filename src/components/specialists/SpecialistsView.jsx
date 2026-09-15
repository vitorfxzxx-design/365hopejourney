import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, User, CheckCircle2, AlertCircle, Zap, Plus, X, Loader2 } from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import { supabase } from '../../lib/supabase';
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
      const saved = localStorage.getItem('health365_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: currentUser?.name || 'Camila',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    };
  })();

  const userEmail = currentUser?.email || 'user@health365.com';
  const rawFirstName = memberProfile.name && memberProfile.name.toLowerCase() !== 'health365' && memberProfile.name.toLowerCase() !== 'member'
    ? memberProfile.name.split(/\s+/)[0]
    : (currentUser?.name && currentUser.name.toLowerCase() !== 'health365' ? currentUser.name.split(/\s+/)[0] : 'Camila');
  const userFirstName = rawFirstName ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase() : 'Camila';
  const userAvatar = memberProfile.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const aiDoctorAvatar = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80';

  const defaultWelcomeMsg = {
    id: 'msg-welcome',
    sender: 'ai',
    text: `Hello ${userFirstName}! 👋 I am your Health365 Specialist. How can I guide your diet, autophagy, hydration, or sleep protocol today?`,
    time: 'Just now'
  };

  const [messages, setMessages] = useState(() => {
    try {
      const storageKey = `health365_ai_specialist_chat_${userEmail}`;
      const saved = localStorage.getItem(storageKey) || localStorage.getItem('health365_ai_specialist_chat');
      return saved ? JSON.parse(saved) : [defaultWelcomeMsg];
    } catch (e) {
      return [defaultWelcomeMsg];
    }
  });

  // Load chat history from Supabase database for this user
  useEffect(() => {
    let isMounted = true;
    const cleanEmail = (userEmail || '').trim().toLowerCase();

    const fetchDBChatHistory = async () => {
      try {
        if (!cleanEmail) return;
        const { data, error } = await supabase
          .from('specialist_questions')
          .select('*')
          .ilike('author_email', cleanEmail)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0 && isMounted) {
          // Rebuild message history from Supabase records
          const loadedMessages = [defaultWelcomeMsg];
          data.forEach(item => {
            if (item.text) {
              const timeStr = item.date || (item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
              loadedMessages.push({
                id: `db-user-${item.id}`,
                sender: 'user',
                text: item.text,
                time: timeStr
              });
            }
            if (item.answer) {
              const timeStr = item.date || (item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
              loadedMessages.push({
                id: `db-ai-${item.id}`,
                sender: 'ai',
                text: item.answer,
                time: timeStr
              });
            }
          });
          setMessages(loadedMessages);
          localStorage.setItem(`health365_ai_specialist_chat_${cleanEmail}`, JSON.stringify(loadedMessages));
        }
      } catch (err) {
        console.warn('Could not sync chat from Supabase, using local state:', err);
      }
    };

    fetchDBChatHistory();

    // Subscribe to realtime updates for this user
    let channel;
    try {
      channel = supabase
        .channel(`specialist_chat_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'specialist_questions'
        }, (payload) => {
          if (payload?.new && (payload.new.author_email || '').toLowerCase() === cleanEmail) {
            fetchDBChatHistory();
          }
        })
        .subscribe();
    } catch (e) {}

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [userEmail]);

  // Keep welcome message updated with user's name
  useEffect(() => {
    if (messages.length > 0 && messages[0].id === 'msg-welcome' && !messages[0].text.includes(userFirstName)) {
      setMessages(prev => [
        {
          ...prev[0],
          text: `Hello ${userFirstName}! 👋 I am your Health365 Specialist. How can I guide your diet, autophagy, hydration, or sleep protocol today?`
        },
        ...prev.slice(1)
      ]);
    }
  }, [userFirstName]);

  // Persist locally
  useEffect(() => {
    const storageKey = `health365_ai_specialist_chat_${userEmail}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, userEmail]);

  const quickPrompts = [
    '☕ Can I drink coffee during intermittent fasting?',
    '🥑 What are the top anti-inflammatory fats to consume?',
    '💤 What is the recommended deep sleep autophagy window?',
    '🥩 Best protein sources for muscle retention while detoxing?'
  ];

  const generateAIResponse = (userQuestion) => {
    const q = (userQuestion || '').toLowerCase();

    // Lunch & Dinner
    if (q.includes('lunch') || q.includes('almoço') || q.includes('almoco') || q.includes('dinner') || q.includes('jantar')) {
      return `Hello ${userFirstName}! 🍽️ Here are two great meal options for your lunch or dinner:

Option 1 (Top 1 Ancestral Protocol - Maximum Nutrient Density):
• Grilled grass-fed steak, ribeye, or wild salmon cooked in ghee or butter
• 2 soft-boiled pasture-raised eggs or bone broth cup
• Mashed sweet potato or pumpkin with unrefined sea salt
• Slices of fresh orange or kiwi

Option 2 (Popular & Familiar Everyday Choice):
• Ground grass-fed beef or roasted chicken thighs
• Fluffy white jasmine rice cooked with garlic and extra virgin olive oil
• Steamed carrots, zucchini or a fresh mixed green salad
• A cup of whole natural yogurt or kefir with sliced berries

🚫 What to avoid:
Seed oils (canola, soybean, corn), margarine, fried breaded items, and commercial sauces with preservatives.

Which style do you feel like having today?`;
    }

    // Breakfast & General Meal Plan
    if (q.includes('breakfast') || q.includes('café da manhã') || q.includes('cafe da manha') || q.includes('meal plan') || q.includes('cardápio') || q.includes('cardapio') || q.includes('menu') || q.includes('another plan') || q.includes('plan')) {
      return `Hello ${userFirstName}! 🍳 Here are two delicious breakfast options designed for cellular energy:

Option 1 (Top 1 Ancestral Protocol - Light & Easy Absorption):
• 3 Pasture-raised eggs scrambled or fried in grass-fed butter or pork lard
• Slices of raw-milk artisan cheese (such as raw Cheddar or Minas artisan)
• 1 ripe banana or papaya drizzled with raw artisanal honey
• Pure black coffee or herbal tea (no sugar or sweeteners)

Option 2 (Popular & Familiar Real-Food Alternative):
• Warm tapioca or natural sourdough bread filled with scrambled eggs and cheese
• 1 cup of whole-milk natural yogurt or kefir with sliced strawberries
• 1/2 fresh avocado seasoned with a pinch of Celtic or Himalayan pink salt
• Pure black coffee or tea

🚫 Foods to Strictly Avoid:
Refined white bread, instant oatmeal with sugar, margarine, seed oils, and supermarket boxed juices.

How would you like to customize this for your morning routine?`;
    }

    if (q.includes('coffee') || q.includes('cafe') || q.includes('fasting') || q.includes('jejum')) {
      return `Yes, ${userFirstName}! ☕ Pure black coffee (without milk, cream, sugar, or artificial sweeteners) does not break your metabolic fast or trigger insulin spikes.

In fact, the natural polyphenols stimulate cellular autophagy and promote liver fat oxidation. Feel free to enjoy it during your fasting window!`;
    }

    if (q.includes('fat') || q.includes('gordura') || q.includes('oil') || q.includes('oleo') || q.includes('butter') || q.includes('manteiga')) {
      return `Hello ${userFirstName}! 🥑 Under the Health365 Ancestral Protocol, we embrace clean, natural whole-food fats and eliminate toxic industrial oils:

Top Recommended Fats:
• Grass-fed butter and Ghee
• Artisanal pork lard
• Cold-pressed Extra Virgin Olive Oil
• Pasture-raised egg yolks and fresh avocado

Prohibited Poisons:
Refined seed oils (soybean, canola, corn, sunflower) and margarine, as they trigger severe cellular inflammation.`;
    }

    // Non-extremist / Eating out / Cheating / Pizza / Parties / Guilt
    if (q.includes('cheat') || q.includes('pizza') || q.includes('never') || q.includes('party') || q.includes('festa') || q.includes('viagem') || q.includes('travel') || q.includes('out') || q.includes('rua') || q.includes('aniversário') || q.includes('birthday') || q.includes('can i eat') || q.includes('posso comer')) {
      return `Of course you can, ${userFirstName}! 😊

Here is our golden philosophy on emotional balance and food freedom:

1. Never Live in Extremes:
Emotional peace and joy with loved ones are just as crucial for your health as the food on your plate. Never place a heavy burden of guilt or anxiety on your life.

2. Your Home is Your Sacred Temple:
In your day-to-day kitchen routine, protect your temple. Eliminate the true daily poisons (industrial seed oils, margarine, artificial sweeteners, and ultra-processed packages). Eating clean at home builds your daily metabolic armor and prevents chronic cellular fatigue.

3. Out with Friends, Parties & Traveling:
When you are celebrating a birthday, traveling, or dining out with family, enjoy yourself freely and without paranoia! 

4. Your Body Has Astounding Resilience:
As long as the vast majority of what you eat at home is natural and nourishing, your body possesses an extraordinary capacity to detoxify, process, and regenerate after an occasional indulgence.

Enjoy life, stay consistent where it matters most, and feel great about your journey!`;
    }

    if (q.includes('sleep') || q.includes('sono') || q.includes('insomnia') || q.includes('autophagy') || q.includes('autofagia')) {
      return `Hello ${userFirstName}! 💤 Deep restorative sleep in total darkness is when 80% of cellular repair and autophagy occurs.

Golden Protocol for Deep Rest:
1. Finish your last meal at least 3 hours before going to bed.
2. Turn off blue light screens 60 minutes before sleeping.
3. Keep your room completely dark, cool, and quiet.`;
    }

    if (q.includes('protein') || q.includes('proteina') || q.includes('meat') || q.includes('carne') || q.includes('muscle')) {
      return `Hello ${userFirstName}! 💪 Focus on bioavailable ancestral proteins: Wild-caught fish (salmon, sardines, mackerel), grass-fed beef, pastured poultry, and whole eggs.

Aim for roughly 1.6g to 2.2g of protein per kg of ideal body weight distributed across your eating window.`;
    }

    if (q.includes('bone broth') || q.includes('caldo') || q.includes('gut') || q.includes('intestino')) {
      return `Bone broth is one of our foundational superfoods, ${userFirstName}! 🥣

It is loaded with bioavailable glycine, proline, and collagen to soothe and seal the gut lining. Drink 200ml to 300ml warm on an empty stomach in the morning or 30 minutes before breaking your fast.`;
    }

    if (q.includes('water') || q.includes('agua') || q.includes('hydration') || q.includes('hidratação')) {
      return `Proper hydration requires essential minerals, ${userFirstName}! 💧

Drink 35ml to 45ml of clean water per kg of body weight daily. Adding a pinch of unrefined Celtic or Himalayan pink salt replenishes electrolytes and optimizes cellular hydration.`;
    }

    return `Hello ${userFirstName}! 🌿 Regarding your question about "${userQuestion}":

Under the Health365 Protocol, we focus on single-ingredient foods from nature, prioritizing our Top 1 Light & Easy Absorption foods (grass-fed meat, pasture-raised eggs, raw cheeses, clean fats, fresh fruits, and raw honey) while strictly eliminating industrial seed oils and processed goods.

How can I tailor this specifically to your personal daily wellness routine?`;
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    // Check Health365 Credits balance
    if ((credits ?? 0) <= 0) {
      openRechargeModal();
      return;
    }

    const deducted = useCredit(1, userEmail);
    if (!deducted) {
      openRechargeModal();
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text,
      time: currentTime
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Realistic human-like response delay: variable 4 to 8 seconds
    const humanDelayMs = Math.floor(Math.random() * (8000 - 4000 + 1)) + 4000;

    setTimeout(async () => {
      let aiReply = '';
      try {
        let currentSettings = appSettings;
        try {
          const saved = localStorage.getItem('health365_settings');
          if (saved) currentSettings = { ...currentSettings, ...JSON.parse(saved) };
        } catch (e) {}

        let loggedMealsSummary = '';
        try {
          const userMealsSaved = localStorage.getItem(`health365_meals_${userEmail}`) || localStorage.getItem('health365_meals');
          if (userMealsSaved) {
            const parsedMeals = JSON.parse(userMealsSaved);
            if (Array.isArray(parsedMeals) && parsedMeals.length > 0) {
              const recentMeals = parsedMeals.slice(0, 5);
              loggedMealsSummary = `\n\nNUTRIPHOTO LOGGED MEALS BY THIS MEMBER:\n` +
                recentMeals.map(m => `- ${m.name} (${m.calories} kcal, ${m.protein}g protein, ${m.carbs}g carbs, ${m.fats}g fats)`).join('\n') +
                `\n(Use this real-time food log when giving personalized nutritional feedback).`;
            }
          }
        } catch (e) {}

        const finalSystemPrompt = (currentSettings?.aiSystemPrompt || '') + loggedMealsSummary;

        aiReply = await generateSpecialistAIResponse({
          userMessage: text,
          userName: userFirstName,
          history: messages,
          apiKey: currentSettings?.geminiApiKey || currentSettings?.claudeApiKey || '',
          systemPrompt: finalSystemPrompt,
          aiModel: currentSettings?.aiModel || 'claude-3-7-sonnet-20250219',
          aiTone: currentSettings?.aiTone || 'warm_encouraging',
          temperature: typeof currentSettings?.aiTemperature === 'number' ? currentSettings.aiTemperature : 0.7
        });
      } catch (err) {
        console.error('Error generating AI response:', err);
        aiReply = generateAIResponse(text);
      }

      if (!aiReply) {
        aiReply = generateAIResponse(text);
      }

      // Clean any raw markdown asterisks and repetitive greetings like "Hello [Name]!"
      let cleanReply = typeof aiReply === 'string' 
        ? aiReply.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '').trim()
        : aiReply;

      // Remove robotic starting greetings (Hello Health365!, Hello Camila!, etc.) if present
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

      // Save consultation to Supabase database for the user
      try {
        await supabase.from('specialist_questions').insert([
          {
            id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            author_email: (userEmail || '').trim().toLowerCase(),
            author_name: memberProfile.name || userFirstName,
            text: text,
            date: currentTime,
            status: 'answered_by_ai',
            answer: cleanReply
          }
        ]);
      } catch (err) {
        console.error('Error saving conversation to Supabase:', err);
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
                alt="Health365 AI Specialist"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                Health365 Specialist
              </h2>
              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                <Sparkles size={10} /> 24/7 AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Assistant
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
                className="text-left text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-300 py-1.5 px-2.5 rounded-xl font-medium transition-all shadow-xs"
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
                    alt="AI Doctor"
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
                alt="AI Doctor"
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

      {/* Bottom Docked Section: Credits & Input Bar (no dead space) */}
      <div className="shrink-0 pt-2">
        {/* Credits Notice Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 px-1">
          <div
            onClick={openRechargeModal}
            className="flex items-center gap-1.5 font-semibold text-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-2.5 py-1 rounded-full shadow-2xs cursor-pointer hover:border-amber-300 transition-colors"
          >
            <Zap size={12} className="fill-amber-500 text-amber-500" />
            <span>Health365 Credits: <strong className="text-amber-900">{credits ?? 20}</strong></span>
            <span className="text-[10px] text-amber-600 font-normal">(-1/msg)</span>
          </div>
          <button
            type="button"
            onClick={openRechargeModal}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs active:scale-95"
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
          className="bg-white rounded-3xl border border-slate-200 p-1.5 flex items-center gap-2 shadow-sm"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              (credits ?? 0) > 0
                ? 'Ask anything about protocols, diet or fasting...'
                : 'Out of credits! Click Add Credits to recharge...'
            }
            className="flex-1 text-xs text-slate-800 placeholder-slate-400 px-3.5 py-2 bg-transparent focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className={`p-2.5 rounded-2xl flex items-center justify-center transition-all ${
              inputMessage.trim() && !isTyping
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-xs active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={15} />
          </button>
        </form>

        {/* Medical & AI Disclaimer required by Apple / Google */}
        <p className="text-[10px] text-slate-400 text-center leading-tight pt-1 px-2">
          <AlertCircle size={10} className="inline-block mr-1 text-slate-400 -mt-0.5" />
          Health365 AI is for informational & educational purposes only, and does not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}


