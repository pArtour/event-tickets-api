import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { User } from 'src/user/models/user.model';
import { UserService } from 'src/user/user.service';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query((returns) => User, { name: 'user' })
  public async getUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.getUser(id);
  }

  // public async getUser(@Args('id', { type: () => Int }) id: number) {
  // 	return this.userService.getUser(id);
  // }
}
