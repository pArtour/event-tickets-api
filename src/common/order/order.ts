import { Field, InputType } from '@nestjs/graphql';
import { OrderDirection } from 'src/common/order/order-direction.enum';

@InputType({ isAbstract: true })
export abstract class Order {
  @Field(() => OrderDirection)
  direction: OrderDirection;
}
