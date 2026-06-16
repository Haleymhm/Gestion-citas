import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireStaff, getCurrentUser } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { createAuditLog, getClientIp } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    await requireStaff();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = search
      ? {
          role: 'CLIENT' as const,
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { rut: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : { role: 'CLIENT' as const };

    const [clients, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          rut: true,
          phone: true,
          address: true,
          regionId: true,
          comunaId: true,
          role: true,
          createdAt: true,
          pets: {
            select: {
              id: true,
              name: true,
              species: true,
            },
          },
          region: {
            select: {
              id: true,
              name: true,
            },
          },
          comuna: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({
      data: clients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al obtener clientes', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireStaff();

    const body = await request.json();
    const { email, password, firstName, lastName, rut, phone, address, regionId, comunaId } = body;

    if (!email || !password || !firstName || !lastName || !rut) {
      return errorResponse('Los campos nombre, apellido, email, password y RUT son requeridos');
    }

    if (password.length < 8) {
      return errorResponse('La contraseña debe tener al menos 8 caracteres');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse('El email ya está registrado');
    }

    const existingRut = await prisma.user.findUnique({ where: { rut } });
    if (existingRut) {
      return errorResponse('El RUT ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      rut,
      phone: phone || null,
      address: address || null,
      regionId: regionId || null,
      comunaId: comunaId || null,
      role: 'CLIENT' as const,
    };

    const user = await prisma.user.create({
      data: createData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        rut: true,
        phone: true,
        address: true,
        regionId: true,
        comunaId: true,
        role: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      user: currentUser,
      action: 'CREATE',
      module: 'Client',
      entityId: String(user.id),
      entityType: 'User',
      ipAddress: await getClientIp(request),
      newData: createData as Record<string, unknown>,
    });

    return successResponse(user, 'Cliente creado exitosamente', 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al crear cliente', 500);
  }
}