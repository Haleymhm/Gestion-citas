'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Props {
  distribution: { species: string; count: number }[];
}

const SPECIES_COLORS = ['#465fff', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7'];

export default function SpeciesDistributionChart({ distribution }: Props) {
  const { labels, values, colors } = useMemo(() => {
    if (distribution.length === 0) {
      return { labels: ['Sin datos'], values: [1], colors: ['#9ca3af'] };
    }
    const labels = distribution.map((d) => d.species);
    const values = distribution.map((d) => d.count);
    const colors = labels.map((_, i) => SPECIES_COLORS[i % SPECIES_COLORS.length]);
    return { labels, values, colors };
  }, [distribution]);

  const total = values.reduce((a, b) => a + b, 0);

  const options: ApexOptions = {
    chart: { fontFamily: 'Outfit, sans-serif', type: 'donut' },
    labels,
    colors,
    legend: { position: 'bottom', fontSize: '13px' },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { fontSize: '14px' },
            value: {
              fontSize: '22px',
              fontWeight: 600,
              formatter: (val: string) => `${val} / ${total}`,
            },
            total: {
              show: true,
              label: 'Mascotas',
              formatter: () => `${total}`,
            },
          },
        },
      },
    },
    stroke: { width: 2 },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
        Distribución por especie
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total de mascotas registradas</p>
      <div className="mt-4">
        <ReactApexChart options={options} series={values} type="donut" height={280} />
      </div>
    </div>
  );
}
