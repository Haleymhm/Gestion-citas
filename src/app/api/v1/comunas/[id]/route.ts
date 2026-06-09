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

    const comuna = await prisma.comuna.findUnique({
      where: { id },
      include: { region: true },
    });

    if (!comuna) {
      return notFoundResponse('Comuna');
    }

    return successResponse(comuna);
  } catch (error) {
    console.error('Error fetching comuna:', error);
    return errorResponse('Error al obtener comuna', 500);
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
    const { code, name, regionId } = body;

    const existingComuna = await prisma.comuna.findUnique({
      where: { id },
    });

    if (!existingComuna) {
      return notFoundResponse('Comuna');
    }

    const data: { code?: string; name?: string; regionId?: string } = {};

    if (code && code !== existingComuna.code) {
      const duplicateCode = await prisma.comuna.findUnique({
        where: { code },
      });

      if (duplicateCode) {
        return errorResponse('Ya existe una comuna con este código');
      }
      data.code = code;
    }

    if (name) data.name = name;

    if (regionId) {
      const regionExists = await prisma.region.findUnique({
        where: { id: regionId },
      });
      if (!regionExists) {
        return errorResponse('La región asociada no existe');
      }
      data.regionId = regionId;
    }

    const updatedComuna = await prisma.comuna.update({
      where: { id },
      data,
      include: { region: true },
    });

    return successResponse(updatedComuna, 'Comuna actualizada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    console.error('Error updating comuna:', error);
    return errorResponse('Error al actualizar comuna', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existingComuna = await prisma.comuna.findUnique({
      where: { id },
    });

    if (!existingComuna) {
      return notFoundResponse('Comuna');
    }

    await prisma.comuna.delete({
      where: { id },
    });

    return successResponse(null, 'Comuna eliminada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    console.error('Error deleting comuna:', error);
    return errorResponse('Error al eliminar comuna', 500);
  }
}
