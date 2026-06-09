import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const region = await prisma.region.findUnique({
      where: { id },
      include: { comunas: true },
    });

    if (!region) {
      return notFoundResponse('Región');
    }

    return successResponse(region);
  } catch (error) {
    console.error('Error fetching region:', error);
    return errorResponse('Error al obtener región', 500);
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
    const { code, name } = body;

    const existingRegion = await prisma.region.findUnique({
      where: { id },
    });

    if (!existingRegion) {
      return notFoundResponse('Región');
    }

    const data: { code?: string; name?: string } = {};

    if (code && code !== existingRegion.code) {
      const duplicateCode = await prisma.region.findUnique({
        where: { code },
      });

      if (duplicateCode) {
        return errorResponse('Ya existe una región con este código');
      }
      data.code = code;
    }

    if (name) data.name = name;

    const updatedRegion = await prisma.region.update({
      where: { id },
      data,
    });

    return successResponse(updatedRegion, 'Región actualizada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    console.error('Error updating region:', error);
    return errorResponse('Error al actualizar región', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existingRegion = await prisma.region.findUnique({
      where: { id },
    });

    if (!existingRegion) {
      return notFoundResponse('Región');
    }

    // Check if there are associated comunas
    const comunasCount = await prisma.comuna.count({
      where: { regionId: id },
    });

    if (comunasCount > 0) {
      return errorResponse(`No se puede eliminar la región. Hay ${comunasCount} comunas asociadas a ella`);
    }

    await prisma.region.delete({
      where: { id },
    });

    return successResponse(null, 'Región eliminada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    console.error('Error deleting region:', error);
    return errorResponse('Error al eliminar región', 500);
  }
}
