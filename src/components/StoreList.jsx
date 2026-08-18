'use client';

import React, { useState } from 'react';
import { Search, Store, Zap, Clock, Globe, Trash2, ArrowRight, Check, Layers, Sliders } from 'lucide-react';

export default function StoreList({
  stores = [],
  selectedStore,
  onSelectStore,
  onQuickToggle,
  onBulkToggle,
  onDeleteStore,
  togglingId,
  bulkToggling,
}) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'LIVE' | 'LAUNCH_SOON'

  const filteredStores = stores.filter((s) => {
    const isLive = s.showHomepage !== undefined ? s.showHomepage : (s.mode === 'LIVE');
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      (s.domain && s.domain.toLowerCase().includes(search.toLowerCase())) ||
      (s.brandName && s.brandName.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter =
      filterMode === 'ALL'
        ? true
        : filterMode === 'LIVE'
        ? isLive
        : !isLive;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold text-white tracking-wide uppercase">
              Connected Stores ({stores.length})
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Store URL & ID Switcher</span>
        </div>

        {/* Bulk Action Controls */}
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 mb-2.5">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Bulk Switch All:</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onBulkToggle('LIVE')}
              disabled={bulkToggling || stores.length === 0}
              className="px-2 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50"
              title="Turn all connected stores to Live website"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>All YES 🟢 Live</span>
            </button>
            <button
              onClick={() => onBulkToggle('LAUNCH_SOON')}
              disabled={bulkToggling || stores.length === 0}
              className="px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50"
              title="Turn all connected stores to Coming Soon page"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>All NO ⏳ Launch</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domain, name, or id..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[10px]">
          {['ALL', 'LIVE', 'LAUNCH_SOON'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterMode(f)}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                filterMode === f
                  ? 'bg-white/15 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f === 'ALL' ? 'All Stores' : f === 'LIVE' ? '🟢 Homepage YES' : '⏳ Coming Soon NO'}
            </button>
          ))}
        </div>
      </div>

      {/* Stores List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[600px]">
        {filteredStores.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No stores match your search.
          </div>
        ) : (
          filteredStores.map((store) => {
            const isSelected = selectedStore?.id === store.id;
            const isLive = store.showHomepage !== undefined ? store.showHomepage : (store.mode === 'LIVE');
            const isToggling = togglingId === store.id;

            return (
              <div
                key={store.id}
                onClick={() => onSelectStore(store)}
                className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Store Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {store.name}
                      </h3>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ring-2 ring-indigo-400/30 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                        id: {store.id}
                      </span>
                      {store.domain && (
                        <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Globe className="w-2 h-2" />
                          {store.domain}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mode Pill & Quick Toggle Button */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Mode Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                        isLive
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                      {isLive ? 'YES (Live)' : 'NO (Launch)'}
                    </span>

                    {/* Quick Switch Button */}
                    <button
                      onClick={() => onQuickToggle(store.id, isLive ? 'LAUNCH_SOON' : 'LIVE')}
                      disabled={isToggling}
                      title={`Toggle: ${isLive ? 'Turn to Coming Soon (NO)' : 'Turn to Live (YES)'}`}
                      className={`p-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-90 ${
                        isLive
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 hover:border-amber-500/60'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/60'
                      }`}
                    >
                      {isToggling ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isLive ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                    </button>

                    {/* Delete Store */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStore(store.id, store.name);
                      }}
                      title={`Delete store ${store.name}`}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
