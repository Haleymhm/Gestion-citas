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
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
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
        vitals: true,
        exams: true,
      },
    });

    if (!medicalRecord) {
      return notFoundResponse('Historia médica');
    }

    if (user.role === 'CLIENT' && medicalRecord.pet.owner.id !== user.userId) {
      return forbiddenResponse();
    }

    return successResponse(medicalRecord);
  } catch (error) {
    return errorResponse('Error al obtener historia médica', 500);
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

    await requireStaff();

    if (user.role === 'RECEPTIONIST') {
      return forbiddenResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { date, title, diagnosis, treatment, publicNotes, privateNotes, vitals } = body;

    const existing = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
      include: { vitals: true },
    });

    if (!existing) {
      return notFoundResponse('Historia médica');
    }

    if (user.role === 'VET' && existing.vetId !== user.userId) {
      return forbiddenResponse();
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (date) updateData.date = new Date(date);
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis || null;
    if (treatment !== undefined) updateData.treatment = treatment || null;
    if (publicNotes) updateData.publicNotes = publicNotes;
    if (privateNotes !== undefined) updateData.privateNotes = privateNotes || null;

    const medicalRecord = await prisma.medicalRecord.update({
      where: { id: parseInt(id) },
      data: updateData,
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
        vitals: true,
        exams: true,
      },
    });

    if (vitals) {
      const vitalsData: Record<string, unknown> = {};
      if (vitals.weight !== undefined) vitalsData.weight = vitals.weight ? parseFloat(vitals.weight) : null;
      if (vitals.temperature !== undefined) vitalsData.temperature = vitals.temperature ? parseFloat(vitals.temperature) : null;
      if (vitals.heartRate !== undefined) vitalsData.heartRate = vitals.heartRate ? parseInt(vitals.heartRate) : null;
      if (vitals.respiratoryRate !== undefined) vitalsData.respiratoryRate = vitals.respiratoryRate ? parseInt(vitals.respiratoryRate) : null;
      if (vitals.capillaryRefillTime !== undefined) vitalsData.capillaryRefillTime = vitals.capillaryRefillTime || null;
      if (vitals.dehydrationPercentage !== undefined) vitalsData.dehydrationPercentage = vitals.dehydrationPercentage ? parseFloat(vitals.dehydrationPercentage) : null;
      if (vitals.mucousMembranes !== undefined) vitalsData.mucousMembranes = vitals.mucousMembranes || null;

      if (existing.vitals) {
        await prisma.vitalSigns.update({
          where: { id: existing.vitals.id },
          data: vitalsData,
        });
      } else {
        await prisma.vitalSigns.create({
          data: {
            ...vitalsData,
            medicalRecordId: medicalRecord.id,
          },
        });
      }
    }

    const updatedRecord = await prisma.medicalRecord.findUnique({
      where: { id: medicalRecord.id },
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
        vitals: true,
        exams: true,
      },
    });

    return successResponse(updatedRecord, 'Historia médica actualizada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al actualizar historia médica', 500);
  }
}

export async function DELETE(
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
    const existing = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return notFoundResponse('Historia médica');
    }

    if (user.role === 'VET' && existing.vetId !== user.userId) {
      return forbiddenResponse();
    }

    await prisma.medicalRecord.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(null, 'Historia médica eliminada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al eliminar historia médica', 500);
  }
}