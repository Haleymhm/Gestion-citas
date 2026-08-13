import { cookies, headers } from 'next/headers';
import { createToken, verifyToken, JWT_SECRET } from './jwt';
import type { JWTPayload } from './jwt';

export { JWT_SECRET };
export type { JWTPayload };

export { createToken, verifyToken };

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const headersList = await headers();
  const cookieToken = cookieStore.get('auth-token')?.value;
  const authHeader = headersList.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}