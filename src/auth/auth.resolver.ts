import { ExecutionContext, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { LoginInput } from 'src/auth/dto/login.input';
import { SignupInput } from 'src/auth/dto/signup.input';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { GqlRefreshAuthGuard } from 'src/auth/guards/gql-refresh-auth.guard';
import { Auth } from 'src/auth/models/auth.model';
import { UserEntity } from 'src/common/decorators/user.decorator';
import { User } from 'src/user/models/user.model';
import { CookieType } from './models/cookie.type';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation()
  public async signup(
    @Args('data') data: SignupInput,
    @Context() ctx: ExecutionContext,
  ) {
    console.log(ctx.switchToHttp().getRequest());
    data.email = data.email.toLowerCase();
    const { accessToken, refreshToken } = await this.authService.createUser(
      data,
    );
    this.setCookie(ctx, accessToken);
    this.setCookie(ctx, refreshToken);
    return;
  }

  @Mutation()
  public async login(
    @Args('data') data: LoginInput,
    @Context() ctx: ExecutionContext,
  ) {
    data.email = data.email.toLowerCase();
    const { accessToken, refreshToken } = await this.authService.login(data);
    this.setCookie(ctx, accessToken);
    this.setCookie(ctx, refreshToken);
  }

  @UseGuards(GqlAuthGuard, GqlRefreshAuthGuard)
  @Mutation()
  public async logout(
    @UserEntity() user: User,
    @Context() ctx: ExecutionContext,
  ) {
    const { accessToken: emptyAccessToken, refreshToken: emptyRefreshToken } =
      await this.authService.logout(user.id);
    console.log((ctx as any).res);
    this.setCookie(ctx, emptyAccessToken);
    this.setCookie(ctx, emptyRefreshToken);
    return;
  }

  // @Mutation(() => Token)
  // async refreshToken(@Args() { token }: RefreshTokenInput) {
  //   return this.authService.refreshToken(token);
  // }

  private setCookie(ctx: ExecutionContext, cookie: CookieType) {
    ctx
      .switchToHttp()
      .getResponse<Response>()
      .cookie(cookie.name, cookie.value, cookie.options);
  }

  // @ResolveField('user', () => User)
  // async user(@Parent() auth: Auth) {
  //   return this.authService.getUserFromToken(auth.accessToken);
  // }
}
