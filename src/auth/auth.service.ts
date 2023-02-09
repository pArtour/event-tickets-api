import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { JwtDto } from 'src/auth/dto/jwt.dto';
import { LoginInput } from 'src/auth/dto/login.input';
import { SignupInput } from 'src/auth/dto/signup.input';
import { PasswordService } from 'src/auth/password/password.service';
import {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_TOKEN_COOKIE_MAX_AGE,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_TOKEN_COOKIE_MAX_AGE,
} from 'src/common/configs/constants';
// import { Token } from 'src/auth/models/token.model';
import { compare, hash } from 'bcrypt';
import { Cookies } from 'src/auth/models/cookie.type';
import {
  JWT_ACCESS_TOKEN_EXPIRATION_TIME,
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
} from 'src/common/configs/constants';

@Injectable()
export class AuthService {
  private readonly ACCESS_COOKIE_NAME = 'Authentication';
  private readonly REFRESH_COOKIE_NAME = 'Refresh';

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * createUser method creates new user in the database and returns access and refresh tokens
   * @param payload SignupInput object that contains email and password
   * @returns Promise with Cookies object
   */
  public async createUser(payload: SignupInput): Promise<Cookies> {
    try {
      // check if user already exists
      const userExists = await this.prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (userExists) {
        throw new ConflictException(
          `User with email ${payload.email} already exists.`,
        );
      }

      const hashedPassword = await this.passwordService.hashPassword(
        payload.password,
      );

      const newUser = await this.prisma.user.create({
        data: {
          email: payload.email,
          password: hashedPassword,
        },
      });

      return await this.getTokens({ userId: newUser.id });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        console.log({ e });
        throw new ConflictException(`Email ${payload.email} already used.`);
      }

      throw new InternalServerErrorException("Couldn't create user.");
    }
  }

  /**
   * login method authenticates user and returns access and refresh tokens
   * @param payload LoginInput object
   * @returns Promise with Cookies object
   */
  public async login(payload: LoginInput): Promise<Cookies> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `No user found for email: ${payload.email}`,
        );
      }

      const isPasswordValid = await this.passwordService.validatePassword(
        payload.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials');
      }

      const tokens = await this.getTokens({ userId: user.id });
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: await hash(tokens.refreshToken.value, 10),
        },
      });
      return tokens;
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  public async logout(userId: number): Promise<Cookies> {
    try {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          refreshToken: null,
        },
      });
      return {
        accessToken: {
          name: this.ACCESS_COOKIE_NAME,
          value: '',
          options: {
            httpOnly: true,
            path: '/',
            maxAge: 0,
          },
        },
        refreshToken: {
          name: this.REFRESH_COOKIE_NAME,
          value: '',
          options: {
            httpOnly: true,
            path: '/',
            maxAge: 0,
          },
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
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

  // public refreshToken(token: string) {
  //   try {
  //     const { userId } = this.jwtService.verify(token, {
  //       secret: this.configService.get('JWT_REFRESH_SECRET'),
  //     }) as { userId: number };

  //     return this.generateTokens(userId);
  //   } catch (e) {
  //     throw new UnauthorizedException();
  //   }
  // }

  public validateUserRefreshToken(
    token: string,
    userId: number,
  ): Promise<User> {
    const user = this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.refreshToken) {
      throw new UnauthorizedException();
    }

    const isTokenMatch = compare(token, user.refreshToken);
    if (!isTokenMatch) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private async getTokens(payload: {
    userId: number;
  }): Promise<{ accessToken: CookieType; refreshToken: CookieType }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get(JWT_ACCESS_SECRET),
        expiresIn: this.configService.get(JWT_ACCESS_TOKEN_EXPIRATION_TIME),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get(JWT_REFRESH_SECRET),
        expiresIn: this.configService.get(JWT_REFRESH_TOKEN_EXPIRATION_TIME),
      }),
    ]);

    return {
      accessToken: {
        name: this.ACCESS_COOKIE_NAME,
        value: accessToken,
        options: {
          httpOnly: true,
          path: '/',
          maxAge: this.configService.get(JWT_ACCESS_TOKEN_COOKIE_MAX_AGE),
        },
      },
      refreshToken: {
        name: this.REFRESH_COOKIE_NAME,
        value: refreshToken,
        options: {
          httpOnly: true,
          path: '/',
          maxAge: this.configService.get(JWT_REFRESH_TOKEN_COOKIE_MAX_AGE),
        },
      },
    };
  }

  // private getCookieWithJwtAccessToken(payload: { userId: number }): CookieType {
  //   const token = this.jwtService.sign(payload, {
  //     secret: this.configService.get(JWT_ACCESS_SECRET),
  //     expiresIn: this.configService.get(JWT_REFRESH_TOKEN_EXPIRATION_TIME),
  //   });
  //   return {
  //     name: this.ACCESS_COOKIE_NAME,
  //     value: token,
  //     options: {
  //       httpOnly: true,
  //       path: '/',
  //       maxAge: this.configService.get(JWT_ACCESS_TOKEN_EXPIRATION_TIME),
  //     },
  //   };
  // }

  // private getCookieWithJwtRefreshToken(payload: {
  //   userId: number;
  // }): CookieType {
  //   const token = this.jwtService.sign(payload, {
  //     secret: this.configService.get(JWT_REFRESH_SECRET),
  //     expiresIn: this.configService.get(JWT_REFRESH_TOKEN_EXPIRATION_TIME),
  //   });
  //   return {
  //     name: this.REFRESH_COOKIE_NAME,
  //     value: token,
  //     options: {
  //       httpOnly: true,
  //       path: '/',
  //       maxAge: this.configService.get(JWT_REFRESH_TOKEN_EXPIRATION_TIME),
  //     },
  //   };
  // }
}
