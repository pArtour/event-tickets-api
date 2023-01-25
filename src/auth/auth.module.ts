import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthResolver } from 'src/auth/auth.resolver';
import { AuthService } from 'src/auth/auth.service';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { PasswordService } from 'src/auth/password/password.service';
import { SecurityConfig } from 'src/common/configs/config.interface';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');

        return {
          secret: configService.get('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: securityConfig.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    GqlAuthGuard,
    PasswordService,
  ],
  exports: [GqlAuthGuard],
})
export class AuthModule {}
