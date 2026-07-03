import { getSchedule, dayKeyFromDate } from './get-schedule';
import { isSameDay } from './get-holidays';
import { prisma } from '@/lib/prisma';

export type ValidationReason = 'closed_day' | 'outside_hours' | 'holiday';

export interface AppointmentValidation {
  allowed: boolean;
  reason?: ValidationReason;
  message?: string;
}

const REASON_MESSAGES: Record<ValidationReason, string> = {
  closed_day: 'La clínica está cerrada el día seleccionado.',
  outside_hours: 'La hora seleccionada está fuera del horario de atención.',
  holiday: 'La fecha seleccionada es un día feriado.',
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export async function validateAppointmentTime(date: Date): Promise<AppointmentValidation> {
  const schedule = await getSchedule();
  const dayKey = dayKeyFromDate(date);
  const daySchedule = schedule[dayKey];

  if (!daySchedule.enabled) {
    return {
      allowed: false,
      reason: 'closed_day',
      message: REASON_MESSAGES.closed_day,
    };
  }

  const holidays = await prisma.clinicHoliday.findMany({
    select: { date: true },
  });
  const holidayBookings = holidays.some((h) => isSameDay(h.date, date));

  if (holidayBookings) {
    return {
      allowed: false,
      reason: 'holiday',
      message: REASON_MESSAGES.holiday,
    };
  }

  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < timeToMinutes(daySchedule.open) || minutes >= timeToMinutes(daySchedule.close)) {
    return {
      allowed: false,
      reason: 'outside_hours',
      message: `El horario de atención es de ${daySchedule.open} a ${daySchedule.close}.`,
    };
  }

  return { allowed: true };
}
