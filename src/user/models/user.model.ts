import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

import { BaseModel } from 'src/common/models/base.model';
import { Location } from 'src/location/models/location.model';

registerEnumType(Role, {
  name: 'Role',
  description: 'User role',
});

@ObjectType()
export class User extends BaseModel {
  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  firstName: string;

  @Field(() => String, { nullable: true })
  lastName: string;

  @Field(() => Location, { nullable: true })
  location?: Location | null;

  @Field(() => [User], { nullable: true })
  friends?: [User] | null;

  @Field(() => Role)
  role: Role;

  //   @Field(() => String, { nullable: true })
  //   content?: string | null;
  //   @Field(() => Boolean)
  //   published: boolean;
  //   @Field(() => User, { nullable: true })
  //   author?: User | null;
}
