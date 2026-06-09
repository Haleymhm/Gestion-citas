import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireStaff } from '@/lib/auth-helper';
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
      select: { id: true, ownerId: true },
    });

    if (!pet) {
      return notFoundResponse('Mascota');
    }

    if (user.role === 'CLIENT' && pet.ownerId !== user.userId) {
      return forbiddenResponse();
    }

    const vaccinations = await prisma.vaccination.findMany({
      where: { petId: parseInt(id) },
      orderBy: { administrationDate: 'desc' },
    });

    return successResponse(vaccinations);
  } catch (error) {
    return errorResponse('Error al obtener historial de vaccaciones', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await requireStaff();

    if (user.role === 'RECEPTIONIST') {
      return forbiddenResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { vaccineName, vaccineType, administrationDate, nextDoseDate, lotNumber, manufacturer, veterinarian } = body;

    if (!vaccineName || !vaccineType) {
      return errorResponse('Nombre y tipo de vacuna son requeridos');
    }

    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pet) {
      return notFoundResponse('Mascota');
    }

    const vaccination = await prisma.vaccination.create({
      data: {
        vaccineName,
        vaccineType,
        administrationDate: administrationDate ? new Date(administrationDate) : new Date(),
        nextDoseDate: nextDoseDate ? new Date(nextDoseDate) : null,
        lotNumber: lotNumber || null,
        manufacturer: manufacturer || null,
        veterinarian: veterinarian || null,
        petId: parseInt(id),
        createdById: user.userId,
      },
    });

    return successResponse(vaccination, 'Vacuna registrada exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al registrar vacuna', 500);
  }
}