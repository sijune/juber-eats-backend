import { Resolver, Args, Mutation, Query, Subscription } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import { Role } from '../auth/role.decorator';
import { User } from '../users/entities/user.entity';
import { OrdersOutput, OrdersInput } from './dtos/orders.dto';
import { OrderOutput, OrderInput } from './dtos/order.dto';
import { UpdateOrderInput, UpdateOrderOutput } from './dtos/update-order.dto';
import { Inject } from '@nestjs/common';
import { PUB_SUB, NEW_PENDING_ORDER, NEW_COOKED_ORDER } from '../common/common.constants';
import { PubSub } from 'graphql-subscriptions';

@Resolver((of) => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService, @Inject(PUB_SUB) private readonly pubsub: PubSub) {} //common module에 선언되어 있다.

  @Mutation((returns) => CreateOrderOutput)
  @Role(['Client']) //metadata에 값을 넣는다.
  async createOrder(
    @AuthUser() customer: User, //restaurant 생성 시 참조하기 위해서
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }

  @Query((returns) => OrdersOutput)
  @Role(['Any'])
  async orders(@AuthUser() user: User, @Args('input') ordersInput: OrdersInput): Promise<OrdersOutput> {
    return this.ordersService.getOrders(user, ordersInput);
  }

  @Query((returns) => OrderOutput)
  @Role(['Any'])
  async order(@AuthUser() user: User, @Args('input') orderInput: OrderInput): Promise<OrderOutput> {
    return this.ordersService.getOrder(user, orderInput);
  }

  @Mutation((returns) => UpdateOrderOutput)
  @Role(['Any']) //metadata에 값을 넣는다.
  async updateOrder(
    @AuthUser() user: User, //restaurant 생성 시 참조하기 위해서
    @Args('input') updateOrderInput: UpdateOrderInput,
  ): Promise<UpdateOrderOutput> {
    return this.ordersService.updateOrder(user, updateOrderInput);
  }

  //Owner의 주문 Listening
  @Subscription((returns) => Order, {
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      console.log(ownerId, user.id);
      return ownerId === user.id;
    },
    resolve: ({ pendingOrders: { order } }) => order, //service에서 payload를 변경해줬기 때문에 다시 Order반환하도록 변경
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }

  //Delivery 요리완료 Listening
  @Subscription((returns) => Order)
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER);
  }
}
