import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';

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
    await requireAdmin();

    const body = await request.json();
    const { code, name } = body;

    if (!code || !name) {
      return errorResponse('Código y nombre de región son requeridos');
    }

    const existingCode = await prisma.region.findUnique({
      where: { code },
    });

    if (existingCode) {
      return errorResponse('Ya existe una región con este código');
    }

    const region = await prisma.region.create({
      data: {
        code,
        name,
      },
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
