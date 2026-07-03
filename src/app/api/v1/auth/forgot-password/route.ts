import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { validateBody, ForgotPasswordSchema } from '@/lib/validations';
import { sendPasswordResetEmail } from '@/lib/email';
import { createAuditLog, getClientIp } from '@/lib/audit';
import logger from '@/lib/logger';

const TOKEN_TTL_MINUTES = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(ForgotPasswordSchema, body);

    if (!validation.success) {
      return errorResponse(validation.error);
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true, email: true },
    });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.origin}`;
      const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

      const result = await sendPasswordResetEmail({
        to: user.email,
        firstName: user.firstName,
        resetUrl,
        expiresInMinutes: TOKEN_TTL_MINUTES,
      });

      if (!result.success) {
        logger.error(`Failed to send password reset email to ${user.email}: ${result.error}`);
      }

      await createAuditLog({
        user: {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: '',
        },
        action: 'CREATE',
        module: 'Auth',
        entityId: String(user.id),
        entityType: 'PasswordResetToken',
        ipAddress: await getClientIp(request),
        newData: { action: 'password_reset_requested', expiresAt },
      });
    }

    return successResponse(
      null,
      'Si el email está registrado, recibirás un enlace para restablecer tu contraseña',
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('Error al procesar la solicitud', 500);
  }
}
