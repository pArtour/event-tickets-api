import { RefreshTokenInput } from 'src/auth/dto/refresh-token.input';
import { Token } from 'src/auth/models/token.model';
import { LoginInput } from 'src/auth/dto/login.input';
import { SignupInput } from 'src/auth/dto/signup.input';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { Auth } from 'src/auth/models/auth.model';
import { User } from 'src/user/models/user.model';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation()
  public signup(@Args('data') data: SignupInput) {
    data.email = data.email.toLowerCase();
    return this.authService.createUser(data);
  }

  @Mutation()
  public async login(@Args('data') data: LoginInput) {
    data.email = data.email.toLowerCase();
    const { accessToken, refreshToken } = await this.authService.login(data);

    return {
      accessToken,
      refreshToken,
    };
  }

  @Mutation(() => Token)
  async refreshToken(@Args() { token }: RefreshTokenInput) {
    return this.authService.refreshToken(token);
  }

  @ResolveField('user', () => User)
  async user(@Parent() auth: Auth) {
    return this.authService.getUserFromToken(auth.accessToken);
  }
}
