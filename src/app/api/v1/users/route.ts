import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import type { Role } from '@prisma/client';

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      where: { role: { in: ['VET', 'RECEPTIONIST', 'CLIENT'] } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(users);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al obtener usuarios', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { email, password, firstName, lastName, role } = body;

    if (!email || !password || !firstName || !lastName || !role) {
      return errorResponse('Todos los campos son requeridos');
    }

    if (!['ADMIN', 'VET', 'RECEPTIONIST'].includes(role)) {
      return errorResponse('Rol no válido para esta acción');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as Role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(user, 'Usuario creado exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al crear usuario', 500);
  }
}