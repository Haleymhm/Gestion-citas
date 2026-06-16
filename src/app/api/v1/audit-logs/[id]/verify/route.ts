import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';
import { verifyAuditLogIntegrity } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: { details: true },
    });

    if (!log) {
      return notFoundResponse('Log de auditoría no encontrado');
    }

    const isValid = await verifyAuditLogIntegrity(id);

    return successResponse({
      id: log.id,
      isValid,
      log: {
        userId: log.userId,
        userFullName: log.userFullName,
        userEmail: log.userEmail,
        action: log.action,
        module: log.module,
        entityId: log.entityId,
        entityType: log.entityType,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress,
        details: log.details,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al verificar integridad del log', 500);
  }
}