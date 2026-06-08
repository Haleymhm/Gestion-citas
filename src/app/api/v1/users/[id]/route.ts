import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';
import type { Role } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return notFoundResponse('Usuario');
    }

    return successResponse(user);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al obtener usuario', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, role, password } = body;

    const data: {
      firstName?: string;
      lastName?: string;
      role?: Role;
      password?: string;
    } = {};

    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;

    if (role && ['ADMIN', 'VET', 'RECEPTIONIST', 'CLIENT'].includes(role)) {
      data.role = role;
    }

    if (password && password.length >= 8) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(user, 'Usuario actualizado exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al actualizar usuario', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(null, 'Usuario eliminado exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return notFoundResponse('Usuario');
    }
    return errorResponse('Error al eliminar usuario', 500);
  }
}