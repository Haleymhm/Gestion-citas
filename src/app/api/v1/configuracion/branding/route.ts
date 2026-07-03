import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-helper';
import {
  successResponse, errorResponse,
  unauthorizedResponse, forbiddenResponse,
} from '@/lib/api-response';
import { validateBody, UpdateBrandingSchema } from '@/lib/validations';
import { saveBranding, getBranding } from '@/services/settings/get-branding';
import { createAuditLog, getClientIp, detectFieldChanges } from '@/lib/audit';

export async function GET() {
  try {
    await requireAdmin();
    const branding = await getBranding();
    return successResponse(branding);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') return unauthorizedResponse();
    if (error instanceof Error && error.message === 'Acceso prohibido') return forbiddenResponse();
    return errorResponse('Error al obtener marca', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const validation = validateBody(UpdateBrandingSchema, body);
    if (!validation.success) return errorResponse(validation.error);

    const previous = await getBranding();

    const newBranding = {
      clinicName: validation.data.clinicName,
      primaryColor: validation.data.primaryColor,
      secondaryColor: validation.data.secondaryColor,
      footerText: validation.data.footerText,
      fromEmail: validation.data.fromEmail,
      fromName: validation.data.clinicName,
      logoUrl: previous.logoUrl,
    };

    await saveBranding(newBranding, admin.userId);

    const changes = detectFieldChanges(
      previous as unknown as Record<string, unknown>,
      newBranding as unknown as Record<string, unknown>
    );

    await createAuditLog({
      user: {
        userId: admin.userId,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
      action: 'UPDATE',
      module: 'Configuracion',
      entityId: 'branding',
      entityType: 'ClinicSetting',
      ipAddress: await getClientIp(request),
      fieldChanges: changes,
      newData: newBranding as unknown as Record<string, unknown>,
    });

    return successResponse(newBranding, 'Marca actualizada exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') return unauthorizedResponse();
    if (error instanceof Error && error.message === 'Acceso prohibido') return forbiddenResponse();
    console.error('Error PUT branding:', error);
    return errorResponse('Error al actualizar marca', 500);
  }
}
