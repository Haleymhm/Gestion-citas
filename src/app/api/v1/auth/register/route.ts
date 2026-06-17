import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { validateBody, RegisterSchema } from '@/lib/validations';
import type { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(RegisterSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { email, password, firstName, lastName, role } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

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
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await setAuthCookie(token);

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }, 'Usuario registrado correctamente', 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Error interno del servidor', 500);
  }
}