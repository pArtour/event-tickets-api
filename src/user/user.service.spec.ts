import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'PrismaService',
          useValue: {
            user: {
              findUnique: jest.fn().mockImplementation(() => {
                return {
                  id: 1,
                  email: '',
                  password: '',
                };
              }),
              update: jest.fn().mockImplementation(() => {
                return {
                  id: 1,
                  email: '',
                  password: '',
                };
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(UserService);
  });

  it('should return user', async () => {
    const user = await service.getUser(1);
    expect(user).toEqual({
      id: 1,
      email: '',
      password: '',
    });
  });

  it('should update user', async () => {
    const user = await service.updateUser(1, {
      email: '',
      password: '',
    });
    expect(user).toEqual({
      id: 1,
      email: '',
      password: '',
    });
  });
});
