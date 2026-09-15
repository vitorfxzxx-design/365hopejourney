import React, { useState } from 'react';
import {
  Camera, Sparkles, CheckCircle2, ShieldCheck, Zap, Heart, ArrowRight,
  TrendingUp, Users, Award, Lock, ChevronRight, Star, Check, AlertCircle, Loader2, Clock, CheckCircle
} from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';

export default function NutriPhotoSalesPage({ onUnlockSuccess }) {
  const { currentUser, purchaseNutriPhoto } = useEbooks();
  const [selectedPlan, setSelectedPlan] = useState('annual'); // 'monthly' ($9.90) | 'annual' ($29.90)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // User details
  const memberProfile = (() => {
    try {
      const saved = localStorage.getItem('health365_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: currentUser?.name || 'Member',
      avatar: currentUser?.avatar || ''
    };
  })();

  const userEmail = currentUser?.email || 'member@health365.com';
  const userName = memberProfile.name || currentUser?.name || 'Valued Member';

  const handleOpenCheckout = (plan) => {
    if (plan) setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleConfirmPurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Register purchase in EbookContext & localStorage
      const purchasedRecord = purchaseNutriPhoto({
        planType: selectedPlan,
        email: userEmail,
        name: userName
      });

      setIsProcessing(false);
      setPurchaseSuccess(true);

      setTimeout(() => {
        setIsCheckoutOpen(false);
        if (onUnlockSuccess) {
          onUnlockSuccess(purchasedRecord);
        }
      }, 1300);
    }, 1100);
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 pb-28 select-none">
      {/* Ambient background glow effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-emerald-600/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Hero Banner (Sleek Dark & Glowing) */}
      <div className="relative overflow-hidden pt-8 pb-7 px-5 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-28 -left-10 w-40 h-40 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-black tracking-wide shadow-xs backdrop-blur-md">
            <Sparkles size={13} className="text-emerald-400 animate-pulse" />
            <span>AI FOOD SCANNER & MACRO COACH</span>
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Know Exactly What You Eat in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
                Under 3 Seconds.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              No more weighing food or tedious manual tracking. Just snap a photo of your plate — our advanced AI calculates calories, protein, healthy fats, and carbs instantly.
            </p>
          </div>

          {/* Social Proof & Rating */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover shadow-xs" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Member" />
                <img className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover shadow-xs" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Member" />
                <img className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover shadow-xs" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Member" />
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                <span className="text-emerald-400 font-extrabold">1,200+ plates</span> analyzed daily
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400">
              <Star size={11} className="fill-amber-400" />
              <span>4.9 / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* 📸 AI Live Scanner Mockup Showcase */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Live AI Vision Scan
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
              0.8s scan time
            </span>
          </div>

          {/* Scanned Meal Preview Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
              alt="Healthy Salmon & Avocado Bowl"
              className="w-full h-36 object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* AI Target Laser Box overlay */}
            <div className="absolute top-3 left-3 bg-emerald-500/90 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
              <Sparkles size={11} />
              <span>Salmon Avocado Bowl Identified</span>
            </div>

            {/* Macros Pill Bar */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 grid grid-cols-4 gap-1.5 text-center">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5">
                <span className="text-[9px] text-slate-400 uppercase block font-bold">Calories</span>
                <span className="text-xs font-black text-white">485 kcal</span>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5">
                <span className="text-[9px] text-emerald-400 uppercase block font-bold">Protein</span>
                <span className="text-xs font-black text-emerald-300">38g</span>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5">
                <span className="text-[9px] text-amber-400 uppercase block font-bold">Fats</span>
                <span className="text-xs font-black text-amber-300">22g</span>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5">
                <span className="text-[9px] text-blue-400 uppercase block font-bold">Carbs</span>
                <span className="text-xs font-black text-blue-300">18g</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 KEY HIGHLIGHT: Specialist Team Synchronization */}
        <div className="relative bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/30 border-2 border-emerald-500/50 rounded-3xl p-5 shadow-lg space-y-3 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Users size={20} className="font-black" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400 block">
                Exclusive Advantage
              </span>
              <h3 className="text-sm font-extrabold text-white">
                Direct Sync with Our Specialist Team
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Every plate you scan is <strong>automatically transmitted to the Health365 Specialist team</strong>. Our health experts see your real eating routine in real-time, allowing them to:
          </p>

          <div className="space-y-2 pt-1 text-xs text-slate-200">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Give tailored feedback on your exact portion sizes and food choices.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Spot hidden industrial seed oils or antinutrients holding you back.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Accelerate your fat loss, gut healing, and cellular energy results 10x faster.</span>
            </div>
          </div>
        </div>

        {/* 3 Step Interactive Visual Flow */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
            How NutriPhoto AI Works
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera size={14} className="text-emerald-400" />
                  Snap or Upload Any Plate
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Point your camera at your meal. Works with home cooking, restaurants, and snack bowls.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap size={14} className="text-teal-400" />
                  Instant AI Vision Breakdown
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  We recognize the food, calculate calories, proteins, healthy fats, and net carbs in 3 seconds.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-blue-400" />
                  Live Target Tracking & Guidance
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Your daily calorie bar updates automatically and the Health365 Specialist team has full visibility into your progress.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 💳 PRICING PLANS SELECTOR (HIGHLIGHT OF THE PAGE) */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Select Your Plan
            </h3>
            <span className="text-[10px] text-emerald-300 font-extrabold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40 animate-pulse">
              🎉 7-Day Free Trial Available
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {/* ANNUAL PLAN (With 7-Day Free Trial - HIGHLIGHTED) */}
            <div
              onClick={() => setSelectedPlan('annual')}
              className={`relative rounded-3xl p-5 border-2 transition-all cursor-pointer ${
                selectedPlan === 'annual'
                  ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/30 scale-[1.01]'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 shadow-sm'
              }`}
            >
              {/* Badge */}
              <div className="absolute -top-3.5 right-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Award size={13} className="fill-slate-950" />
                MOST POPULAR • 7 DAYS 100% FREE
              </div>

              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">Annual Plan</span>
                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40">
                      7 Days Free Trial
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Try for 7 days free. If you love it, pay only $2.49/mo ($29.90/year).
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-3xl font-black text-emerald-400">$0.00</div>
                  <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wide">due today</div>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-400 shrink-0 font-bold" />
                  <span><strong>7 Days 100% Free:</strong> Test all features with zero risk</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-400 shrink-0 font-bold" />
                  <span><strong>After 7 Days:</strong> Only $29.90/year (saves 75% vs monthly)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-400 shrink-0 font-bold" />
                  <span>Direct real-time sync with Health365 Specialist team</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-400 shrink-0 font-bold" />
                  <span>Cancel anytime in 1 click before day 7 with no charge</span>
                </div>
              </div>
            </div>

            {/* MONTHLY PLAN */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`relative rounded-3xl p-5 border-2 transition-all cursor-pointer ${
                selectedPlan === 'monthly'
                  ? 'bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border-blue-500 shadow-xl ring-2 ring-blue-500/30 scale-[1.01]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">Monthly Plan</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                      Flexible
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Month-to-month access, cancel anytime.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-white">$9.90</div>
                  <div className="text-[10px] text-slate-400 font-semibold">/month (USD)</div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-400 shrink-0" />
                  <span>Full AI Plate Scanner & Calorie Tracker</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-400 shrink-0" />
                  <span>Sync with Specialist Team</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trial Timeline Reassurance Box */}
          {selectedPlan === 'annual' && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="font-extrabold text-emerald-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-400" />
                <span>How Your 7-Day Free Trial Works:</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[9px] shrink-0 mt-0.5">1</span>
                  <span><strong>Today ($0.00):</strong> Instant access to unlimited plate scans and specialist sync.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[9px] shrink-0 mt-0.5">2</span>
                  <span><strong>Day 5:</strong> We send you a reminder notification before your trial ends.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[9px] shrink-0 mt-0.5">3</span>
                  <span><strong>Day 7:</strong> If you love it, you are billed $29.90 for the whole year. Otherwise, cancel with 1 tap.</span>
                </div>
              </div>
            </div>
          )}

          {/* High-Converting CTA Purchase Button */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => handleOpenCheckout(selectedPlan)}
              className="w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer hover:shadow-emerald-500/40"
            >
              <span>{selectedPlan === 'annual' ? 'Start 7-Day Free Trial ($0.00 Today) →' : 'Unlock Monthly Plan ($9.90 / mo) →'}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 font-medium">
              🔒 256-bit encrypted • Cancel anytime in 1 tap
            </p>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck size={22} />
          </div>
          <div className="text-[11px] text-slate-300 leading-snug">
            <span className="font-bold text-white block">7-Day 100% Free Trial & Guarantee</span>
            Test NutriPhoto AI with your daily meals for 7 days free. If you like it, continue automatically. Cancel anytime with zero fees.
          </div>
        </div>

      </div>

      {/* 💳 IN-APP CHECKOUT MODAL (Sleek Dark Glassmorphism) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {purchaseSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce border border-emerald-500/40">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-black text-white">
                  {selectedPlan === 'annual' ? '7-Day Free Trial Started! 🎉' : 'Access Unlocked! 🎉'}
                </h3>
                <p className="text-xs text-slate-400">
                  Your NutriPhoto AI Scanner is now active! Launching your scanner...
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Camera size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        {selectedPlan === 'annual' ? 'Start 7-Day Free Trial' : 'Instant Checkout'}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">NutriPhoto AI Access</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Plan Summary */}
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Selected Plan:</span>
                    <span className="font-bold text-white capitalize">
                      {selectedPlan === 'annual' ? 'Annual Plan (7 Days Free Trial)' : 'Monthly Plan (30 Days)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Member:</span>
                    <span className="font-mono text-emerald-400 text-[11px] truncate max-w-[180px] font-semibold">{userEmail}</span>
                  </div>
                  {selectedPlan === 'annual' ? (
                    <>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-extrabold">
                        <span className="text-slate-300">Due Today (7 Days Free):</span>
                        <span className="text-emerald-400 text-base font-black">$0.00 USD</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium text-right">
                        Then $29.90/year starting in 7 days. Cancel anytime.
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-extrabold">
                      <span className="text-slate-300">Total:</span>
                      <span className="text-emerald-400 text-base font-black">$9.90 USD</span>
                    </div>
                  )}
                </div>

                {/* Security & Action */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <Lock size={14} className="text-emerald-400 shrink-0" />
                    <span>
                      {selectedPlan === 'annual'
                        ? 'Try 7 days free. You will not be charged if you cancel before day 7.'
                        : '256-Bit Encrypted In-App Purchase. Immediate activation.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleConfirmPurchase}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-slate-950" />
                        <span>Activating NutriPhoto AI...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {selectedPlan === 'annual'
                            ? 'Start 7-Day Free Trial ($0.00)'
                            : 'Complete Order ($9.90)'}
                        </span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-400 py-1"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
