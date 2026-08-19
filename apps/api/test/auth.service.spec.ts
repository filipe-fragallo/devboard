import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';

describe('AuthService', () => {
  const prisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    refreshToken: { create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  };
  const jwt = { signAsync: jest.fn(), verifyAsync: jest.fn() };
  const config = { get: jest.fn() };
  const service = new AuthService(
    prisma as never,
    jwt as unknown as JwtService,
    config as unknown as ConfigService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('registers a new user and stores a hashed password', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'person@test.dev',
    });
    jwt.signAsync
      .mockResolvedValueOnce('access')
      .mockResolvedValueOnce('refresh');

    await expect(
      service.register({
        name: 'Person',
        email: 'Person@Test.Dev',
        password: 'Password1',
      }),
    ).resolves.toEqual({ accessToken: 'access', refreshToken: 'refresh' });

    expect(prisma.user.create.mock.calls[0][0].data.email).toBe(
      'person@test.dev',
    );
    expect(prisma.user.create.mock.calls[0][0].data.passwordHash).not.toBe(
      'Password1',
    );
    expect(prisma.refreshToken.create.mock.calls[0][0].data.tokenHash).not.toBe(
      'refresh',
    );
  });

  it('rejects duplicated email registration', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    await expect(
      service.register({
        name: 'Person',
        email: 'person@test.dev',
        password: 'Password1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid login', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: 'person@test.dev', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
