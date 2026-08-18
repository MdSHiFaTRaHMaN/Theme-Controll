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
  Trash2,
  Sliders,
  ShieldCheck,
  Zap,
  Layers,
  CheckCircle,
  XCircle
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
  const [copiedLiquid, setCopiedLiquid] = useState(false);

  // Sync state when selected store changes
  useEffect(() => {
    if (store) {
      const isShowHome = store.showHomepage !== undefined ? Boolean(store.showHomepage) : (store.mode === 'LIVE');
      setFormData({
        name: store.name || '',
        brandName: store.brandName || '',
        domain: store.domain || '',
        themeId: store.themeId || '',
        targetScope: store.targetScope || 'homepage_only',
        showHomepage: isShowHome,
        logoUrl: store.logoUrl || '',
        mode: isShowHome ? 'LIVE' : 'LAUNCH_SOON',
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
  }, [store?.id, store?.updatedAt, store?.mode, store?.showHomepage, store]);

  if (!store || !formData) {
    return (
      <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center text-slate-500">
        Select a store from the left list to configure.
      </div>
    );
  }

  const isHomepageYes = formData.showHomepage === true;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleHomepageVisibility = (val) => {
    const isYes = val === true || val === 'yes';
    setFormData((prev) => ({
      ...prev,
      showHomepage: isYes,
      mode: isYes ? 'LIVE' : 'LAUNCH_SOON',
    }));
    onToggleMode(store.id, isYes ? 'LIVE' : 'LAUNCH_SOON');
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
      mode: formData.showHomepage ? 'LIVE' : 'LAUNCH_SOON',
      launchDate: formData.launchDate ? new Date(formData.launchDate).toISOString() : new Date().toISOString(),
    });
  };

  const handleCopyPasscode = () => {
    navigator.clipboard.writeText(formData.passcode || 'vip2026');
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleCopyLiquidSnippet = () => {
    const code = `{% render 'store-mode-controller' %}`;
    navigator.clipboard.writeText(code);
    setCopiedLiquid(true);
    setTimeout(() => setCopiedLiquid(false), 2000);
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
            {formData.domain && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" />
                {formData.domain}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Homepage & Store Mode Switcher with Store URL / Theme ID control.
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
                const isShow = store.showHomepage !== undefined ? Boolean(store.showHomepage) : (store.mode === 'LIVE');
                setFormData({
                  name: store.name,
                  brandName: store.brandName,
                  domain: store.domain || '',
                  themeId: store.themeId || '',
                  targetScope: store.targetScope || 'homepage_only',
                  showHomepage: isShow,
                  logoUrl: store.logoUrl,
                  mode: isShow ? 'LIVE' : 'LAUNCH_SOON',
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
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
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
          <Sliders className="w-3.5 h-3.5" />
          <span>Homepage Yes / No</span>
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
          <span>Social Links</span>
        </button>
      </div>

      {/* Form Content Area */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* TAB 1: HOMEPAGE YES / NO CONTROLLER */}
        {activeTab === 'mode' && (
          <div className="space-y-4">
            {/* Primary Big Yes/No Controller Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-black/60 to-indigo-950/20 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Shopify Homepage Display Controller</span>
                  </span>
                  <h3 className="text-sm font-extrabold text-white mt-0.5">
                    Show Live Homepage on Shopify Store?
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 shadow-sm ${
                    isHomepageYes 
                      ? 'bg-emerald-500 text-black shadow-emerald-500/20' 
                      : 'bg-amber-500 text-black shadow-amber-500/20'
                  }`}>
                    {isHomepageYes ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>{isHomepageYes ? 'YES (Live Homepage)' : 'NO (Coming Soon)'}</span>
                  </span>
                </div>
              </div>

              {/* Big Interactive 2-Card Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* YES: LIVE HOMEPAGE */}
                <div
                  onClick={() => handleToggleHomepageVisibility(true)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isHomepageYes
                      ? 'bg-emerald-950/50 border-emerald-500 shadow-lg shadow-emerald-900/30 ring-2 ring-emerald-500/40'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-white">YES</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            Show Homepage
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                          Live Storefront Visible
                        </p>
                      </div>
                    </div>
                    {isHomepageYes && (
                      <span className="p-1.5 rounded-full bg-emerald-500 text-black">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed">
                    Shoppers see your normal Shopify homepage, banners, products, collections, and checkout seamlessly.
                  </p>
                </div>

                {/* NO: COMING SOON */}
                <div
                  onClick={() => handleToggleHomepageVisibility(false)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    !isHomepageYes
                      ? 'bg-amber-950/50 border-amber-500 shadow-lg shadow-amber-900/30 ring-2 ring-amber-500/40'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-white">NO</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            Coming Soon
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                          Pre-Launch Page Active
                        </p>
                      </div>
                    </div>
                    {!isHomepageYes && (
                      <span className="p-1.5 rounded-full bg-amber-500 text-black">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed">
                    Hides the store with a luxury Coming Soon page, countdown timer, VIP early-access email form, and passcode unlock.
                  </p>
                </div>
              </div>
            </div>

            {/* Store URL & Theme ID Mapping Section */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>Store URL & Theme ID Matching</span>
                </span>
                <span className="text-[10px] text-slate-400">Automatic liquid linking</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Store URL / Domain (.myshopify.com or custom)
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => handleChange('domain', e.target.value.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''))}
                    placeholder="e.g. singhclo.myshopify.com or brand.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Matches <code className="text-indigo-300 font-mono">shop.permanent_domain</code> in Shopify.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Shopify Theme ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.themeId}
                    onChange={(e) => handleChange('themeId', e.target.value.trim())}
                    placeholder="e.g. 142981928412"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Matches <code className="text-indigo-300 font-mono">theme.id</code> in Shopify.
                  </span>
                </div>
              </div>

              {/* Target Scope */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block">
                    Control Scope:
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Choose whether Coming Soon page only applies to Homepage or Whole Store.
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => handleChange('targetScope', 'homepage_only')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      formData.targetScope === 'homepage_only'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Homepage Only (Index)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('targetScope', 'all_pages')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      formData.targetScope === 'all_pages'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Entire Store
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Copy Snippet */}
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-white block">
                  Add to Shopify Theme:
                </span>
                <span className="text-[11px] text-slate-300">
                  Paste in <code className="text-indigo-300 font-mono">layout/theme.liquid</code> under <code className="text-indigo-300 font-mono">&lt;body&gt;</code>:
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLiquidSnippet}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 text-xs font-bold border border-indigo-500/30 transition-all active:scale-95"
              >
                {copiedLiquid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLiquid ? 'Copied Code!' : 'Copy Liquid Tag'}</span>
              </button>
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
