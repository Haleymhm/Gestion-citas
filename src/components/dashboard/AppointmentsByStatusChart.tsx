'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { AppointmentStatus } from '@/types';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Props {
  byStatus: Record<AppointmentStatus, number>;
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
};

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  COMPLETED: '#10b981',
  CANCELLED: '#9ca3af',
  NO_SHOW: '#ef4444',
};

const STATUS_ORDER: AppointmentStatus[] = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

export default function AppointmentsByStatusChart({ byStatus }: Props) {
  const { categories, series } = useMemo(() => {
    const cats: string[] = [];
    const vals: number[] = [];
    const colors: string[] = [];
    for (const s of STATUS_ORDER) {
      cats.push(STATUS_LABEL[s]);
      vals.push(byStatus[s] ?? 0);
      colors.push(STATUS_COLOR[s]);
    }
    return { categories: cats, series: [{ name: 'Citas', data: vals }], colors };
  }, [byStatus]);

  const options: ApexOptions = {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'bar',
      height: 280,
      toolbar: { show: false },
    },
    colors: series.length > 0 ? Object.values(STATUS_COLOR) : [],
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: true,
        distributed: true,
        barHeight: '60%',
      },
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: '12px', fontWeight: 500 },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: '12px' } } },
    legend: { show: false },
    grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
    tooltip: {
      y: { formatter: (val: number) => `${val} citas` },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Citas por estado</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Distribución actual</p>
      <div className="mt-4">
        <ReactApexChart options={options} series={series} type="bar" height={280} />
      </div>
    </div>
  );
}
