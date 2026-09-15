import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Check,
  BookOpen,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Utensils,
  Gift,
  Calendar,
  Crown,
  Lock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useEbooks } from '../../context/EbookContext';

export default function RechargeCreditsModal({ isOpen, onClose }) {
  const { credits, addCredits } = useEbooks();

  const [selectedPlan, setSelectedPlan] = useState('100'); // '30' | '100' | '200'
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);

  if (!isOpen) return null;

  const plans = [
    {
      id: '30',
      amount: 30,
      perCredit: '$0.33 / credit',
      price: '$9.90',
      tag: null,
      saveTag: null
    },
    {
      id: '100',
      amount: 100,
      perCredit: '$0.20 / credit',
      price: '$19.99',
      tag: 'MOST POPULAR',
      saveTag: null
    },
    {
      id: '200',
      amount: 200,
      perCredit: '$0.15 / credit',
      price: '$29.99',
      tag: 'BEST VALUE',
      saveTag: 'Save 25%'
    }
  ];

  const handlePurchase = () => {
    const chosen = plans.find((p) => p.id === selectedPlan);
    if (!chosen) return;

    const priceNum = parseFloat(chosen.price.replace('$', '')) || 0;
    addCredits(chosen.amount, undefined, priceNum);
    setSuccessAmount(chosen.amount);
    setPurchaseSuccess(true);

    setTimeout(() => {
      setPurchaseSuccess(false);
      onClose();
    }, 2000);
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#091811] text-white rounded-t-3xl sm:rounded-3xl border border-emerald-500/20 shadow-2xl max-h-[94vh] overflow-y-auto relative animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        style={{
          background: 'linear-gradient(180deg, #0F281C 0%, #081710 40%, #040D09 100%)'
        }}
      >
        {/* Top Handle Bar for mobile drag indicator */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Ambient Top Glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-24 left-0 w-36 h-36 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header content */}
        <div className="p-6 pb-2 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 pr-2">
              <h2 className="text-2xl font-black tracking-tight text-white leading-tight font-serif">
                Recarregue seus <br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                  Créditos de Esperança ✨
                </span>
              </h2>
              <p className="text-xs text-emerald-200/70 leading-relaxed pt-1">
                Use seus créditos para consultas e reflexões aprofundadas com o Guia Espiritual IA e conteúdos exclusivos.
              </p>
            </div>

            {/* Glowing Orb / Sparkle Coin Avatar + Close Button */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <X size={17} />
              </button>

              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#0D2218] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 to-teal-500/30" />
                    <Sparkles size={24} className="text-emerald-300 fill-emerald-300/40 relative z-10" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black border border-[#081710]">
                  +
                </div>
              </div>
            </div>
          </div>

          {/* Current Balance Card */}
          <div className="mt-5 bg-[#102B1E]/90 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                <Zap size={18} className="fill-amber-400 text-amber-400" />
              </div>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-300/70">
                  Your Balance
                </span>
                <span className="block text-sm font-black text-white">
                  {credits ?? 20} credits
                </span>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-emerald-300/80 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Available now
            </span>
          </div>
        </div>

        {/* Success Confirmation Banner */}
        {purchaseSuccess && (
          <div className="mx-6 my-2 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1 animate-in zoom-in-95 duration-150">
            <CheckCircle2 size={28} className="text-emerald-400 mx-auto" />
            <h4 className="text-sm font-black text-emerald-200">
              +{successAmount} Health365 Credits Added!
            </h4>
            <p className="text-xs text-emerald-300/80">
              Your new balance is {credits} credits. Enjoy your consultations!
            </p>
          </div>
        )}

        {/* Pricing Tier Plans */}
        <div className="p-6 pt-3 space-y-3 relative z-10">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#143525] border-2 border-emerald-400 shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400/40'
                    : 'bg-[#0E2218]/80 hover:bg-[#122A1E] border border-emerald-500/20'
                }`}
              >
                {/* Top Badge (Most Popular / Best Value) */}
                {plan.tag && (
                  <div className="absolute -top-2.5 left-4">
                    <span
                      className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm text-white ${
                        plan.id === '100'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                      }`}
                    >
                      {plan.tag}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Radio circle */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-emerald-400/40 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-white">
                        {plan.amount} Health365 Credits
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-emerald-200/70 font-medium">
                          {plan.perCredit}
                        </span>
                        {plan.saveTag && (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.2 rounded-md">
                            {plan.saveTag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-base font-black text-white">{plan.price}</span>
                </div>
              </div>
            );
          })}

          {/* Continue CTA Button */}
          <button
            onClick={handlePurchase}
            className="w-full mt-2 py-4 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/35 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            <Sparkles size={16} className="fill-white" />
            <span>Continue</span>
          </button>
        </div>

        {/* Section: What Can You Do With Credits? */}
        <div className="px-6 pt-2 pb-6 space-y-4 relative z-10 border-t border-emerald-500/20">
          <div className="text-center pt-2 space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300">
              <span className="w-6 h-[1px] bg-emerald-500/40" />
              <Sparkles size={12} className="text-emerald-400" />
              <span>What Can You Do With Credits?</span>
              <Sparkles size={12} className="text-emerald-400" />
              <span className="w-6 h-[1px] bg-emerald-500/40" />
            </div>
            <p className="text-[11px] text-emerald-200/60 max-w-xs mx-auto">
              Credits unlock personalized guidance and direct access to Health365 Specialists.
            </p>
          </div>

          {/* 2x2 Feature Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Feature 1 */}
            <div className="bg-[#0F261B] border border-emerald-500/20 rounded-2xl p-3.5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <BookOpen size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white leading-tight">
                  Readings, Insights & Reports
                </h5>
                <span className="inline-block mt-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                  1-3 Credits
                </span>
                <p className="text-[10px] text-emerald-200/60 mt-1 leading-snug">
                  Unlock personalized meal plans, autophagy score & detox reports.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0F261B] border border-emerald-500/20 rounded-2xl p-3.5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white leading-tight">
                  Chat with AI Specialist
                </h5>
                <span className="inline-block mt-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                  1 Credit / msg
                </span>
                <p className="text-[10px] text-emerald-200/60 mt-1 leading-snug">
                  Get immediate answers to health & fasting questions in private chat.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0F261B] border border-emerald-500/20 rounded-2xl p-3.5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Utensils size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white leading-tight">
                  NutriPhoto Meal Scanner
                </h5>
                <span className="inline-block mt-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                  1 Credit
                </span>
                <p className="text-[10px] text-emerald-200/60 mt-1 leading-snug">
                  Analyze meal macros, glycemic spikes & inflammatory ingredients.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#0F261B] border border-emerald-500/20 rounded-2xl p-3.5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white leading-tight">
                  Personalized Guidance
                </h5>
                <span className="inline-block mt-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                  3-5 Credits
                </span>
                <p className="text-[10px] text-emerald-200/60 mt-1 leading-snug">
                  Receive tailored bio-individual health protocols and routine schedules.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Bottom Feature Highlights Row */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-[#0B1E15] border border-emerald-500/15 rounded-xl p-2.5 text-left space-y-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Gift size={13} />
              </div>
              <h6 className="text-[10px] font-bold text-white leading-tight">
                30 Credits Every Renewal
              </h6>
              <p className="text-[9px] text-emerald-200/60 leading-tight">
                Auto-added on each subscription renewal.
              </p>
            </div>

            <div className="bg-[#0B1E15] border border-emerald-500/15 rounded-xl p-2.5 text-left space-y-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Calendar size={13} />
              </div>
              <h6 className="text-[10px] font-bold text-white leading-tight">
                Instant Delivery
              </h6>
              <p className="text-[9px] text-emerald-200/60 leading-tight">
                Tokens available immediately in your account.
              </p>
            </div>

            <div className="bg-[#0B1E15] border border-emerald-500/15 rounded-xl p-2.5 text-left space-y-1">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Crown size={13} />
              </div>
              <h6 className="text-[10px] font-bold text-white leading-tight">
                Full Access All Features
              </h6>
              <p className="text-[9px] text-emerald-200/60 leading-tight">
                Credits + full access to all Health365 protocols.
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-3 text-[10px] text-emerald-200/60 pt-3 pb-2 font-medium">
            <div className="flex items-center gap-1">
              <Lock size={11} className="text-emerald-400" />
              <span>Secure Payment</span>
            </div>
            <span>•</span>
            <span>No Hidden Fees</span>
            <span>•</span>
            <span>Instant Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
