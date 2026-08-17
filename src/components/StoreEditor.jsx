'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Clock,
  Sparkles,
  Save,
  RotateCcw,
  KeyRound,
  Calendar,
  Share2,
  Image as ImageIcon,
  Type,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2
} from 'lucide-react';

export default function StoreEditor({
  store,
  onSave,
  onToggleMode,
  onDeleteStore,
  saving,
  toggling,
}) {
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('mode'); // 'mode' | 'content' | 'timer' | 'socials'
  const [showPasscode, setShowPasscode] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Sync state when selected store changes
  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        brandName: store.brandName || '',
        logoUrl: store.logoUrl || '',
        mode: store.mode || 'LIVE',
        headline: store.headline || 'Something Extraordinary\nIs On The Way',
        subtitle: store.subtitle || 'We are crafting an exclusive shopping experience curated just for you.',
        launchDate: store.launchDate ? new Date(store.launchDate).toISOString().slice(0, 16) : '',
        passcode: store.passcode || 'vip2026',
        socials: {
          fb: store.socials?.fb || '',
          ig: store.socials?.ig || '',
          tt: store.socials?.tt || '',
          wa: store.socials?.wa || '',
        },
      });
    }
  }, [store?.id, store?.updatedAt, store?.mode, store]);

  if (!store || !formData) {
    return (
      <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center text-slate-500">
        Select a store from the left list to configure.
      </div>
    );
  }

  const isLive = formData.mode === 'LIVE';

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      socials: {
        ...prev.socials,
        [key]: value,
      },
    }));
  };

  const handleSetLaunchOffset = (days) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    handleChange('launchDate', d.toISOString().slice(0, 16));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(store.id, {
      ...formData,
      launchDate: new Date(formData.launchDate).toISOString(),
    });
  };

  const handleCopyPasscode = () => {
    navigator.clipboard.writeText(formData.passcode || 'vip2026');
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-5 flex flex-col h-full">
      {/* Top Store Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-white">{formData.name}</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-indigo-300">
              ID: {store.id}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure mode, headline copy, countdown timer, and VIP passcode.
          </p>
        </div>

        {/* Save, Reset, and Delete Actions */}
        <div className="flex items-center gap-2">
          {onDeleteStore && (
            <button
              type="button"
              onClick={() => onDeleteStore(store.id, store.name)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-rose-500/30 transition-colors flex items-center gap-1"
              title="Delete this store"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (store) {
                setFormData({
                  name: store.name,
                  brandName: store.brandName,
                  logoUrl: store.logoUrl,
                  mode: store.mode,
                  headline: store.headline,
                  subtitle: store.subtitle,
                  launchDate: store.launchDate ? new Date(store.launchDate).toISOString().slice(0, 16) : '',
                  passcode: store.passcode,
                  socials: { ...store.socials },
                });
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
            Reset
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving...' : 'Save Config'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 my-3.5 p-1 bg-black/40 rounded-xl border border-white/5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('mode')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'mode'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Mode Switcher</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'content'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Brand & Copy</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'timer'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Launch Timer & VIP</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('socials')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'socials'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Media</span>
        </button>
      </div>

      {/* Form Content Area */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* TAB 1: MODE SWITCHER */}
        {activeTab === 'mode' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Active Storefront Experience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* LIVE OPTION */}
                <div
                  onClick={() => {
                    handleChange('mode', 'LIVE');
                    onToggleMode(store.id, 'LIVE');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isLive
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500/40'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-white">Live Store</h4>
                        <p className="text-[11px] text-emerald-400 font-medium">Main Website Active</p>
                      </div>
                    </div>
                    {isLive && (
                      <span className="p-1 rounded-full bg-emerald-500 text-black">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                    Visitors see your full Shopify online store, catalog, and checkout normally.
                  </p>
                </div>

                {/* LAUNCH SOON OPTION */}
                <div
                  onClick={() => {
                    handleChange('mode', 'LAUNCH_SOON');
                    onToggleMode(store.id, 'LAUNCH_SOON');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    !isLive
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-900/20 ring-1 ring-amber-500/40'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-white">Launch Soon</h4>
                        <p className="text-[11px] text-amber-400 font-medium">VIP Pre-Launch Mode</p>
                      </div>
                    </div>
                    {!isLive && (
                      <span className="p-1 rounded-full bg-amber-500 text-black">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                    Locks the store with an ultra-luxury countdown timer, lead capture, and secret VIP bypass.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Live Preview URL */}
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Store Status
                </span>
                <span className="text-xs text-white">
                  Currently running in{' '}
                  <strong className={isLive ? 'text-emerald-400' : 'text-amber-400'}>
                    {isLive ? '🟢 LIVE MODE' : '⏳ LAUNCH SOON MODE'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  Snippet ID: <code className="text-indigo-300 font-mono">{store.id}</code>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRAND & HERO COPY */}
        {activeTab === 'content' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Store Display Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Brand Title
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleChange('brandName', e.target.value)}
                  placeholder="e.g. SinghClo Luxury"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Brand Logo Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                placeholder="https://your-store.com/cdn/shop/files/logo.png"
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Launch Soon Headline
              </label>
              <textarea
                rows={2}
                value={formData.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                placeholder="Something Extraordinary&#10;Is On The Way"
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />
              <span className="text-[10px] text-slate-500">
                Tip: Press Enter for a line break in the headline.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Launch Soon Subtitle / Description
              </label>
              <textarea
                rows={3}
                value={formData.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="We are crafting an exclusive shopping experience curated just for you. Sign up for early VIP access..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 3: LAUNCH TIMER & VIP PASSCODE */}
        {activeTab === 'timer' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Target Launch Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.launchDate}
                onChange={(e) => handleChange('launchDate', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />

              {/* Quick Offset Shortcuts */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 mr-1">Quick Set:</span>
                {[
                  { label: '+1 Day', days: 1 },
                  { label: '+3 Days', days: 3 },
                  { label: '+7 Days', days: 7 },
                  { label: '+14 Days', days: 14 },
                  { label: '+30 Days', days: 30 },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => handleSetLaunchOffset(item.days)}
                    className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold border border-white/10 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* VIP Passcode */}
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <label className="text-xs font-bold text-white">VIP Admin Passcode</label>
                </div>
                <span className="text-[10px] text-indigo-300">Staff Preview Key</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={formData.passcode}
                    onChange={(e) => handleChange('passcode', e.target.value)}
                    placeholder="vip2026"
                    className="w-full pl-3 pr-10 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono tracking-wider focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPasscode}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                You or your team can enter this code in the launch page modal or append <code className="text-indigo-300 font-mono">?vip_pass={formData.passcode || 'vip2026'}</code> in URL to preview the live store anytime.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIAL MEDIA CHANNELS */}
        {activeTab === 'socials' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Leave blank to hide any social icon from the launch page.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={formData.socials.fb}
                onChange={(e) => handleSocialChange('fb', e.target.value)}
                placeholder="https://facebook.com/yourbrand"
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.socials.ig}
                onChange={(e) => handleSocialChange('ig', e.target.value)}
                placeholder="https://instagram.com/yourbrand"
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                TikTok URL
              </label>
              <input
                type="url"
                value={formData.socials.tt}
                onChange={(e) => handleSocialChange('tt', e.target.value)}
                placeholder="https://tiktok.com/@yourbrand"
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                WhatsApp Direct Link
              </label>
              <input
                type="url"
                value={formData.socials.wa}
                onChange={(e) => handleSocialChange('wa', e.target.value)}
                placeholder="https://wa.me/8801XXXXXXXXX"
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
