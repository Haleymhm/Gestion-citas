import { prisma } from '@/lib/prisma';

export async function getHolidays({
  from,
  to,
  onlyFuture = false,
}: {
  from?: Date;
  to?: Date;
  onlyFuture?: boolean;
} = {}) {
  const where: { date?: Date | { gte?: Date; lte?: Date } } = {};
  if (from || to || onlyFuture) {
    const gte = from ?? (onlyFuture ? new Date() : undefined);
    if (gte || to) {
      where.date = {};
      if (gte) where.date.gte = gte;
      if (to) where.date.lte = to;
    }
  }
  const holidays = await prisma.clinicHoliday.findMany({
    where,
    orderBy: { date: 'asc' },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return holidays;
}

export async function isHoliday(date: Date): Promise<boolean> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const holiday = await prisma.clinicHoliday.findFirst({
    where: { date: { gte: startOfDay, lte: endOfDay } },
    select: { id: true },
  });
  return !!holiday;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
