'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { DashboardRange } from '@/types';

interface Option {
  value: DashboardRange;
  label: string;
}

const OPTIONS: Option[] = [
  { value: 'month', label: 'Mes actual' },
  { value: 'prev', label: 'Mes anterior' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año' },
];

interface Props {
  active: DashboardRange;
}

export default function DashboardRangeSelector({ active }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildHref = (value: DashboardRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', value);
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-white/[0.03]">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === active;
        return (
          <Link
            key={opt.value}
            href={buildHref(opt.value)}
            className={
              'rounded-lg px-3 py-1.5 text-sm font-medium transition ' +
              (isActive
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5')
            }
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
