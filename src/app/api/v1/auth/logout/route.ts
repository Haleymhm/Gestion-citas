import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/api-response';

export async function POST() {
  try {
    await clearAuthCookie();
    return successResponse(null, 'Sesión cerrada correctamente');
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, error: 'Error al cerrar sesión' }, { status: 500 });
  }
}