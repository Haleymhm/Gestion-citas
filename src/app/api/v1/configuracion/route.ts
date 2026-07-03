import { requireAdmin } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { getSchedule } from '@/services/settings/get-schedule';
import { getHolidays } from '@/services/settings/get-holidays';
import { getBranding } from '@/services/settings/get-branding';

export async function GET() {
  try {
    await requireAdmin();

    const [schedule, holidays, branding] = await Promise.all([
      getSchedule(),
      getHolidays(),
      getBranding(),
    ]);

    return successResponse({
      schedule,
      holidays,
      branding,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') return unauthorizedResponse();
    if (error instanceof Error && error.message === 'Acceso prohibido') return forbiddenResponse();
    console.error('Error GET configuracion:', error);
    return errorResponse('Error al obtener configuración', 500);
  }
}
