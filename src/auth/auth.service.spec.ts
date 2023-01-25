import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PasswordService } from 'src/auth/password/password.service';
import { PrismaService } from 'nestjs-prisma';

const mockUser = {
  email: 'email@email.com',
  password: 'password',
  hashedPassword: 'password_hashed',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const authModuleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockImplementation((data) => {
                return {
                  id: 1,
                  email: data.email,
                  password: mockUser.hashedPassword,
                };
              }),
              findUnique: jest.fn().mockImplementation((data) => {
                return {
                  id: 1,
                  email: data.where.email,
                  password: mockUser.hashedPassword,
                };
              }),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              expiresIn: '2m',
              refreshIn: '7d',
              bcryptSaltOrRound: 10,
            }),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: jest.fn().mockImplementation(() => {
              return Promise.resolve(mockUser.hashedPassword);
            }),
            validatePassword: jest
              .fn()
              .mockImplementation((_, hashedPassword) => {
                return Promise.resolve(
                  hashedPassword === mockUser.hashedPassword,
                );
              }),
          },
        },
      ],
    }).compile();

    service = authModuleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AuthService);
  });

  it('should create a user and return token', async () => {
    const token = await service.createUser({
      email: mockUser.email,
      password: mockUser.password,
    });

    expect(token).toBeDefined();

    expect(token).toHaveProperty('accessToken');
    expect(token).toHaveProperty('refreshToken');

    expect(token.accessToken).toBeDefined();
    expect(token.refreshToken).toBeDefined();
  });

  it('should throw an error if user already exists', async () => {
    try {
      await service.createUser({
        email: mockUser.email,
        password: mockUser.password,
      });
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toBe(`Email ${mockUser.email} already used.`);
    }
  });

  it('should login a user and return token', async () => {
    const token = await service.login({
      email: mockUser.email,
      password: mockUser.password,
    });
    expect(token).toBeDefined();

    expect(token).toHaveProperty('accessToken');

    expect(token.accessToken).toBeDefined();

    expect(token.refreshToken).toBeDefined();
  });

  it('should throw an error if invalid password', async () => {
    try {
      await service.login({
        email: mockUser.email,
        password: '',
      });
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toBe('Invalid password.');
    }
  });

  it('should throw an error if user not found', async () => {
    try {
      await service.login({
        email: 'some_email@email.com',
        password: mockUser.password,
      });
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toBe('No user found for email: some_email@email.com');
    }
  });
});
