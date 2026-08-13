import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { validateBody, LoginSchema } from '@/lib/validations';
import type { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(LoginSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse('Credenciales inválidas', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return errorResponse('Credenciales inválidas', 401);
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await setAuthCookie(token);

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }, 'Sesión iniciada correctamente');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Error interno del servidor', 500);
  }
}