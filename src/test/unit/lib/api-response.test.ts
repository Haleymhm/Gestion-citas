import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';

describe('API Response Helpers', () => {
  describe('successResponse', () => {
    it('should return success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = successResponse(data);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should return default 200 status', async () => {
      const response = successResponse({ id: 1 });
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ id: 1 });
      expect(body.error).toBeUndefined();
    });

    it('should accept custom message', () => {
      const response = successResponse({ id: 1 }, 'Operation successful');
      expect(response.status).toBe(200);
    });

    it('should accept custom status code', () => {
      const response = successResponse({ id: 1 }, 'Created', 201);
      expect(response.status).toBe(201);
    });

    it('should work with array data', () => {
      const data = [1, 2, 3, 4, 5];
      const response = successResponse(data);
      expect(response.status).toBe(200);
    });

    it('should work with null data', () => {
      const response = successResponse(null);
      expect(response.status).toBe(200);
    });

    it('should work with empty object data', () => {
      const response = successResponse({});
      expect(response.status).toBe(200);
    });

    it('should preserve data structure with nested objects', () => {
      const data = {
        user: {
          id: 1,
          name: 'John',
          address: { city: 'Santiago', region: 'RM' }
        },
        pets: [
          { id: 1, name: 'Firulais' },
          { id: 2, name: 'Michu' }
        ]
      };
      const response = successResponse(data);
      expect(response.status).toBe(200);
    });
  });

  describe('errorResponse', () => {
    it('should return error with 400 status by default', () => {
      const response = errorResponse('Bad request');
      expect(response.status).toBe(400);
    });

    it('should return JSON with success false', async () => {
      const response = errorResponse('Something went wrong');
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Something went wrong');
      expect(body.data).toBeUndefined();
    });

    it('should accept custom status code', () => {
      const response = errorResponse('Server error', 500);
      expect(response.status).toBe(500);
    });

    it('should work with 404 status', () => {
      const response = errorResponse('Not found', 404);
      expect(response.status).toBe(404);
    });

    it('should work with 403 status', () => {
      const response = errorResponse('Forbidden', 403);
      expect(response.status).toBe(403);
    });

    it('should handle empty error message', () => {
      const response = errorResponse('');
      expect(response.status).toBe(400);
    });
  });

  describe('unauthorizedResponse', () => {
    it('should return 401 status', () => {
      const response = unauthorizedResponse();
      expect(response.status).toBe(401);
    });

    it('should return unauthorized error message', async () => {
      const response = unauthorizedResponse();
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('No autorizado');
    });

    it('should be callable without arguments', () => {
      const response = unauthorizedResponse();
      expect(response.status).toBe(401);
    });
  });

  describe('forbiddenResponse', () => {
    it('should return 403 status', () => {
      const response = forbiddenResponse();
      expect(response.status).toBe(403);
    });

    it('should return forbidden error message', async () => {
      const response = forbiddenResponse();
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Acceso prohibido');
    });
  });

  describe('notFoundResponse', () => {
    it('should return 404 status by default', () => {
      const response = notFoundResponse();
      expect(response.status).toBe(404);
    });

    it('should return default resource not found message', async () => {
      const response = notFoundResponse();
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Recurso no encontrado');
    });

    it('should accept custom resource name', () => {
      const response = notFoundResponse('Usuario');
      expect(response.status).toBe(404);
    });

    it('should include custom resource name in error', async () => {
      const response = notFoundResponse('Usuario');
      const body = await response.json();
      expect(body.error).toBe('Usuario');
    });

    it('should work with various resource names', () => {
      const resources = ['Mascota', 'Cita', 'Historial Médico', 'Categoría'];
      resources.forEach(resource => {
        const response = notFoundResponse(resource);
        expect(response.status).toBe(404);
      });
    });
  });

  describe('Response Content-Type', () => {
    it('should set application/json content-type for successResponse', () => {
      const response = successResponse({ data: 'test' });
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should set application/json content-type for errorResponse', () => {
      const response = errorResponse('error');
      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });
});