import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireStaff } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { createAuditLog, getClientIp } from '@/lib/audit';
import { validateBody, CreateCategorySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return successResponse(categories);
  } catch (error) {
    return errorResponse('Error al obtener categorías', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await requireStaff();

    if (user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validation = validateBody(CreateCategorySchema, body);

    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { name, color } = validation.data;

    const createData = { name, color };

    const category = await prisma.category.create({
      data: createData,
    });

    await createAuditLog({
      user,
      action: 'CREATE',
      module: 'Category',
      entityId: String(category.id),
      entityType: 'Category',
      ipAddress: await getClientIp(request),
      newData: createData as Record<string, unknown>,
    });

    return successResponse(category, 'Categoría creada exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al crear categoría', 500);
  }
}