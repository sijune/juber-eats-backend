import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';

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
  ) {}

  async createOrder(customer: User, { restaurantId, items }: CreateOrderInput): Promise<CreateOrderOutput> {
    const restaurant = await this.restaurants.findOne(restaurantId);
    if (!restaurant) {
      return {
        ok: false,
        error: 'Restaurant not found',
      };
    }
    items.forEach(async (item) => {
      const dish = await this.dishes.findOne(item.dishId);
      if (!dish) {
        // 메뉴가 없다면
      }
      await this.orderItems.save(
        this.orderItems.create({
          dish,
          options: item.options,
        }),
      );
    });
    const order = this.orders.save(
      this.orders.create({
        customer,
        restaurant,
      }),
    );
  }
}
