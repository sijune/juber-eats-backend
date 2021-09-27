import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';
import { OrdersOutput, OrdersInput } from './dtos/orders.dto';
import { OrderOutput, OrderInput } from './dtos/order.dto';
import { UpdateOrderInput, UpdateOrderOutput } from './dtos/update-order.dto';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB, NEW_PENDING_ORDER, NEW_COOKED_ORDER, NEW_ORDER_UPDATE } from '../common/common.constants';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) //entity가 와야한다.
    private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant) //entity가 와야한다.
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem) //entity가 와야한다.
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish) //entity가 와야한다.
    private readonly dishes: Repository<Dish>,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  async createOrder(customer: User, { restaurantId, items }: CreateOrderInput): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      let orderFinalPrice = 0; //주문 총 금액
      const orderItems: OrderItem[] = []; //주문 음식

      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          // 메뉴가 없다면
          return {
            ok: false,
            error: 'Dish not found',
          };
        }
        let dishFinalPrice = dish.price; //음식마다 옵션값 계산
        for (const itemOption of item.options) {
          const dishOption = dish.options.find((dishOption) => dishOption.name === itemOption.name);
          if (dishOption) {
            if (dishOption.extra) {
              //Pickle인 경우
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            } else {
              //size인 경우
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          items: orderItems,
          total: orderFinalPrice,
        }),
      );
      await this.pubsub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create order',
      };
    }
  }

  async getOrders(user: User, { status }: OrdersInput): Promise<OrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
            ...(status && { status }), //status 파라미터가 있다면 조회조건 추가
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }
      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && user.id !== order.customerId) {
      //유저가 손님이지만 && request유저id와 저장된 손님id가 다른경우
      canSee = false;
    }
    if (user.role === UserRole.Delivery && user.id !== order.driverId) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && user.id !== order.restaurant.ownerId) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(user: User, { id: orderId }: OrderInput): Promise<OrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, { relations: ['restaurant'] });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "You can't see that",
        };
      }
      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get order',
      };
    }
  }

  async updateOrder(user: User, { id: orderId, status }: UpdateOrderInput): Promise<UpdateOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId);
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }

      //order 찾을 수 있는지 확인
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "You can't see that",
        };
      }

      //유저별 update 대상인지 확인
      let canUpdate = true;
      if (user.role === UserRole.Client) {
        canUpdate = false;
      }
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canUpdate = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
          canUpdate = false;
        }
      }
      if (!canUpdate) {
        return {
          ok: false,
          error: "You can't update order",
        };
      }
      // order 업데이트
      await this.orders.save([
        {
          id: orderId,
          status,
        },
      ]);
      const newOrder = { ...order, status }; //update의 save는 order 전체를 받지 않는다. 따라서 조회한 값과 변경한 값을 함께 반환한다.
      //레스토랑 주인 음식 완료 시 COOKED 업데이트 --> Delivery에게 전송
      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          await this.pubsub.publish(NEW_COOKED_ORDER, {
            cookedOrders: newOrder,
          });
        }
      }
      //업데이트마다 -> 전부에게 전송
      await this.pubsub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not update order',
      };
    }
  }

  async takeOrder(driver: User, { id: orderId }: TakeOrderInput): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId); //eager relation
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }
      //이미 있다면 배정받은 것이므로 에러
      if (order.driver) {
        return {
          ok: false,
          error: 'This order already has a driver',
        };
      }
      await this.orders.save([
        {
          id: orderId,
          driver,
        },
      ]);
      await this.pubsub.publish(NEW_ORDER_UPDATE, { orderUpdates: { ...order, driver } });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not update order.',
      };
    }
  }
}
