import { NextRequest } from 'next/server';
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
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, petId: true, pet: { select: { ownerId: true } } },
    });

    if (!medicalRecord) {
      return notFoundResponse('Historia médica');
    }

    if (user.role === 'CLIENT' && medicalRecord.pet.ownerId !== user.userId) {
      return forbiddenResponse();
    }

    const exams = await prisma.examAttachment.findMany({
      where: { medicalRecordId: parseInt(id) },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(exams);
  } catch (error) {
    return errorResponse('Error al obtener exámenes', 500);
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
    const { fileName, fileUrl, fileType, description } = body;

    if (!fileName || !fileUrl || !fileType) {
      return errorResponse('Nombre, URL y tipo de archivo son requeridos');
    }

    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
    });

    if (!medicalRecord) {
      return notFoundResponse('Historia médica');
    }

    if (user.role === 'VET' && medicalRecord.vetId !== user.userId) {
      return forbiddenResponse();
    }

    const exam = await prisma.examAttachment.create({
      data: {
        fileName,
        fileUrl,
        fileType,
        description: description || null,
        medicalRecordId: parseInt(id),
      },
    });

    return successResponse(exam, 'Examen adjuntado exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al adjuntar examen', 500);
  }
}