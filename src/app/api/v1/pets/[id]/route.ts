import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff, getCurrentUser } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        medicalRecords: {
          select: {
            id: true,
            title: true,
            publicNotes: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!pet) {
      return notFoundResponse('Mascota');
    }

    if (user.role === 'CLIENT' && pet.ownerId !== user.userId) {
      return forbiddenResponse();
    }

    return successResponse(pet);
  } catch (error) {
    return errorResponse('Error al obtener mascota', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { name, species, breed, birthDate, weight } = body;

    const existingPet = await prisma.pet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPet) {
      return notFoundResponse('Mascota');
    }

    if (user.role === 'CLIENT' && existingPet.ownerId !== user.userId) {
      return forbiddenResponse();
    }

    const data: {
      name?: string;
      species?: string;
      breed?: string | null;
      birthDate?: Date | null;
      weight?: number | null;
    } = {};

    if (name) data.name = name;
    if (species) data.species = species;
    if (breed !== undefined) data.breed = breed || null;
    if (birthDate !== undefined) data.birthDate = birthDate ? new Date(birthDate) : null;
    if (weight !== undefined) data.weight = weight ? parseFloat(weight) : null;

    const pet = await prisma.pet.update({
      where: { id: parseInt(id) },
      data,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return successResponse(pet, 'Mascota actualizada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al actualizar mascota', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    const { id } = await params;

    await prisma.pet.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(null, 'Mascota eliminada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al eliminar mascota', 500);
  }
}