import React from 'react';

export type KpiTrend = 'up' | 'down' | 'flat';

export interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: KpiTrend;
  trendLabel?: string;
  icon?: React.ReactNode;
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const ACCENTS: Record<NonNullable<KpiCardProps['accent']>, string> = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
};

const TREND_STYLES: Record<KpiTrend, { badge: string; arrow: string }> = {
  up: {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    arrow: '↑',
  },
  down: {
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    arrow: '↓',
  },
  flat: {
    badge: 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300',
    arrow: '→',
  },
};

export default function KpiCard({
  label,
  value,
  hint,
  trend,
  trendLabel,
  icon,
  accent = 'indigo',
}: KpiCardProps) {
  const accentClass = ACCENTS[accent];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accentClass}`}>
          {icon}
        </div>
        {trend && trendLabel ? (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TREND_STYLES[trend].badge}`}>
            <span aria-hidden>{TREND_STYLES[trend].arrow}</span>
            {trendLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{value}</h4>
        {hint ? (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
