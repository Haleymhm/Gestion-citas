import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireStaff } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    console.log("Categories API - user:", user);
    if (!user) {
      return unauthorizedResponse();
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    console.log("Categories found:", categories.length);

    return successResponse(categories);
  } catch (error) {
    console.error("Error in categories GET:", error);
    return errorResponse('Error al obtener categorías', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    await requireStaff();

    if (user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name || !color) {
      return errorResponse('Nombre y color son requeridos');
    }

    const category = await prisma.category.create({
      data: {
        name,
        color,
      },
    });

    return successResponse(category, 'Categoría creada exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al crear categoría', 500);
  }
}