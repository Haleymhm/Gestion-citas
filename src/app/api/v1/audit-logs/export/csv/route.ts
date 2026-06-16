import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helper';
import { generateAuditCSV } from '@/lib/audit-pdf';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const module = searchParams.get('module');

    const where: Record<string, unknown> = {
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (userId) where.userId = parseInt(userId);
    if (action) where.action = action;
    if (module) where.module = module;

    const logs = await prisma.auditLog.findMany({
      where,
      include: { details: true },
      orderBy: { timestamp: 'desc' },
    });

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      userFullName: log.userFullName,
      userEmail: log.userEmail,
      action: log.action,
      module: log.module,
      entityId: log.entityId,
      entityType: log.entityType,
      timestamp: log.timestamp.toISOString(),
      ipAddress: log.ipAddress,
      details: log.details,
    }));

    const csvContent = generateAuditCSV({
      logs: formattedLogs,
      startDate,
      endDate,
    });

    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return new NextResponse('No autorizado', { status: 401 });
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return new NextResponse('Acceso prohibido', { status: 403 });
    }
    return new NextResponse('Error al exportar CSV', { status: 500 });
  }
}