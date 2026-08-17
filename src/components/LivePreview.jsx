'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  Sparkles,
  Lock,
  Unlock,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Facebook,
  Instagram,
  MessageCircle,
  Globe
} from 'lucide-react';

export default function LivePreview({ store }) {
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ state: 'idle', message: '' });
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipInput, setVipInput] = useState('');
  const [vipUnlocked, setVipUnlocked] = useState(false);
  const [vipError, setVipError] = useState('');

  // Countdown timer logic
  useEffect(() => {
    if (!store?.launchDate) return;

    const target = new Date(store.launchDate).getTime();
    if (isNaN(target)) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [store?.launchDate]);

  // Handle lead subscription test form in preview
  const handleTestSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail || !subEmail.includes('@')) {
      setSubStatus({ state: 'error', message: 'Enter a valid email address.' });
      return;
    }

    setSubStatus({ state: 'loading', message: 'Saving...' });
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail, storeId: store?.id || 'singhclo' }),
      });
      const data = await res.json();
      if (data && data.success) {
        setSubStatus({ state: 'success', message: '🎉 Added to VIP list successfully!' });
        setSubEmail('');
      } else {
        setSubStatus({ state: 'error', message: data.message || 'Error subscribing.' });
      }
    } catch (e) {
      setSubStatus({ state: 'success', message: '🎉 Added to VIP list (Simulator).' });
      setSubEmail('');
    }
  };

  const handleVipUnlock = (e) => {
    e.preventDefault();
    if (vipInput.trim() === (store?.passcode || 'vip2026')) {
      setVipUnlocked(true);
      setShowVipModal(false);
      setVipError('');
    } else {
      setVipError('Invalid passcode! Check passcode configured in dashboard.');
    }
  };

  const isLaunchMode = store?.mode === 'LAUNCH_SOON' && !vipUnlocked;

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-4 flex flex-col h-full">
      {/* Header & Device Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Live Storefront Simulator
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                device === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                device === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Viewport */}
      <div className="flex-1 flex items-center justify-center bg-black/50 rounded-xl border border-white/5 p-2 sm:p-4 overflow-hidden relative min-h-[480px]">
        {/* Mock Browser Frame */}
        <div
          className={`transition-all duration-300 w-full rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col ${
            device === 'mobile'
              ? 'max-w-[340px] h-[580px] bg-[#090a0f]'
              : 'max-w-full h-[580px] bg-[#090a0f]'
          }`}
        >
          {/* Mock Browser Bar */}
          <div className="bg-[#121522] px-3 py-2 border-b border-white/10 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex items-center gap-1 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5 text-[10px] text-slate-300 font-mono truncate max-w-[200px]">
              <Globe className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{store?.name?.toLowerCase().replace(/\s+/g, '')}.myshopify.com</span>
            </div>
            <div className="text-[10px]">
              {store?.mode === 'LIVE' ? (
                <span className="text-emerald-400 font-bold">🟢 Live</span>
              ) : vipUnlocked ? (
                <span className="text-indigo-400 font-bold">🔓 VIP Preview</span>
              ) : (
                <span className="text-amber-400 font-bold">⏳ Coming Soon</span>
              )}
            </div>
          </div>

          {/* Simulated Content Screen */}
          <div className="flex-1 overflow-y-auto relative p-4 flex flex-col justify-between text-center bg-[#090a0f]">
            {/* Ambient Lighting Orbs */}
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-indigo-600/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-pink-600/20 blur-2xl pointer-events-none" />

            {/* LIVE WEBSITE PREVIEW (If in LIVE mode or VIP bypass) */}
            {!isLaunchMode ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <Globe className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-extrabold text-white">
                  {store?.brandName || store?.name || 'Main Online Store'}
                </h4>
                <p className="text-xs text-emerald-300 font-semibold mt-1">
                  🟢 Store is LIVE & Open to Public
                </p>
                <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed">
                  Customers are currently browsing product catalog, collections, and purchasing normally.
                </p>
                {vipUnlocked && (
                  <button
                    onClick={() => setVipUnlocked(false)}
                    className="mt-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white border border-white/15"
                  >
                    Lock Back to Launch Soon Mode
                  </button>
                )}
              </div>
            ) : (
              /* LAUNCH SOON VIP PAGE PREVIEW */
              <div className="flex-1 flex flex-col justify-between relative z-10 py-2">
                {/* Brand Header */}
                <div className="pt-2">
                  {store?.logoUrl ? (
                    <img
                      src={store.logoUrl}
                      alt={store.brandName || 'Brand Logo'}
                      className="max-h-8 max-w-[140px] mx-auto object-contain mb-2"
                    />
                  ) : (
                    <h3 className="text-sm sm:text-base font-extrabold tracking-widest uppercase bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                      {store?.brandName || store?.name || 'SINGHCLO'}
                    </h3>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    LAUNCHING SOON
                  </span>
                </div>

                {/* Hero Headlines */}
                <div className="my-auto py-3">
                  <h2 className="text-base sm:text-xl font-extrabold text-white leading-tight tracking-tight whitespace-pre-line">
                    {store?.headline || 'Something Extraordinary\nIs On The Way'}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-2 max-w-[320px] mx-auto leading-relaxed">
                    {store?.subtitle || 'We are crafting an exclusive shopping experience curated just for you.'}
                  </p>

                  {/* Countdown Timer */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 my-4">
                    {[
                      { label: 'DAYS', val: timeLeft.days },
                      { label: 'HOURS', val: timeLeft.hours },
                      { label: 'MINS', val: timeLeft.minutes },
                      { label: 'SECS', val: timeLeft.seconds },
                    ].map((item, idx) => (
                      <React.Fragment key={item.label}>
                        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-2 min-w-[50px] sm:min-w-[58px] shadow-lg">
                          <span className="text-base sm:text-lg font-black text-white font-mono block leading-none">
                            {item.val}
                          </span>
                          <span className="text-[8px] font-bold text-slate-500 tracking-wider">
                            {item.label}
                          </span>
                        </div>
                        {idx < 3 && (
                          <span className="text-slate-600 font-black text-sm">:</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Lead Capture Form */}
                  <form onSubmit={handleTestSubscribe} className="max-w-[280px] mx-auto">
                    <div className="flex items-center bg-slate-900/90 border border-white/15 rounded-full p-1 shadow-md focus-within:border-indigo-500">
                      <input
                        type="email"
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        placeholder="VIP early access email..."
                        className="bg-transparent pl-3 pr-2 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none w-full"
                      />
                      <button
                        type="submit"
                        className="p-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold flex-shrink-0"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                    {subStatus.message && (
                      <p
                        className={`text-[10px] mt-1.5 font-medium ${
                          subStatus.state === 'success' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {subStatus.message}
                      </p>
                    )}
                  </form>

                  {/* Social links preview */}
                  <div className="flex items-center justify-center gap-2 mt-3 text-slate-400">
                    {store?.socials?.fb && (
                      <span className="p-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        <Facebook className="w-3 h-3" />
                      </span>
                    )}
                    {store?.socials?.ig && (
                      <span className="p-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        <Instagram className="w-3 h-3" />
                      </span>
                    )}
                    {store?.socials?.wa && (
                      <span className="p-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        <MessageCircle className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer with VIP Admin Unlock */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>&copy; {new Date().getFullYear()} {store?.brandName || 'SinghClo'}</span>
                  <button
                    onClick={() => setShowVipModal(true)}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>Admin VIP</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIP Passcode Simulator Modal */}
            {showVipModal && (
              <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#121522] border border-white/20 rounded-xl p-4 max-w-[260px] w-full text-center shadow-2xl">
                  <h4 className="text-xs font-bold text-white mb-1">VIP Preview Bypass</h4>
                  <p className="text-[10px] text-slate-400 mb-3">
                    Enter VIP passcode ({store?.passcode || 'vip2026'}) to unlock:
                  </p>
                  <form onSubmit={handleVipUnlock}>
                    <input
                      type="password"
                      value={vipInput}
                      onChange={(e) => setVipInput(e.target.value)}
                      placeholder="Enter Passcode..."
                      className="w-full px-2.5 py-1.5 text-xs bg-black/60 border border-white/15 rounded-lg text-white text-center font-mono mb-2 focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                    {vipError && (
                      <p className="text-[10px] text-rose-400 mb-2">{vipError}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowVipModal(false)}
                        className="flex-1 py-1 rounded-lg bg-white/5 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                      >
                        Unlock
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
