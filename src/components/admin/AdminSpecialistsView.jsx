import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, HelpCircle, Send, CheckCircle2, Trash2, Edit2, Clock, User, MessageSquare,
  Zap, Plus, Search, Mail, Sparkles, DollarSign, TrendingUp, Shield, CreditCard, RefreshCw,
  Bot, Sliders, Save, Check, Key, BookOpen, AlertCircle
} from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminSpecialistsView({ onBack }) {
  const {
    specialistQuestions,
    setSpecialistQuestions,
    answerSpecialistQuestion,
    members,
    setMembers,
    credits: activeCredits,
    getUserCredits,
    currentUser,
    userCreditsMap = {},
    setUserCreditsMap,
    addCredits,
    removeCredits,
    appSettings,
    setAppSettings
  } = useEbooks();

  const [activeTab, setActiveTab] = useState('training'); // 'training' | 'credits'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCreditsMember, setEditingCreditsMember] = useState(null);
  const [creditAction, setCreditAction] = useState('add'); // 'add' | 'remove'
  const [addCreditsAmount, setAddCreditsAmount] = useState(50);
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // AI Training Form State
  const [aiForm, setAiForm] = useState({
    geminiApiKey: appSettings?.geminiApiKey || '',
    aiSystemPrompt: appSettings?.aiSystemPrompt || '',
    aiModel: appSettings?.aiModel || 'gemini-1.5-flash',
    aiTone: appSettings?.aiTone || 'warm_encouraging',
    aiTemperature: typeof appSettings?.aiTemperature === 'number' ? appSettings.aiTemperature : 0.7
  });
  const [aiSaveSuccess, setAiSaveSuccess] = useState(false);

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

  const refreshBalances = async () => {
    setIsRefreshing(true);
    try {
      if (db) {
        const snap = await getDocs(collection(db, 'members'));
        if (!snap.empty) {
          const remoteMembers = snap.docs.map(d => d.data());
          if (setMembers) {
            setMembers(remoteMembers);
            localStorage.setItem('hopejourney_members', JSON.stringify(remoteMembers));
          }
        }
      }
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshBalances();
  }, []);

  const [specialistsTabActive, setSpecialistsTabActive] = useState(() => {
    try {
      return localStorage.getItem('health365_specialists_tab_active') !== 'false';
    } catch (e) {
      return true;
    }
  });

  const [answerDrafts, setAnswerDrafts] = useState({});
  const [editingAnswerId, setEditingAnswerId] = useState(null);

  // Load members and synchronize their real credits
  const creditsMap = userCreditsMap || {};
  const membersCreditsList = (members || []).map((m) => {
    const emailKey = (m.email || '').toLowerCase();
    const statsFromMap = creditsMap[emailKey] || {};
    const statsFromProducts = parseMemberStatsFromProducts(m.products);

    let currentBal = undefined;
    if (statsFromProducts.currentCredits !== undefined) {
      currentBal = statsFromProducts.currentCredits;
    } else if (statsFromMap.currentCredits !== undefined) {
      currentBal = statsFromMap.currentCredits;
    } else {
      currentBal = getUserCredits ? getUserCredits(emailKey) : 20;
    }

    const totalPurchased = statsFromProducts.totalPurchasedCredits || statsFromMap.totalPurchasedCredits || 0;
    const totalSpentNum = statsFromProducts.totalSpentUSD || statsFromMap.totalSpentUSD || 0;
    const totalSpent = typeof totalSpentNum === 'number' ? `$${totalSpentNum.toFixed(2)}` : (totalSpentNum ? `$${totalSpentNum}` : '$0.00');
    const lastPurchase = statsFromProducts.lastPurchaseDate || statsFromMap.lastPurchaseDate || m.date || '9/8/2026';

    return {
      id: m.id,
      name: m.name || m.email?.split('@')[0] || 'Member',
      email: m.email,
      status: m.status || 'Active',
      currentCredits: currentBal,
      totalPurchasedCredits: totalPurchased,
      totalSpentUSD: totalSpent,
      lastPurchaseDate: lastPurchase,
      tier: currentBal >= 100 ? 'Platinum VIP' : (currentBal >= 40 ? 'Gold VIP' : (currentBal > 0 ? 'Member' : 'Standard'))
    };
  });

  const handleToggleTab = () => {
    const nextState = !specialistsTabActive;
    setSpecialistsTabActive(nextState);
    localStorage.setItem('health365_specialists_tab_active', String(nextState));
  };

  const handleSendAnswer = (questionId) => {
    const draft = answerDrafts[questionId]?.trim();
    if (!draft) return;

    answerSpecialistQuestion(questionId, draft);
    setAnswerDrafts(prev => ({ ...prev, [questionId]: '' }));
    setEditingAnswerId(null);
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updated = specialistQuestions.filter(q => q.id !== id);
      setSpecialistQuestions(updated);
      localStorage.setItem('health365_specialist_questions', JSON.stringify(updated));
    }
  };

  const handleOpenAddCredits = (member, action = 'add') => {
    setEditingCreditsMember(member);
    setCreditAction(action);
    setAddCreditsAmount(action === 'remove' ? Math.min(20, member.currentCredits || 1) : 50);
    setModalOpen(true);
  };

  const handleSaveCreditsAction = (e) => {
    e.preventDefault();
    if (!editingCreditsMember) return;

    const amount = parseInt(addCreditsAmount, 10) || 0;
    const isRemove = creditAction === 'remove';
    const emailKey = (editingCreditsMember.email || '').toLowerCase();

    if (isRemove) {
      removeCredits(amount, emailKey);
    } else {
      addCredits(amount, emailKey, 0);
    }

    setModalOpen(false);
  };



  const handleSaveAiSettings = (e) => {
    e?.preventDefault();
    const updatedSettings = {
      ...appSettings,
      geminiApiKey: aiForm.geminiApiKey.trim(),
      aiSystemPrompt: aiForm.aiSystemPrompt.trim(),
      aiModel: aiForm.aiModel,
      aiTone: aiForm.aiTone,
      aiTemperature: Number(aiForm.aiTemperature) || 0.7
    };
    setAppSettings(updatedSettings);
    localStorage.setItem('health365_settings', JSON.stringify(updatedSettings));
    setAiSaveSuccess(true);
    setTimeout(() => setAiSaveSuccess(false), 3500);
  };

  // Filtered members list
  const filteredCreditsMembers = membersCreditsList.filter((m) =>
    (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics calculation
  const totalCreditsInCirculation = membersCreditsList.reduce((acc, m) => acc + (m.currentCredits || 0), 0);
  const totalCreditsPurchasedAllTime = membersCreditsList.reduce((acc, m) => acc + (m.totalPurchasedCredits || 0), 0);
  const activeMembersCount = membersCreditsList.length;

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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Specialists & Health365 Credits
              </h1>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200/60">
                <Zap size={11} className="fill-amber-500 text-amber-500" /> Token Economy
              </span>
              <button
                onClick={refreshBalances}
                disabled={isRefreshing}
                title="Refresh Real-time Balances"
                className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all shadow-xs flex items-center gap-1 text-[11px] font-bold cursor-pointer"
              >
                <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
                <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Balances'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Track platform users, available balances, and credit purchase history
            </p>
          </div>
        </div>

        {/* Setting Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base shrink-0">
              <Zap size={20} className="fill-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">
                Specialists Member Tab & Credit Deductions
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Each AI Specialist consultation message costs 1 Health365 Credit per interaction.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggleTab}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
              specialistsTabActive ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                specialistsTabActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Tab Navigation: AI Training & Prompt vs User Credits */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'training'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Bot size={15} />
            <span>AI Specialist Training & Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab('credits')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'credits'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Zap size={15} className="fill-amber-400 text-amber-400" />
            <span>User Wallets & Credits Economy</span>
          </button>
        </div>

        {/* ================= TAB 1: AI TRAINING & PROMPT ================= */}
        {activeTab === 'training' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* AI Notification Alert on Success */}
            {aiSaveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-bold shadow-xs animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>AI Specialist instructions and rules updated successfully! Real-time responses are now using your latest training.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveAiSettings} className="space-y-6">
              {/* Card 1: System Personality & Instructions */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Bot size={22} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        AI Specialist Prompt & Knowledge Base
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Define the personality, doctrine, medical disclaimers, and specific answers for the 24/7 Health365 Specialist
                      </p>
                    </div>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={11} /> 24/7 Real-Time
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Core System Prompt (Behavior, Protocols & Guidelines):</span>
                    <span className="text-[10px] text-slate-400 font-normal">Supports full markdown instructions</span>
                  </label>
                  <textarea
                    rows={12}
                    value={aiForm.aiSystemPrompt}
                    onChange={(e) => setAiForm({ ...aiForm, aiSystemPrompt: e.target.value })}
                    placeholder="Enter the system instructions for how the AI should introduce itself, answer questions, structure answers, recommend protocols, and handle safety/disclaimers..."
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono leading-relaxed focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Card 2: AI Model & Style Settings */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Model Engine & Anthropic Claude API Key
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Configure your Anthropic Claude API key and select the Claude model version
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* API Key */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Key size={13} className="text-amber-500" />
                      <span>Anthropic Claude API Key:</span>
                    </label>
                    <input
                      type="password"
                      value={aiForm.geminiApiKey}
                      onChange={(e) => setAiForm({ ...aiForm, geminiApiKey: e.target.value })}
                      placeholder="sk-ant-api03-..."
                      className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    />
                    <p className="text-[10px] text-slate-400">
                      Paste your Anthropic Claude API Key (starts with <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-800 font-bold">sk-ant-...</code>).
                    </p>
                  </div>

                  {/* AI Model */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Claude Model Engine:
                    </label>
                    <select
                      value={aiForm.aiModel || 'claude-sonnet-4-5-20250929'}
                      onChange={(e) => setAiForm({ ...aiForm, aiModel: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white focus:outline-hidden font-semibold"
                    >
                      <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5 (State of the art — Fast, Intelligent & Recommended)</option>
                      <option value="claude-sonnet-4-6">Claude Sonnet 4.6 (Next-Gen High Reasoning)</option>
                      <option value="claude-opus-4-6">Claude Opus 4.6 (Deep Elite Intelligence)</option>
                      <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (Ultra Low Latency)</option>
                    </select>
                  </div>

                  {/* AI Tone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Tone of Voice:
                    </label>
                    <select
                      value={aiForm.aiTone}
                      onChange={(e) => setAiForm({ ...aiForm, aiTone: e.target.value })}
                      className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                    >
                      <option value="warm_encouraging">Warm, Empathetic & Motivating (Recommended)</option>
                      <option value="scientific_direct">Scientific & Direct (Nutritional Facts & Actionable)</option>
                      <option value="clinical_formal">Professional & Formal</option>
                      <option value="holistic_guide">Holistic & Lifestyle-focused</option>
                    </select>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Instant real-time synchronization with all users</span>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Save size={15} />
                    <span>Save AI Specialist Training</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 2: CREDITS & WALLETS ================= */}
        {activeTab === 'credits' && (
          <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search Bar */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden shadow-xs"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-4 px-6">User / Member</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Current Credits</th>
                    <th className="py-4 px-6">Total Purchased</th>
                    <th className="py-4 px-6">Total Spent</th>
                    <th className="py-4 px-6">Last Purchase</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredCreditsMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        No members found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredCreditsMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-emerald-500 to-lime-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 block text-xs">
                                {member.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {member.tier}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400" />
                            <span>{member.email}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-bold">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60 shadow-xs">
                            <Zap size={11} className="fill-amber-500 text-amber-500" />
                            {member.currentCredits} credits
                          </span>
                        </td>

                        <td className="py-4 px-6 font-bold text-slate-700">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            <Sparkles size={11} className="text-emerald-600" />
                            {member.totalPurchasedCredits} tokens
                          </span>
                        </td>

                        <td className="py-4 px-6 font-bold text-slate-800">
                          {member.totalSpentUSD}
                        </td>

                        <td className="py-4 px-6 text-slate-500 text-[11px]">
                          {member.lastPurchaseDate}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAddCredits(member, 'add')}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Plus size={12} /> Add
                            </button>
                            <button
                              onClick={() => handleOpenAddCredits(member, 'remove')}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Manual Add / Remove Credits Modal */}
      {modalOpen && editingCreditsMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    creditAction === 'remove'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <Zap
                    size={16}
                    className={
                      creditAction === 'remove'
                        ? 'fill-rose-500 text-rose-500'
                        : 'fill-amber-500 text-amber-500'
                    }
                  />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {creditAction === 'remove' ? 'Remove Hope Credits' : 'Add Hope Credits'}
                  </h3>
                  <p className="text-[11px] text-slate-400">{editingCreditsMember.name}</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Action Switcher: Add or Remove Tab */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setCreditAction('add')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  creditAction === 'add'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Plus size={13} />
                Add Credits
              </button>
              <button
                type="button"
                onClick={() => setCreditAction('remove')}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  creditAction === 'remove'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Trash2 size={13} />
                Remove Credits
              </button>
            </div>

            <form onSubmit={handleSaveCreditsAction} className="space-y-4">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1 font-semibold">
                  {creditAction === 'remove'
                    ? 'Select Amount of Credits to Deduct:'
                    : 'Select Amount of Credits to Add:'}
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddCreditsAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        addCreditsAmount === amt
                          ? creditAction === 'remove'
                            ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs'
                            : 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {creditAction === 'remove' ? `-${amt}` : `+${amt}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1 font-semibold">
                  Custom Credit Amount:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={addCreditsAmount}
                  onChange={(e) => setAddCreditsAmount(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              {/* Dynamic Balance Preview */}
              <div
                className={`p-3 rounded-2xl border text-[11px] space-y-0.5 ${
                  creditAction === 'remove'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-amber-50/60 border-amber-100 text-amber-900'
                }`}
              >
                <div>
                  Current Balance: <strong>{editingCreditsMember.currentCredits} credits</strong>
                </div>
                <div>
                  New Balance after {creditAction === 'remove' ? 'deduction' : 'top-up'}:{' '}
                  <strong>
                    {creditAction === 'remove'
                      ? Math.max(0, (editingCreditsMember.currentCredits || 0) - (parseInt(addCreditsAmount, 10) || 0))
                      : (editingCreditsMember.currentCredits || 0) + (parseInt(addCreditsAmount, 10) || 0)}{' '}
                    credits
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all active:scale-95 ${
                    creditAction === 'remove'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {creditAction === 'remove' ? 'Confirm & Remove' : 'Confirm & Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


