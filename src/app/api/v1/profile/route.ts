import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAuth, getCurrentUser } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { createAuditLog, getClientIp, detectFieldChanges } from '@/lib/audit';
import { validateBody, UpdateProfileSchema } from '@/lib/validations';

export async function GET() {
  try {
    const current = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: current.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        rut: true,
        phone: true,
        address: true,
        regionId: true,
        comunaId: true,
        createdAt: true,
        updatedAt: true,
        region: { select: { id: true, name: true, code: true } },
        comuna: { select: { id: true, name: true, code: true, regionId: true } },
      },
    });

    if (!user) {
      return errorResponse('Usuario no encontrado', 404);
    }

    return successResponse(user);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    return errorResponse('Error al obtener perfil', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const current = await requireAuth();

    const body = await request.json();
    const validation = validateBody(UpdateProfileSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { firstName, lastName, email, phone, address, regionId, comunaId } = validation.data;

    const existing = await prisma.user.findUnique({
      where: { id: current.userId },
    });

    if (!existing) {
      return errorResponse('Usuario no encontrado', 404);
    }

    if (email !== existing.email) {
      const emailTaken = await prisma.user.findFirst({
        where: { email, NOT: { id: current.userId } },
      });
      if (emailTaken) {
        return errorResponse('El email ya está registrado por otro usuario');
      }
    }

    const previousData = {
      firstName: existing.firstName,
      lastName: existing.lastName,
      email: existing.email,
      phone: existing.phone,
      address: existing.address,
      regionId: existing.regionId,
      comunaId: existing.comunaId,
    };

    const updatedDirect = await prisma.user.update({
      where: { id: current.userId },
      data: {
        firstName,
        lastName,
        email,
        phone: phone ?? null,
        address: address ?? null,
        regionId: regionId ?? null,
        comunaId: comunaId ?? null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        rut: true,
        phone: true,
        address: true,
        regionId: true,
        comunaId: true,
        createdAt: true,
        updatedAt: true,
        region: { select: { id: true, name: true, code: true } },
        comuna: { select: { id: true, name: true, code: true, regionId: true } },
      },
    });

    const newData = {
      firstName: updatedDirect.firstName,
      lastName: updatedDirect.lastName,
      email: updatedDirect.email,
      phone: updatedDirect.phone,
      address: updatedDirect.address,
      regionId: updatedDirect.regionId,
      comunaId: updatedDirect.comunaId,
    };

    const fieldChanges = detectFieldChanges(previousData, newData);

    await createAuditLog({
      user: {
        userId: current.userId,
        email: existing.email,
        firstName: updatedDirect.firstName,
        lastName: updatedDirect.lastName,
      },
      action: 'UPDATE',
      module: 'Profile',
      entityId: String(current.userId),
      entityType: 'User',
      ipAddress: await getClientIp(request),
      previousData,
      newData,
    });

    return successResponse(updatedDirect, 'Perfil actualizado exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    console.error('Update profile error:', error);
    return errorResponse('Error al actualizar perfil', 500);
  }
}
