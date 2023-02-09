import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthResolver } from 'src/auth/auth.resolver';
import { AuthService } from 'src/auth/auth.service';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { PasswordService } from 'src/auth/password/password.service';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({}),
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
