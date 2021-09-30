import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { LessThan, Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { CreatePaymentInput, CreatePaymentOutput } from './dtos/create-payment.dto';
import { User } from '../users/entities/user.entity';
import { PaymentsOutput } from './dtos/payments.dto';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPayment(owner: User, { transactionId, restaurantId }: CreatePaymentInput): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You are not allowed to create payment.',
        };
      }
      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7); //7일 프로모션
      restaurant.promotedUntil = date;
      this.restaurants.save(restaurant);
      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create payment.',
      };
    }
  }

  async getPayments(user: User): Promise<PaymentsOutput> {
    try {
      const payments = await this.payments.find({ user });
      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get payments.',
      };
    }
  }

  //   @Cron('30 * * * * *', {
  //     name: 'myJob',
  //   })
  //   checkForPayments() {
  //     console.log('checking...(cron');
  //     const job = this.schedulerRegistry.getCronJob('myJob');
  //     console.log(job);
  //   }

  //   @Interval(5000)
  //   checkMyJobI() {
  //     console.log('checking...(interval');
  //   }

  //   @Timeout(5000)
  //   checkMyJobT() {
  //     console.log('checking...(timeout');
  //   }

  /* 프로모션 종료일을 확인해서 isPromoted false로 업데이트 */
  @Interval(10000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });
    console.log(restaurants);
    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant); //restaurant에 id가 포함되어 있다.
    });
  }
}
