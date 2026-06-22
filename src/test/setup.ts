import '@testing-library/jest-dom';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    auditLog: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.AUDIT_SECRET_KEY = 'test-audit-secret-key';