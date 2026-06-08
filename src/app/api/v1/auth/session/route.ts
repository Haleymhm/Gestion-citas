import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return unauthorizedResponse();
    }

    return successResponse(session);
  } catch (error) {
    console.error('Session error:', error);
    return unauthorizedResponse();
  }
}