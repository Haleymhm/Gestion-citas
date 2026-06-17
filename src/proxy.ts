import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, JWT_SECRET, JWTPayload } from '@/lib/jwt';

const PUBLIC_PATHS = ['/signin', '/signup', '/api/v1/auth/login', '/api/v1/auth/register'];
const AUTH_API_PATHS = ['/api/v1/auth/session', '/api/v1/auth/logout'];
const ADMIN_ONLY_PATHS = ['/usuarios'];
const STAFF_PATHS = ['/calendar', '/categorias', '/clientes', '/mascotas', '/historial-medico', '/regiones', '/comunas'];
const VET_PATHS = ['/historial-medico'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/v1/auth/logout')) {
    return NextResponse.next();
  }

  if (AUTH_API_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = payload as unknown as JWTPayload;

    if (pathname.startsWith('/portal')) {
      if (session.role !== 'CLIENT') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    }

    if (ADMIN_ONLY_PATHS.some(path => pathname.startsWith(path))) {
      if (session.role !== 'ADMIN') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ success: false, error: 'Acceso prohibido' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (STAFF_PATHS.some(path => pathname.startsWith(path)) || VET_PATHS.some(path => pathname.startsWith(path))) {
      if (!['ADMIN', 'VET', 'RECEPTIONIST'].includes(session.role)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ success: false, error: 'Acceso prohibido' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/portal/mis-citas', request.url));
      }
    }

    if (pathname === '/') {
      if (session.role === 'CLIENT') {
        return NextResponse.redirect(new URL('/portal/mis-citas', request.url));
      }
    }

    const response = NextResponse.next();
    response.headers.set('x-user-id', session.userId.toString());
    response.headers.set('x-user-role', session.role);
    response.headers.set('x-user-name', `${session.firstName} ${session.lastName}`);
    return response;
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};