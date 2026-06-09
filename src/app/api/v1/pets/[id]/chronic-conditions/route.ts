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

    const conditions = await prisma.chronicCondition.findMany({
      where: { petId: parseInt(id) },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(conditions);
  } catch (error) {
    return errorResponse('Error al obtener condiciones crónicas', 500);
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
    const { name, type, severity, diagnosisDate, notes, isActive } = body;

    if (!name || !type) {
      return errorResponse('Nombre y tipo son requeridos');
    }

    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pet) {
      return notFoundResponse('Mascota');
    }

    const condition = await prisma.chronicCondition.create({
      data: {
        name,
        type,
        severity: severity || null,
        diagnosisDate: diagnosisDate ? new Date(diagnosisDate) : null,
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : true,
        petId: parseInt(id),
      },
    });

    return successResponse(condition, 'Condición crónica registrada exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al registrar condición crónica', 500);
  }
}