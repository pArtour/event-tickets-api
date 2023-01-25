import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Location {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  state: string;

  @Field(() => String)
  zip: string;

  @Field(() => String)
  latitude: string;

  @Field(() => String)
  longitude: string;
}
