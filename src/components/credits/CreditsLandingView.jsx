import React, { useState } from 'react';
import {
  Sparkles, Zap, ShieldCheck, Check, BookOpen, MessageCircle,
  Gift, Crown, Heart, Shield, Lock, ArrowRight, HelpCircle, Star
} from 'lucide-react';

export default function CreditsLandingView({ onBack }) {
  const [selectedPlan, setSelectedPlan] = useState('100');

  const plans = [
    {
      id: '30',
      name: 'Starter Pack',
      amount: 30,
      price: '$9.90',
      perCredit: '$0.33 / credit',
      tag: null,
      saveTag: null,
      popular: false,
      checkoutUrl: 'https://pay.hotmart.com/L107627481C?off=cxzvr873',
      features: [
        '30 AI Spiritual Mentor Messages',
        'Direct Access to Prayer Reflections',
        'Instant Automatic Delivery to Account',
        'No Expiration Date'
      ]
    },
    {
      id: '100',
      name: 'Faith Growth Pack',
      amount: 100,
      price: '$19.90',
      perCredit: '$0.19 / credit',
      tag: 'MOST POPULAR',
      saveTag: 'Save 40%',
      popular: true,
      checkoutUrl: 'https://pay.hotmart.com/L107627481C?off=fcg91weh',
      features: [
        '100 AI Spiritual Mentor Messages',
        'Direct Access to Prayer Reflections',
        'Personalized Scripture Decrees',
        'Instant Automatic Delivery to Account',
        'Priority AI Response Speed',
        'No Expiration Date'
      ]
    },
    {
      id: '200',
      name: 'Sanctuary Master Pack',
      amount: 200,
      price: '$29.90',
      perCredit: '$0.14 / credit',
      tag: 'BEST VALUE',
      saveTag: 'Save 55%',
      popular: false,
      checkoutUrl: 'https://pay.hotmart.com/L107627481C?off=j8dgl1lg',
      features: [
        '200 AI Spiritual Mentor Messages',
        'All Devotional Guides & Prayers',
        'Complete Peace & Anxiety Relief Audios',
        'Instant Automatic Delivery to Account',
        'VIP AI Spiritual Mentoring',
        'Lifetime Credit Validity'
      ]
    }
  ];

  const handleGoToCheckout = (plan) => {
    // Redirects to Hotmart checkout
    if (plan && plan.checkoutUrl) {
      window.location.href = plan.checkoutUrl;
    }
  };

  return (
    <div className="min-h-screen bg-[#07130D] text-slate-100 selection:bg-emerald-500 selection:text-white flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-emerald-500/15 bg-[#091A12]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-amber-300/80 p-0.5 shadow-md shadow-amber-500/20 bg-gradient-to-tr from-amber-400 to-amber-200 shrink-0 overflow-hidden">
              <img
                src="/logo.png"
                alt="365 Hope Journey Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white font-serif">
                365 Hope Journey
              </h1>
              <span className="text-[11px] text-emerald-300/80 font-medium">
                Official Credits & Bonuses Sanctuary
              </span>
            </div>
          </div>

          <a
            href="/"
            className="text-xs font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-full transition-all"
          >
            Open WebApp &rarr;
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-14 px-4 text-center">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles size={14} className="text-amber-300 fill-amber-300" />
              <span>Official Hope Credits & Bonuses</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-serif">
              Recharge Your Hope Credits <br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                Deepen Your Spiritual Walk
              </span>
            </h2>

            <p className="text-sm sm:text-base text-emerald-200/70 max-w-xl mx-auto leading-relaxed">
              Fuel your daily prayers, private spiritual guidance consultations, and unlock personalized scripture devotions with instant credit reloads.
            </p>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-b from-[#143B2B] to-[#0D261B] border-2 border-emerald-400 shadow-2xl shadow-emerald-500/20 scale-[1.02] md:-translate-y-2'
                      : 'bg-[#0E2319]/90 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[#112A1E]'
                  }`}
                >
                  {/* Badge */}
                  {plan.tag && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md text-white bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-300/30">
                        {plan.tag}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-white font-serif">
                        {plan.name}
                      </h3>
                      {plan.saveTag && (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          {plan.saveTag}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs text-emerald-200/60 font-medium">
                        USD / one-time
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Zap size={14} className="fill-amber-400 text-amber-400" />
                      <span>{plan.amount} Hope Credits ({plan.perCredit})</span>
                    </div>

                    <hr className="my-6 border-emerald-500/20" />

                    {/* Features list */}
                    <ul className="space-y-3">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-emerald-100/80">
                          <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoToCheckout(plan);
                      }}
                      className={`w-full py-3.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                        plan.popular
                          ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 hover:opacity-95 shadow-emerald-500/30'
                          : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/30 hover:border-emerald-400'
                      }`}
                    >
                      <span>Select & Recharge</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* What You Can Do With Credits Section */}
        <section className="bg-[#091A12] border-t border-b border-emerald-500/15 py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-serif">
                How Hope Credits Work
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/70 max-w-lg mx-auto">
                Credits unlock personalized spiritual guidance, deep prayer reflections, and exclusive devotionals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0D2419] border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">24/7 AI Faith Mentor</h4>
                <p className="text-xs text-emerald-200/70 leading-relaxed">
                  Receive comforting words, biblical wisdom, and uplifting support tailored to what you are experiencing.
                </p>
                <span className="inline-block text-[10px] font-extrabold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  1 Credit / Message
                </span>
              </div>

              <div className="bg-[#0D2419] border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">Spiritual Devotionals</h4>
                <p className="text-xs text-emerald-200/70 leading-relaxed">
                  Unlock daily in-depth scriptures, study notes, and guided steps for peaceful reflection.
                </p>
                <span className="inline-block text-[10px] font-extrabold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  1-3 Credits
                </span>
              </div>

              <div className="bg-[#0D2419] border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">Custom Prayer Decrees</h4>
                <p className="text-xs text-emerald-200/70 leading-relaxed">
                  Generate tailored declarations of faith, protection, health, and family blessings.
                </p>
                <span className="inline-block text-[10px] font-extrabold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  1 Credit
                </span>
              </div>

              <div className="bg-[#0D2419] border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">Peace & Sleep Relief</h4>
                <p className="text-xs text-emerald-200/70 leading-relaxed">
                  Soothing audio prayers and guided meditations to calm anxiety and restore your soul.
                </p>
                <span className="inline-block text-[10px] font-extrabold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  2 Credits
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 py-16 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white font-serif">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-emerald-200/70">
              Everything you need to know about purchasing and using Hope Credits.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-[#0D2419] border border-emerald-500/20 rounded-2xl p-4 space-y-1">
              <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle size={15} className="text-emerald-400 shrink-0" />
                How are the credits added to my account?
              </h5>
              <p className="text-xs text-emerald-200/70 pl-6 leading-relaxed">
                Your credits are added automatically and instantly via webhook as soon as your payment is approved. Just make sure to use the same email you use in the 365 Hope Journey app.
              </p>
            </div>

            <div className="bg-[#0D2419] border border-emerald-500/20 rounded-2xl p-4 space-y-1">
              <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle size={15} className="text-emerald-400 shrink-0" />
                Do my Hope Credits expire?
              </h5>
              <p className="text-xs text-emerald-200/70 pl-6 leading-relaxed">
                No! Your Hope Credits never expire. You can use them whenever you need spiritual support, whether tomorrow or months from now.
              </p>
            </div>

            <div className="bg-[#0D2419] border border-emerald-500/20 rounded-2xl p-4 space-y-1">
              <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle size={15} className="text-emerald-400 shrink-0" />
                Is the checkout secure?
              </h5>
              <p className="text-xs text-emerald-200/70 pl-6 leading-relaxed">
                Yes. All transactions are securely processed by Hotmart with bank-grade 256-bit encryption. We never store your payment details.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-500/15 bg-[#06110B] py-8 text-center text-xs text-emerald-200/60 space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs font-medium">
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          <span>•</span>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="/help" className="hover:text-white transition-colors">Help & Support</a>
        </div>
        <p className="text-[11px] text-emerald-300/40">
          &copy; {new Date().getFullYear()} 365 Hope Journey. All rights reserved. Support: <span className="text-emerald-300">corefysystems@gmail.com</span>
        </p>
      </footer>
    </div>
  );
}
