import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from 'src/auth/auth.resolver';
import { AuthService } from 'src/auth/auth.service';
import { Token } from './models/token.model';
// import { GqlAuthGuard } from './gql-auth.guard';

const mocks = {
  user: {
    id: 1,
    email: 'test@example.com',
    password: 'password',
  },
  hashedPassword: 'password_hashed',
  tokens: new Token(),
};

mocks.tokens.accessToken = 'mocked_access_token';
mocks.tokens.refreshToken = 'mocked_refresh_token';

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
            createUser: jest.fn().mockImplementation((data) => {
              console.log({ data });
              if (!data.email || data.email.length === 0) {
                throw new Error('Email is required');
              }

              if (!data.password || data.password.length === 0) {
                throw new Error('Password is required');
              }

              if (data.password.length < 8) {
                throw new Error('Password is too short');
              }

              return Promise.resolve(mocks.tokens);
            }),
            logout: jest.fn(),
            refreshToken: jest.fn(),
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

  it('should signup and return tokens', async () => {
    const tokens = await resolver.signup(mocks.user);

    expect(tokens).toBeDefined();
    expect(tokens).toBeInstanceOf(Token);

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();

    expect(tokens.accessToken).toBe('mocked_access_token');
    expect(tokens.refreshToken).toBe('mocked_refresh_token');
  });

  it('should throw error if password is too short', async () => {
    const user = { ...mocks.user, password: '123' };
    // delete user.email;
    try {
      await resolver.signup(user);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Password is too short');
    }
  });

  it('should throw error if password is not provided', async () => {
    const user = { ...mocks.user, password: '' };
    // delete user.email;
    try {
      await resolver.signup(user);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Password is required');
    }
  });

  // it('should logout', async () => {
  //   const result = await resolver.();
  //   expect(result).toBe(true);
  // });

  it('should refresh', async () => {
    const result = await resolver.refreshToken({
      token: mocks.tokens.accessToken,
    });
    expect(result).toBe(true);
  });
});
