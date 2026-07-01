'use client';

import React from 'react';
import Link from 'next/link';
import type { DashboardUpcomingAppointmentDTO } from '@/types';

interface Props {
  appointments: DashboardUpcomingAppointmentDTO[];
}

const STATUS_BADGE: Record<DashboardUpcomingAppointmentDTO['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300',
  NO_SHOW: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

const STATUS_LABEL: Record<DashboardUpcomingAppointmentDTO['status'], string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
};

function formatDateTime(d: Date): string {
  const date = new Date(d);
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function UpcomingAppointmentsList({ appointments }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Próximas citas
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Las 5 más cercanas</p>
        </div>
        <Link
          href="/calendar"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Ver calendario →
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No hay citas próximas.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
          {appointments.map((a) => (
            <li key={a.id} className="flex items-center gap-4 py-3">
              <div
                aria-hidden
                className="h-10 w-1.5 rounded-full"
                style={{ backgroundColor: a.categoryColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-800 dark:text-white/90">
                  {a.petName}
                  <span className="text-gray-500 dark:text-gray-400"> · {a.ownerName}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {a.reason} · {a.categoryName}
                  {a.vetName ? ` · ${a.vetName}` : ''}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(a.date)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
