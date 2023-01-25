import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
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
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash password', async () => {
    const hashedPassword = await service.hashPassword('password');
    expect(hashedPassword).toBeDefined();
  });

  it('should compare password', async () => {
    const hashedPassword = await service.hashPassword('password');
    const isPasswordMatch = await service.validatePassword(
      'password',
      hashedPassword,
    );
    expect(isPasswordMatch).toBeTruthy();

    const isPasswordNotMatch = await service.validatePassword(
      'password',
      'some other password',
    );
    expect(isPasswordNotMatch).toBeFalsy();
  });

  it('should get bcrypt salt rounds', () => {
    const saltRounds = service.bycryptSaltRounds;
    expect(saltRounds).toBe(10);
  });
});
