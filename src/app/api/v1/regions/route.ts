import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, getCurrentUser } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { createAuditLog, getClientIp } from '@/lib/audit';
import { validateBody, CreateRegionSchema } from '@/lib/validations';

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { code: 'asc' },
    });

    return successResponse(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return errorResponse('Error al obtener regiones', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAdmin();

    const body = await request.json();
    const validation = validateBody(CreateRegionSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { code, name } = validation.data;

    const existingCode = await prisma.region.findUnique({
      where: { code },
    });

    if (existingCode) {
      return errorResponse('Ya existe una región con este código');
    }

    const createData = { code, name };

    const region = await prisma.region.create({
      data: createData,
    });

    await createAuditLog({
      user: currentUser,
      action: 'CREATE',
      module: 'Region',
      entityId: String(region.id),
      entityType: 'Region',
      ipAddress: await getClientIp(request),
      newData: createData as Record<string, unknown>,
    });

    return successResponse(region, 'Región creada exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    console.error('Error creating region:', error);
    return errorResponse('Error al crear región', 500);
  }
}