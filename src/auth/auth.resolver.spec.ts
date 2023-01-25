import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from 'src/auth/auth.resolver';
import { AuthService } from 'src/auth/auth.service';
// import { GqlAuthGuard } from './gql-auth.guard';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'password',
  hashedPassword: 'password_hashed',
};

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            refresh: jest.fn(),
          },
        },
      ],
    })
      // .overrideGuard(GqlAuthGuard)
      // .useValue({
      //   canActivate: jest.fn(),
      // })
      .compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(resolver).toBeInstanceOf(AuthResolver);
  });

  it('should login', async () => {});

  it('should register', async () => {});

  it('should logout', async () => {});

  it('should refresh', async () => {});
});
