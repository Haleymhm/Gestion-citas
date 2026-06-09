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

    const dewormingRecords = await prisma.deworming.findMany({
      where: { petId: parseInt(id) },
      orderBy: { date: 'desc' },
    });

    return successResponse(dewormingRecords);
  } catch (error) {
    return errorResponse('Error al obtener historial de desparasitación', 500);
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
    const { productName, type, dosage, date, nextDate } = body;

    if (!productName || !type) {
      return errorResponse('Nombre del producto y tipo son requeridos');
    }

    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pet) {
      return notFoundResponse('Mascota');
    }

    const deworming = await prisma.deworming.create({
      data: {
        productName,
        type,
        dosage: dosage || null,
        date: date ? new Date(date) : new Date(),
        nextDate: nextDate ? new Date(nextDate) : null,
        petId: parseInt(id),
        createdById: user.userId,
      },
    });

    return successResponse(deworming, 'Desparasitación registrada exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al registrar desparasitación', 500);
  }
}