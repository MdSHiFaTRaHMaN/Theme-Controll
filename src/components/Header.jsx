'use client';

import React from 'react';
import { Layers, Database, RefreshCw, Users, Code, Plus, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({
  dbStatus,
  onRefresh,
  loading,
  onOpenAddStore,
  onOpenLeads,
  onOpenLiquidGuide,
  totalLeads = 0,
}) {
  const isMongo = dbStatus?.isMongo;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 shadow-lg">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                Shopify Theme Controller
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.0 Next.js
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Central Remote Switcher & Pre-Launch Engine
            </p>
          </div>
        </div>

        {/* Database Status & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Database Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isMongo
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
            title={
              isMongo
                ? 'Connected to MongoDB Database'
                : 'Running on Fast Local Storage Fallback (Set MONGODB_URI to connect MongoDB)'
            }
          >
            <Database className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isMongo ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {isMongo ? 'MongoDB Connected' : 'Local Storage Mode'}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh All Stores"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* View VIP Leads */}
          <button
            onClick={onOpenLeads}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-all hover:border-indigo-500/40"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>VIP Leads</span>
            {totalLeads > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                {totalLeads}
              </span>
            )}
          </button>

          {/* Shopify Setup Guide */}
          <button
            onClick={onOpenLiquidGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-all hover:border-purple-500/40"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span>Liquid Snippet</span>
          </button>

          {/* Add New Store */}
          <button
            onClick={onOpenAddStore}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store</span>
          </button>
        </div>
      </div>
    </header>
  );
}
