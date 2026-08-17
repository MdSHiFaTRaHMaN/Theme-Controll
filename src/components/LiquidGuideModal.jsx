'use client';

import React, { useState } from 'react';
import { X, Code, Copy, Check, ExternalLink, Sparkles, ShieldCheck, Zap, Layers } from 'lucide-react';

export default function LiquidGuideModal({ isOpen, onClose, selectedStore }) {
  const [copiedStep1, setCopiedStep1] = useState(false);
  const [copiedAutoTag, setCopiedAutoTag] = useState(false);
  const [copiedCustomTag, setCopiedCustomTag] = useState(false);

  if (!isOpen) return null;

  const storeId = selectedStore?.id || 'singhclo';
  const autoTag = `{% render 'store-mode-controller' %}`;
  const customTag = `{% render 'store-mode-controller', store_id: '${storeId}' %}`;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'auto') {
      setCopiedAutoTag(true);
      setTimeout(() => setCopiedAutoTag(false), 2000);
    } else if (type === 'custom') {
      setCopiedCustomTag(true);
      setTimeout(() => setCopiedCustomTag(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121524] border border-white/15 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[88vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Multi-Store Dynamic Setup Guide</h3>
            <p className="text-xs text-slate-400">
              Connect 5, 10, or 50+ Shopify stores to this central Next.js dashboard.
            </p>
          </div>
        </div>

        {/* Dynamic Concept Explanation */}
        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 mb-4 flex items-start gap-2.5 text-xs text-indigo-200">
          <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">⚡ 100% Dynamic Self-Discovery:</strong>
            You only need to place the <code className="text-indigo-300">store-mode-controller.liquid</code> snippet in each Shopify store. Whenever any store loads, it <strong>automatically registers itself</strong> in your Next.js dashboard!
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 text-xs">
          {/* STEP 1 */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                Step 1: Add Snippet to each Shopify Store
              </span>
              <span className="text-[10px] text-slate-400">Snippets &rarr; store-mode-controller.liquid</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              In any Shopify store's admin: <strong>Online Store &rarr; Themes &rarr; Edit code &rarr; Add Snippet</strong>.<br />
              Create <code className="text-indigo-300 font-mono">store-mode-controller.liquid</code> and paste the snippet code.
            </p>
          </div>

          {/* STEP 2 - AUTOMATIC (RECOMMENDED) */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2A</span>
                Step 2 (Option A - Automatic Auto-ID):
              </span>
              <button
                onClick={() => handleCopy(autoTag, 'auto')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 text-[11px] font-semibold transition-colors"
              >
                {copiedAutoTag ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAutoTag ? 'Copied!' : 'Copy Auto Code'}</span>
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Paste in <code className="text-indigo-300">layout/theme.liquid</code> under <code className="text-indigo-300">&lt;body&gt;</code>. It will <strong>automatically detect the store domain</strong> and connect to the dashboard:
            </p>
            <pre className="p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto">
              {autoTag}
            </pre>
          </div>

          {/* STEP 2 - CUSTOM ID */}
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2B</span>
                Step 2 (Option B - Custom Store ID):
              </span>
              <button
                onClick={() => handleCopy(customTag, 'custom')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-[11px] font-semibold transition-colors"
              >
                {copiedCustomTag ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCustomTag ? 'Copied!' : 'Copy Custom Code'}</span>
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed">
              If you want a specific custom name (e.g. <code className="text-indigo-300">singhclo</code>, <code className="text-indigo-300">brand-two</code>, <code className="text-indigo-300">outlet-store</code>):
            </p>
            <pre className="p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] text-indigo-200 overflow-x-auto">
              {customTag}
            </pre>
          </div>

          {/* STEP 3 - VIP ADMIN PREVIEW */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Team & Owner VIP Live Bypass Link</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              To test the live site even when Launch Soon is active on any store:
            </p>
            <code className="block p-2 rounded bg-black/50 font-mono text-[11px] text-emerald-300 break-all">
              https://any-store.myshopify.com/?vip_pass={selectedStore?.passcode || 'vip2026'}
            </code>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
