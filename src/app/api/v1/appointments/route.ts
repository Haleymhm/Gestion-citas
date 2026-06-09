import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff, getCurrentUser } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import type { AppointmentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as AppointmentStatus | null;
    const vetId = searchParams.get('vetId');
    const petId = searchParams.get('petId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const pendingOnly = searchParams.get('pendingOnly');

    const where: {
      status?: AppointmentStatus;
      vetId?: number;
      petId?: number | { in: number[] };
      date?: { gte?: Date; lte?: Date };
    } = {};

    if (status) where.status = status;

    if (vetId) where.vetId = parseInt(vetId);

    if (petId) where.petId = parseInt(petId);

    if (dateFrom && dateTo) {
      where.date = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    } else if (pendingOnly === 'true') {
      where.status = 'PENDING';
    }

    if (user.role === 'VET') {
      where.vetId = user.userId;
    }

    if (user.role === 'CLIENT') {
      const pets = await prisma.pet.findMany({
        where: { ownerId: user.userId },
        select: { id: true },
      });
      const petIds = pets.map(p => p.id);
      where.petId = { in: petIds };
    }

    const appointments = await prisma.appointment.findMany({
      where,
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
      orderBy: { date: 'asc' },
    });

    return successResponse(appointments);
  } catch (error) {
    return errorResponse('Error al obtener citas', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { date, reason, categoryId, petId, vetId, notes, status } = body;

    if (!date || !reason || !petId || !categoryId) {
      return errorResponse('Fecha, motivo, categoría y mascota son requeridos');
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return errorResponse('Categoría no encontrada');
    }

    const appointmentDate = new Date(date);
    if (appointmentDate < new Date()) {
      return errorResponse('No se puede agendar una cita en el pasado');
    }

    if (vetId) {
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          vetId: parseInt(vetId),
          date: appointmentDate,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (existingAppointment) {
        return errorResponse('El veterinario ya tiene una cita en este horario');
      }
    }

    const pet = await prisma.pet.findUnique({
      where: { id: parseInt(petId) },
    });

    if (!pet) {
      return errorResponse('Mascota no encontrada');
    }

    if (user.role === 'CLIENT' && pet.ownerId !== user.userId) {
      return forbiddenResponse();
    }

    const appointmentStatus: AppointmentStatus = user.role === 'CLIENT' ? 'PENDING' : (status || 'CONFIRMED');

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        reason,
        categoryId,
        status: appointmentStatus,
        notes: notes || null,
        petId: parseInt(petId),
        vetId: vetId ? parseInt(vetId) : null,
      },
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
          },
        },
      },
    });

    return successResponse(appointment, 'Cita creada exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al crear cita', 500);
  }
}