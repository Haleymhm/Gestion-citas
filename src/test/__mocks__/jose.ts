let tokenCounter = 0;
export const jwtVerify = jest.fn().mockImplementation((token: string) => {
  if (token === 'invalid-token' || token === '' || token === 'not.a.jwt' || token.includes('xxxxx')) {
    throw new Error('Invalid token');
  }
  if (token.startsWith('wrong-secret')) {
    throw new Error('JWT verification failed');
  }
  if (token === 'expired-token') {
    throw new Error('Token expired');
  }
  return Promise.resolve({
    payload: {
      userId: 1,
      email: 'test@example.com',
      role: 'CLIENT',
      firstName: 'John',
      lastName: 'Doe',
    },
    protectedHeader: { alg: 'HS256' },
  });
});

export const SignJWT = jest.fn().mockImplementation(() => ({
  setProtectedHeader: jest.fn().mockReturnThis(),
  setIssuedAt: jest.fn().mockReturnThis(),
  setExpirationTime: jest.fn().mockReturnThis(),
  sign: jest.fn().mockImplementation(() => {
    tokenCounter++;
    return Promise.resolve(`mocktoken${tokenCounter}.payload.signature`);
  }),
}));