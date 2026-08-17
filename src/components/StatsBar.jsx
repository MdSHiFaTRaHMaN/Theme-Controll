'use client';

import React from 'react';
import { Store, Globe, Clock, Sparkles } from 'lucide-react';

export default function StatsBar({ stats }) {
  const { total = 0, live = 0, launchSoon = 0, leads = 0 } = stats || {};

  const cards = [
    {
      id: 'total',
      label: 'Connected Stores',
      value: total,
      subtext: 'Centralized in 1 Dashboard',
      icon: Store,
      iconColor: 'text-indigo-400',
      bgColor: 'from-indigo-500/10 to-indigo-500/5',
      borderColor: 'border-indigo-500/20',
      badgeColor: 'bg-indigo-500/20 text-indigo-300',
    },
    {
      id: 'live',
      label: 'Live Online Stores',
      value: live,
      subtext: 'Main shop active',
      icon: Globe,
      iconColor: 'text-emerald-400',
      bgColor: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      glow: live > 0,
    },
    {
      id: 'launchSoon',
      label: 'Launch Soon Pages',
      value: launchSoon,
      subtext: 'VIP Coming Soon active',
      icon: Clock,
      iconColor: 'text-amber-400',
      bgColor: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/20',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'leads',
      label: 'Captured VIP Leads',
      value: leads,
      subtext: 'Collected pre-launch emails',
      icon: Sparkles,
      iconColor: 'text-pink-400',
      bgColor: 'from-pink-500/10 to-pink-500/5',
      borderColor: 'border-pink-500/20',
      badgeColor: 'bg-pink-500/20 text-pink-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`glass-card p-4 rounded-xl border ${card.borderColor} bg-gradient-to-br ${card.bgColor} relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                  {card.label}
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {card.value}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-normal">
                  {card.subtext}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
