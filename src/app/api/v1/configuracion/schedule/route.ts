import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-helper';
import {
  successResponse, errorResponse,
  unauthorizedResponse, forbiddenResponse,
} from '@/lib/api-response';
import { validateBody, UpdateScheduleSchema } from '@/lib/validations';
import { saveSchedule, getSchedule } from '@/services/settings/get-schedule';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function GET() {
  try {
    await requireAdmin();
    const schedule = await getSchedule();
    return successResponse(schedule);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') return unauthorizedResponse();
    if (error instanceof Error && error.message === 'Acceso prohibido') return forbiddenResponse();
    return errorResponse('Error al obtener horario', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const validation = validateBody(UpdateScheduleSchema, body);
    if (!validation.success) return errorResponse(validation.error);

    const previous = await getSchedule();
    await saveSchedule(validation.data, admin.userId);

    await createAuditLog({
      user: {
        userId: admin.userId,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
      action: 'UPDATE',
      module: 'Configuracion',
      entityId: 'schedule',
      entityType: 'ClinicSetting',
      ipAddress: await getClientIp(request),
      previousData: previous as unknown as Record<string, unknown>,
      newData: validation.data as unknown as Record<string, unknown>,
    });

    return successResponse(validation.data, 'Horario actualizado exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') return unauthorizedResponse();
    if (error instanceof Error && error.message === 'Acceso prohibido') return forbiddenResponse();
    console.error('Error PUT schedule:', error);
    return errorResponse('Error al actualizar horario', 500);
  }
}
