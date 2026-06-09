import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireStaff } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');

    const where: Record<string, unknown> = {};

    if (petId) {
      where.petId = parseInt(petId);
    }

    if (user.role === 'CLIENT') {
      const pets = await prisma.pet.findMany({
        where: { ownerId: user.userId },
        select: { id: true },
      });
      const petIds = pets.map(p => p.id);
      where.petId = { in: petIds };
    }

    if (user.role === 'VET') {
      where.vetId = user.userId;
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        vet: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(medicalRecords);
  } catch (error) {
    return errorResponse('Error al obtener historial médico', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await requireStaff();

    const body = await request.json();
    const { title, publicNotes, privateNotes, petId } = body;

    if (!title || !publicNotes || !petId) {
      return errorResponse('Título, notas públicas y mascota son requeridos');
    }

    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(petId) },
    });

    if (!pet) {
      return errorResponse('Mascota no encontrada');
    }

    if (user.role === 'RECEPTIONIST') {
      return forbiddenResponse();
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        title,
        publicNotes,
        privateNotes: privateNotes || null,
        petId: parseInt(petId),
        vetId: user.userId,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
          },
        },
        vet: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse(medicalRecord, 'Historia médica creada exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al crear historial médico', 500);
  }
}