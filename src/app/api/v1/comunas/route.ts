import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const regionId = searchParams.get('regionId');

    const where: { regionId?: string } = {};
    if (regionId) {
      where.regionId = regionId;
    }

    const comunas = await prisma.comuna.findMany({
      where,
      include: {
        region: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return successResponse(comunas);
  } catch (error) {
    console.error('Error fetching comunas:', error);
    return errorResponse('Error al obtener comunas', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { code, name, regionId } = body;

    if (!code || !name || !regionId) {
      return errorResponse('Código, nombre de comuna y región son requeridos');
    }

    // Verify Region exists
    const regionExists = await prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!regionExists) {
      return errorResponse('La región asociada no existe');
    }

    const existingCode = await prisma.comuna.findUnique({
      where: { code },
    });

    if (existingCode) {
      return errorResponse('Ya existe una comuna con este código');
    }

    const comuna = await prisma.comuna.create({
      data: {
        code,
        name,
        regionId,
      },
      include: {
        region: true,
      },
    });

    return successResponse(comuna, 'Comuna creada exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    console.error('Error creating comuna:', error);
    return errorResponse('Error al crear comuna', 500);
  }
}
