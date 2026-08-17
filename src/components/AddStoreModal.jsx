'use client';

import React, { useState } from 'react';
import { X, Plus, Store, KeyRound, Globe, Sparkles } from 'lucide-react';

export default function AddStoreModal({ isOpen, onClose, onAddStore, adding }) {
  const [storeId, setStoreId] = useState('');
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [mode, setMode] = useState('LIVE');
  const [passcode, setPasscode] = useState('vip2026');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanId = storeId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanId) {
      setError('Please enter a valid Store ID (alphanumeric, no spaces)');
      return;
    }
    if (!name.trim()) {
      setError('Please enter a Store Name');
      return;
    }

    try {
      await onAddStore({
        id: cleanId,
        name: name.trim(),
        brandName: brandName.trim() || name.trim(),
        mode,
        passcode: passcode.trim() || 'vip2026',
      });
      // Reset
      setStoreId('');
      setName('');
      setBrandName('');
      setMode('LIVE');
      setPasscode('vip2026');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add store');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121524] border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Add New Shopify Store</h3>
            <p className="text-xs text-slate-400">Connect another store to the central controller.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Store ID (Unique slug for Shopify liquid) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
              placeholder="e.g. singhclo, store2, luxurybrand"
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              You will use this in Shopify: <code className="text-indigo-300">store_id: '{storeId || 'your_id'}'</code>
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Store Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SinghClo Main Official Store"
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Brand Display Name (Optional)
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. SinghClo"
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Initial Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="LIVE">🟢 Live Online Store</option>
                <option value="LAUNCH_SOON">⏳ Launch Soon VIP</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                VIP Passcode
              </label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="vip2026"
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus className={`w-3.5 h-3.5 ${adding ? 'animate-spin' : ''}`} />
              <span>{adding ? 'Creating...' : 'Create Store'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
