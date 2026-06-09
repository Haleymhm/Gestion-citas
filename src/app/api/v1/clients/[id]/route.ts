import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth-helper';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    const { id } = await params;

    const client = await prisma.user.findFirst({
      where: { id: parseInt(id), role: 'CLIENT' },
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
            breed: true,
            birthDate: true,
            weight: true,
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
    });

    if (!client) {
      return notFoundResponse('Cliente');
    }

    return successResponse(client);
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al obtener cliente', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, email, password, rut, phone, address, regionId, comunaId } = body;

    const data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      rut?: string;
      phone?: string | null;
      address?: string | null;
      regionId?: string | null;
      comunaId?: string | null;
    } = {};

    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (email) data.email = email;
    if (rut !== undefined) data.rut = rut;
    if (phone !== undefined) data.phone = phone || null;
    if (address !== undefined) data.address = address || null;
    if (regionId !== undefined) data.regionId = regionId || null;
    if (comunaId !== undefined) data.comunaId = comunaId || null;

    if (password && password.length >= 8) {
      data.password = await bcrypt.hash(password, 10);
    }

    const client = await prisma.user.update({
      where: { id: parseInt(id), role: 'CLIENT' },
      data,
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

    return successResponse(client, 'Cliente actualizado exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al actualizar cliente', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    const { id } = await params;

    await prisma.user.delete({
      where: { id: parseInt(id), role: 'CLIENT' },
    });

    return successResponse(null, 'Cliente eliminado exitosamente');
  } catch (error) {
    if (error instanceof Error && error.message === 'No autorizado') {
      return unauthorizedResponse();
    }
    if (error instanceof Error && error.message === 'Acceso prohibido') {
      return forbiddenResponse();
    }
    return errorResponse('Error al eliminar cliente', 500);
  }
}