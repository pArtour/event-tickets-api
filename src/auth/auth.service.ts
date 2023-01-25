import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { JwtDto } from 'src/auth/dto/jwt.dto';
import { SignupInput } from 'src/auth/dto/signup.input';
import { PasswordService } from 'src/auth/password/password.service';
import { SecurityConfig } from 'src/common/configs/config.interface';
import { LoginInput } from 'src/auth/dto/login.input';
import { Token } from 'src/auth/models/token.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly prisma: PrismaService,
  ) {}

  public async createUser(payload: SignupInput): Promise<Token> {
    const hashedPassword = await this.passwordService.hashPassword(
      payload.password,
    );
    try {
      const user = await this.prisma.user.create({
        data: {
          email: payload.email,
          password: hashedPassword,
        },
      });

      return this.generateTokens(user.id);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }

      throw new InternalServerErrorException("Couldn't create user.");
    }
  }

  public async login(payload: LoginInput): Promise<Token> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${payload.email}`);
    }

    const isPasswordValid = await this.passwordService.validatePassword(
      payload.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    return this.generateTokens(user.id);
  }

  public async validateUser(payload: JwtDto): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });
  }

  public getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  public refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }) as { userId: number };

      return this.generateTokens(userId);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private async generateTokens(userId: number): Promise<Token> {
    return {
      accessToken: this.generateAccessToken({ userId }),
      refreshToken: this.generateRefreshToken({ userId }),
    };
  }

  private generateAccessToken(payload: { userId: number }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: number }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }
}
