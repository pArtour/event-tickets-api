import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { SecurityConfig } from 'src/common/configs/config.interface';

@Injectable()
export class PasswordService {
  constructor(private readonly configService: ConfigService) {}

  public async hashPassword(password: string): Promise<string> {
    return hash(password, this.bycryptSaltRounds);
  }

  public validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  public get bycryptSaltRounds(): number | string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const saltOrRounds = securityConfig.bcryptSaltOrRound;

    return Number.isInteger(Number(saltOrRounds))
      ? Number(saltOrRounds)
      : saltOrRounds;
  }
}
