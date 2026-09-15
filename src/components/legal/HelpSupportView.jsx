import React, { useState } from 'react';
import { Mail, HelpCircle, ArrowLeft, CheckCircle2, Copy, BookOpen, Camera, Headphones, MessageSquare, Shield } from 'lucide-react';

export default function HelpSupportView({ onBack }) {
  const [copied, setCopied] = useState(false);
  const supportEmail = 'corefysystems@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const faqs = [
    {
      icon: BookOpen,
      q: 'How do I access my devotionals and spiritual guides?',
      a: 'Once logged into your 365hopejourney member account, all unlocked guides and devotional books are available on the Home tab. Tap any book to read chapters with our distraction-free reader mode.'
    },
    {
      icon: Headphones,
      q: 'How do prayer and meditation audio sessions work?',
      a: 'Navigate to the Audios tab to listen to guided prayers, peaceful declarations, and spiritual reflections. You can play, pause, and seek through tracks anytime.'
    },
    {
      icon: MessageSquare,
      q: 'How do I ask questions to the AI Spiritual Guide?',
      a: 'Open the AI Guide tab to consult with our faith-based companion. You can ask for biblical references, personalized prayers, comforting verses, and morning reflections.'
    },
    {
      icon: MessageSquare,
      q: 'How do I share prayers and testimonies in the Community?',
      a: 'Visit the Community tab to post prayer requests, share testimonies of gratitude, and like posts from fellow believers in our sanctuary.'
    },
    {
      icon: Shield,
      q: 'How can I update my profile or delete my account?',
      a: 'Go to the Profile tab to update your display name and photo. To request account deletion or data export, you can do so in Settings or by contacting corefysystems@gmail.com.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-4 sm:p-6 pb-16">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20 shrink-0">
              ✨
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                365hopejourney
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Support Center
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">We are here to help you</p>
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Support Contact Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/15 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight">Need Help or Have Questions?</h2>
              <p className="text-xs text-emerald-100">Our support team is ready to assist you</p>
            </div>
          </div>

          <p className="text-xs text-emerald-50/90 leading-relaxed">
            For support inquiries, account assistance, access questions, or feedback, please contact us at:
          </p>

          <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 flex items-center justify-between gap-2 border border-white/20">
            <span className="font-mono font-bold text-xs sm:text-sm text-white select-all break-all">
              {supportEmail}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopyEmail}
                className="px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="Copy Email"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-200" />
                    <span className="text-emerald-100">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <a
            href={`mailto:${supportEmail}?subject=365hopejourney%20Support%20Request`}
            className="block text-center w-full py-2.5 rounded-xl bg-white text-emerald-800 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition-all cursor-pointer active:scale-98"
          >
            ✉️ Send Email to Support
          </a>
        </div>

        {/* Frequently Asked Questions */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
            <HelpCircle size={14} className="text-emerald-600" />
            Frequently Asked Questions
          </h3>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const Icon = faq.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Icon size={13} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{faq.q}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-1.5">
          <p className="text-[11px] text-slate-400 font-medium">
            365hopejourney App • Version 2.0.0
          </p>
          <p className="text-[10px] text-slate-400/80 leading-relaxed max-w-sm mx-auto">
            365hopejourney is dedicated to faith encouragement, daily devotionals, and spiritual growth.
          </p>
        </div>

      </div>
    </div>
  );
}