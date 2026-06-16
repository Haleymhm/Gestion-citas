import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff, getCurrentUser } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';
import { createAuditLog, getClientIp } from '@/lib/audit';
import type { AppointmentStatus } from '@prisma/client';

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
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        pet: {
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
    });

    if (!appointment) {
      return notFoundResponse('Cita');
    }

    if (user.role === 'CLIENT') {
      const pet = await prisma.pet.findUnique({
        where: { id: appointment.petId },
      });
      if (pet?.ownerId !== user.userId) {
        return forbiddenResponse();
      }
    }

    return successResponse(appointment);
  } catch (error) {
    return errorResponse('Error al obtener cita', 500);
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

    const { id } = await params;
    const body = await request.json();
    const { date, reason, status, notes, vetId, petId, categoryId } = body;

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingAppointment) {
      return notFoundResponse('Cita');
    }

    const previousData: Record<string, unknown> = {
      date: existingAppointment.date,
      reason: existingAppointment.reason,
      status: existingAppointment.status,
      notes: existingAppointment.notes,
      vetId: existingAppointment.vetId,
      petId: existingAppointment.petId,
      categoryId: existingAppointment.categoryId,
    };

    const updateData: {
      date?: Date;
      reason?: string;
      status?: AppointmentStatus;
      notes?: string | null;
      vetId?: number | null;
      petId?: number;
      categoryId?: string;
    } = {};

    if (date) {
      const newDate = new Date(date);
      if (newDate < new Date() && newDate.toDateString() !== existingAppointment.date.toDateString()) {
        return errorResponse('No se puede mover una cita al pasado');
      }
      updateData.date = newDate;
    }

    if (reason) updateData.reason = reason;
    if (status && ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status)) {
      updateData.status = status;
    }
    if (notes !== undefined) updateData.notes = notes || null;
    if (vetId !== undefined) updateData.vetId = vetId ? parseInt(vetId) : null;
    if (petId) updateData.petId = parseInt(petId);
    if (categoryId) updateData.categoryId = categoryId;

    if (updateData.vetId && updateData.date) {
      const conflict = await prisma.appointment.findFirst({
        where: {
          id: { not: parseInt(id) },
          vetId: updateData.vetId,
          date: updateData.date,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (conflict) {
        return errorResponse('El veterinario ya tiene una cita en este horario');
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        pet: {
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
    });

    await createAuditLog({
      user,
      action: 'UPDATE',
      module: 'Appointment',
      entityId: String(appointment.id),
      entityType: 'Appointment',
      ipAddress: await getClientIp(request),
      previousData,
      newData: updateData,
    });

    return successResponse(appointment, 'Cita actualizada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al actualizar cita', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const existing = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return notFoundResponse('Cita');
    }

    await createAuditLog({
      user,
      action: 'DELETE',
      module: 'Appointment',
      entityId: String(existing.id),
      entityType: 'Appointment',
      ipAddress: await getClientIp(request),
      previousData: existing as Record<string, unknown>,
    });

    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(null, 'Cita eliminada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    if ((error as Error).message.includes('Record to delete does not exist')) {
      return notFoundResponse('Cita');
    }
    return errorResponse('Error al eliminar cita', 500);
  }
}