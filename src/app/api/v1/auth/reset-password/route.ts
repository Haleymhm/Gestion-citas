import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { validateBody, ResetPasswordSchema } from '@/lib/validations';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(ResetPasswordSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { token, newPassword } = validation.data;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });

    if (!tokenRecord) {
      return errorResponse('El enlace de recuperación es inválido o ya fue utilizado', 400);
    }

    if (tokenRecord.usedAt) {
      return errorResponse('El enlace de recuperación ya fue utilizado', 400);
    }

    if (tokenRecord.expiresAt < new Date()) {
      return errorResponse('El enlace de recuperación ha expirado', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: tokenRecord.userId,
        usedAt: null,
        NOT: { id: tokenRecord.id },
      },
      data: { usedAt: new Date() },
    });

    await createAuditLog({
      user: {
        userId: tokenRecord.user.id,
        email: tokenRecord.user.email,
        firstName: tokenRecord.user.firstName,
        lastName: tokenRecord.user.lastName,
      },
      action: 'UPDATE',
      module: 'Auth',
      entityId: String(tokenRecord.user.id),
      entityType: 'User',
      ipAddress: await getClientIp(request),
      newData: { action: 'password_reset_completed' },
    });

    return successResponse(null, 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.');
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('Error al restablecer la contraseña', 500);
  }
}
