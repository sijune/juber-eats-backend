import { InputType, ObjectType, Field, Int, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Order } from '../entities/order.entity';
import { DishOption } from '../../restaurants/entities/dish.entity';
import { OrderItemOption } from '../entities/order-item.entity';

@InputType()
class CreateOrderItemInput {
  @Field((type) => Int)
  dishId: number;

  @Field((type) => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

// PickType대신 타입을 선언한 이유: 주문하기 위해서 전체를 가져올 필요가 없다. 타입을 새롭게 선언해서 dishId와 Option만 가져오도록 변경
@InputType()
export class CreateOrderInput {
  @Field((type) => Int)
  restaurantId: number;

  @Field((type) => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  orderId?: number;
}
