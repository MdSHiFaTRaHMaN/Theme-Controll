'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Download, Trash2, Search, Filter, Mail, Calendar, Check } from 'lucide-react';

export default function LeadsModal({ isOpen, onClose, stores = [] }) {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchSubscribers();
    }
  }, [isOpen, storeFilter]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const url = storeFilter === 'all'
        ? '/api/subscribers'
        : `/api/subscribers?storeId=${storeFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.success) {
        setSubscribers(data.subscribers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this lead?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/subscribers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data && data.success) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) return;

    const headers = ['Store ID', 'VIP Email', 'Subscription Date'];
    const rows = subscribers.map(s => [
      `"${s.storeId || 'singhclo'}"`,
      `"${s.email}"`,
      `"${new Date(s.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vip_leads_${storeFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const filteredSubs = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.storeId && s.storeId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121524] border border-white/15 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">VIP Pre-Launch Leads</h3>
              <p className="text-xs text-slate-400">
                Emails captured from Launch Soon countdown landing pages.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-600/20 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-pink-500"
          >
            <option value="all">All Stores ({subscribers.length})</option>
            {stores.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id})
              </option>
            ))}
          </select>
        </div>

        {/* Leads Table */}
        <div className="flex-1 overflow-y-auto border border-white/10 rounded-xl bg-black/30">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading VIP subscribers...</div>
          ) : filteredSubs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No leads collected yet. When visitors enter their email on the Coming Soon page, they appear here.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Email Address</th>
                  <th className="px-4 py-2.5">Store ID</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 font-medium text-white flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                      <span>{sub.email}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-indigo-300">
                      {sub.storeId || 'singhclo'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        disabled={deletingId === sub.id}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove Lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
