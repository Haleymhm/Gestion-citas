import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return notFoundResponse('Categoría');
    }

    return successResponse(category);
  } catch (error) {
    return errorResponse('Error al obtener categoría', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { name, color } = body;

    const data: { name?: string; color?: string } = {};

    if (name) {
      const existing = await prisma.category.findFirst({
        where: { name: { equals: name }, id: { not: id } },
      });

      if (existing) {
        return errorResponse('Ya existe una categoría con este nombre');
      }
      data.name = name;
    }

    if (color) data.color = color;

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return successResponse(category, 'Categoría actualizada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al actualizar categoría', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const appointmentsCount = await prisma.appointment.count({
      where: { categoryId: id },
    });

    if (appointmentsCount > 0) {
      return errorResponse(`No se puede eliminar. Hay ${appointmentsCount} citas asociadas a esta categoría`);
    }

    await prisma.category.delete({
      where: { id },
    });

    return successResponse(null, 'Categoría eliminada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al eliminar categoría', 500);
  }
}