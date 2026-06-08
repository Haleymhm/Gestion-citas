import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET() {
  try {
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
    await requireAdmin();

    const body = await request.json();
    const { name, color } = body;

    if (!name || !color) {
      return errorResponse('Nombre y color son requeridos');
    }

    const existing = await prisma.category.findFirst({
      where: { name: { equals: name } },
    });

    if (existing) {
      return errorResponse('Ya existe una categoría con este nombre');
    }

    const category = await prisma.category.create({
      data: {
        name,
        color,
      },
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