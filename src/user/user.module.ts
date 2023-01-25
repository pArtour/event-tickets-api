import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  controllers: [],
  providers: [UserService, UserResolver],
  imports: [],
})
export class UserModule {}
