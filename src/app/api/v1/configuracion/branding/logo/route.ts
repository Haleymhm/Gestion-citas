import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth-helper';
import {
  successResponse, errorResponse,
  unauthorizedResponse, forbiddenResponse,
} from '@/lib/api-response';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { saveBranding, getBranding, DEFAULT_BRANDING } from '@/services/settings/get-branding';
import { createAuditLog, getClientIp } from '@/lib/audit';

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/svg+xml'];
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('logo');

    if (!file || !(file instanceof File)) {
      return errorResponse('No se proporcionó archivo', 400);
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return errorResponse('Tipo de archivo no permitido. Solo PNG, JPG o SVG.', 400);
    }

    if (file.size > MAX_SIZE) {
      return errorResponse('El archivo excede 2MB', 400);
    }

    const ext = file.type === 'image/png' ? 'png'
      : file.type === 'image/jpeg' ? 'jpg'
      : 'svg';

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filename = `logo-${Date.now()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const logoUrl = `/uploads/${filename}`;
    const current = await getBranding();
    const newBranding = {
      ...DEFAULT_BRANDING,
      ...current,
      logoUrl,
    };
    await saveBranding(newBranding, admin.userId);

    await createAuditLog({
      user: {
        userId: admin.userId,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
      action: 'UPDATE',
      module: 'Configuracion',
      entityId: 'branding.logo',
      entityType: 'ClinicSetting',
      ipAddress: await getClientIp(request),
      newData: { logoUrl, sizeBytes: file.size, mimeType: file.type },
    });

    return successResponse({ logoUrl }, 'Logo subido');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') return unauthorizedResponse();
    if (error instanceof Error && error.message === 'Acceso prohibido') return forbiddenResponse();
    console.error('Error POST logo:', error);
    return errorResponse('Error al subir logo', 500);
  }
}
