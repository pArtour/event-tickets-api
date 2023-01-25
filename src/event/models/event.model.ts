import { Field } from '@nestjs/graphql';
import { BaseModel } from 'src/common/models/base.model';

export class Event extends BaseModel {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  //   @Field(() => Data)
}
