import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helper';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-response';
import { createAuditLog, getClientIp } from '@/lib/audit';
import { validateQuery, DashboardQuerySchema } from '@/lib/validations';
import { computeDashboardMetrics } from '@/services/dashboard-metrics';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role === 'CLIENT') {
      return forbiddenResponse();
    }

    const validation = validateQuery(DashboardQuerySchema, request.nextUrl.searchParams);
    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const metrics = await computeDashboardMetrics(prisma, {
      userId: user.userId,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }, validation.data.range);

    await createAuditLog({
      user,
      action: 'READ',
      module: 'Dashboard',
      entityId: `metrics:${validation.data.range}`,
      entityType: 'Dashboard',
      ipAddress: await getClientIp(request),
      newData: {
        range: validation.data.range,
        todayTotal: metrics.today.total,
        petsActive: metrics.pets.active,
      },
    });

    return successResponse(metrics);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error('Dashboard error:', error);
    }
    return errorResponse('Error al obtener métricas del dashboard', 500);
  }
}
