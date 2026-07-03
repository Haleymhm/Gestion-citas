import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { createAuditLog, getClientIp } from '@/lib/audit';
import { validateBody, ChangePasswordSchema } from '@/lib/validations';

export async function PUT(request: NextRequest) {
  try {
    const current = await requireAuth();

    const body = await request.json();
    const validation = validateBody(ChangePasswordSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: current.userId },
    });

    if (!user) {
      return errorResponse('Usuario no encontrado', 404);
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return errorResponse('La contraseña actual es incorrecta', 400);
    }

    if (currentPassword === newPassword) {
      return errorResponse('La nueva contraseña debe ser diferente a la actual', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: current.userId },
      data: { password: hashedPassword },
    });

    await createAuditLog({
      user: {
        userId: current.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      action: 'UPDATE',
      module: 'Profile',
      entityId: String(current.userId),
      entityType: 'User',
      ipAddress: await getClientIp(request),
      newData: { passwordChanged: true },
    });

    return successResponse(null, 'Contraseña actualizada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    console.error('Change password error:', error);
    return errorResponse('Error al cambiar contraseña', 500);
  }
}
