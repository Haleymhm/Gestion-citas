import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export function successResponse<T>(data: T, message?: string, status = 200) {
  const response: ApiResponse<T> = { success: true, data };
  if (message) response.message = message;
  return NextResponse.json(response, { status });
}

export function errorResponse(error: string, status = 400) {
  const response: ApiResponse = { success: false, error };
  return NextResponse.json(response, { status });
}

export function unauthorizedResponse() {
  return errorResponse('No autorizado', 401);
}

export function forbiddenResponse() {
  return errorResponse('Acceso prohibido', 403);
}

export function notFoundResponse(resource = 'Recurso no encontrado') {
  return errorResponse(resource, 404);
}