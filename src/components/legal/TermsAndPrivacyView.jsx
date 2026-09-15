import React, { useState } from 'react';
import { Shield, FileText, Lock, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function TermsAndPrivacyView({ onBack }) {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-10 space-y-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20">
              🍏
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                Health365
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Legal & Policies
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Last updated: September 2026</p>
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to App</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'terms'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText size={15} />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield size={15} />
            <span>Privacy Policy (GDPR / CCPA)</span>
          </button>
        </div>

        {/* Content Section */}
        {activeTab === 'terms' ? (
          <div className="space-y-6 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
            
            {/* Medical Disclaimer Banner */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-1.5">
              <h3 className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600" />
                Mandatory Medical & Health Disclaimer
              </h3>
              <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                The content, meal tracking, protocols, and AI Specialist assistance provided by Health365 are strictly for educational and informational wellness purposes. Health365 is not a medical provider, clinic, or certified diagnostic entity. The materials do not substitute professional medical advice, clinical diagnosis, or prescribed medical treatment. Always consult a licensed physician before starting any new diet or fasting protocol.
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By creating an account, accessing, or utilizing the Health365 application and related digital services, you confirm that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these terms, you must not use or access the service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">2. User Accounts & Access</h2>
              <p>
                You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use or security breach.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">3. Health365 AI Specialist & Credits</h2>
              <p>
                Health365 provides AI-powered guidance and educational chatbot capabilities using credit-based or subscription access. Responses generated by the AI Specialist are automated and should not be considered medical prescriptions. Credits are non-transferable and subject to active platform rules.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">4. Account Deletion & Data Rights</h2>
              <p>
                In compliance with Apple App Store and Google Play guidelines, users have the absolute right to delete their account at any time directly through the application settings. Deleting an account will permanently erase your personal identification, AI chat logs, meal history, and associated tokens.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">5. Subscriptions & Billing</h2>
              <p>
                Access to premium eBooks, community features, and recurring credit allocations may require paid membership. Subscriptions may be managed or cancelled at any time through your account preferences or payment provider.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">6. Contact Information</h2>
              <p>
                If you have questions regarding these Terms, please reach out to our team at <strong>corefysystems@gmail.com</strong>.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
            
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 space-y-1.5">
              <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                <Lock size={14} className="text-emerald-600" />
                Our Commitment to Your Privacy
              </h3>
              <p className="text-xs text-emerald-900/90 leading-relaxed font-medium">
                Health365 is committed to safeguarding your personal and dietary data with industry-standard encryption. We never sell or distribute your personal health information to third-party data brokers.
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">1. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Account Data:</strong> Name, email address, and profile photo used for authentication.</li>
                <li><strong>Dietary & Meal Logging:</strong> Photos of meals and nutritional metrics logged into the NutriPhoto calorie tracker.</li>
                <li><strong>AI Specialist Interactions:</strong> Inquiries submitted to the AI assistant to provide tailored nutritional suggestions.</li>
                <li><strong>Device & Notification Tokens:</strong> Push notification tokens used solely for delivering scheduled health and hydration reminders.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">2. How We Use Your Data</h2>
              <p>
                We use collected information exclusively to deliver, maintain, and personalize the Health365 user experience, track dietary progress, sync eBook chapters, and provide responses from our AI Specialist.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">3. Storage & Encryption</h2>
              <p>
                All sensitive communications and meal records are transmitted via secure HTTPS (TLS 1.3) protocols and stored securely in encrypted cloud databases backed by Supabase with Row-Level Security (RLS) enforcement.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">4. Right to Erasure & GDPR Compliance</h2>
              <p>
                Users residing in the European Union (GDPR), California (CCPA), or worldwide may request complete erasure of their data at any moment by using the "Delete Account" button in App Settings or by contacting <strong>corefysystems@gmail.com</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-900">5. Third-Party Services</h2>
              <p>
                Health365 integrates with trusted infrastructure partners (e.g., Supabase for database operations and Stripe/Kiwify for secure payment processing). These providers process data strictly in compliance with applicable privacy regulations.
              </p>
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>&copy; 2026 Health365. All rights reserved.</span>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('terms')} className="hover:text-emerald-700 underline">Terms of Service</button>
            <button onClick={() => setActiveTab('privacy')} className="hover:text-emerald-700 underline">Privacy Policy</button>
          </div>
        </div>

      </div>
    </div>
  );
}
