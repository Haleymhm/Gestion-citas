import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-helper';
import {
  successResponse, errorResponse,
  unauthorizedResponse, forbiddenResponse,
} from '@/lib/api-response';
import { validateBody, CreateHolidaySchema } from '@/lib/validations';
import { getHolidays } from '@/services/settings/get-holidays';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function GET() {
  try {
    await requireAdmin();
    const holidays = await getHolidays();
    return successResponse(holidays);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') return unauthorizedResponse();
    if (error instanceof Error && error.message === 'Acceso prohibido') return forbiddenResponse();
    return errorResponse('Error al obtener feriados', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const validation = validateBody(CreateHolidaySchema, body);
    if (!validation.success) return errorResponse(validation.error);

    const holidayDate = new Date(validation.data.date);
    if (holidayDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      return errorResponse('No se pueden crear feriados en el pasado');
    }

    const existing = await prisma.clinicHoliday.findUnique({
      where: { date: holidayDate },
    });
    if (existing) {
      return errorResponse('Ya existe un feriado en esa fecha');
    }

    const holiday = await prisma.clinicHoliday.create({
      data: {
        date: holidayDate,
        label: validation.data.label,
        createdById: admin.userId,
      },
    });

    await createAuditLog({
      user: {
        userId: admin.userId,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
      action: 'CREATE',
      module: 'Configuracion',
      entityId: String(holiday.id),
      entityType: 'ClinicHoliday',
      ipAddress: await getClientIp(request),
      newData: { date: holidayDate, label: validation.data.label },
    });

    return successResponse(holiday, 'Feriado creado exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') return unauthorizedResponse();
    if (error instanceof Error && error.message === 'Acceso prohibido') return forbiddenResponse();
    console.error('Error POST holiday:', error);
    return errorResponse('Error al crear feriado', 500);
  }
}
