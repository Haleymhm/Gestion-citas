import { proxy } from '@/proxy';
import { NextRequest } from 'next/server';

describe('Proxy CORS handling', () => {
  const originalEnv = process.env.CORS_ALLOWED_ORIGINS;

  afterEach(() => {
    process.env.CORS_ALLOWED_ORIGINS = originalEnv;
  });

  it('should handle OPTIONS preflight with wildcard CORS_ALLOWED_ORIGINS="*"', async () => {
    process.env.CORS_ALLOWED_ORIGINS = '*';
    const req = new NextRequest('http://192.168.0.110:3000/api/v1/auth/login', {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:8081',
      },
    });

    const res = await proxy(req);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:8081');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  it('should set CORS headers for public API route like login', async () => {
    process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:8081,http://localhost:3000';
    const req = new NextRequest('http://192.168.0.110:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:8081',
      },
    });

    const res = await proxy(req);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:8081');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });
});
