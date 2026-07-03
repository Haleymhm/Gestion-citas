import { getSchedule } from '@/services/settings/get-schedule';
import { getHolidays } from '@/services/settings/get-holidays';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const [schedule, holidays] = await Promise.all([
      getSchedule(),
      getHolidays({ onlyFuture: true }),
    ]);

    return successResponse({
      schedule,
      upcomingHolidays: holidays.slice(0, 20).map((h) => ({
        id: h.id,
        date: h.date,
        label: h.label,
      })),
    });
  } catch (error) {
    console.error('Error public settings:', error);
    return errorResponse('Error al obtener configuración pública', 500);
  }
}
