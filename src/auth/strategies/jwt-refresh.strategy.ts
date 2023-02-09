import { JwtDto } from 'src/auth/dto/jwt.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JWT_REFRESH_SECRET } from 'src/common/configs/constants';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Refresh;
        },
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get(JWT_REFRESH_SECRET),
    });
  }

  public async validate(request: Request, payload: JwtDto) {
    const refreshToken = request?.cookies?.Refresh;
    const user = await this.authService.validateUserRefreshToken(
      refreshToken,
      payload.userId,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
