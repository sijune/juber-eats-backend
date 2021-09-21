import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantInput } from './dtos/create-restaurant.dto';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { Category } from './entities/category.entity';
import { UpdateRestaurantInput, UpdateRestaurantOutput } from './dtos/update-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) //entity가 와야한다.
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository, //커스터마이징하기 위해 repository 생성 후 사용
  ) {}

  async createRestaurant(owner: User, createRestaurantInput: CreateRestaurantInput): Promise<CreateAccountOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      //1. owner는 인증된 유저 값으로 들어온다.
      newRestaurant.owner = owner;

      //2. category 이름과 slug를 가공해서 저장한다.
      const category = await this.categories.getOrCreate(createRestaurantInput.categoryName);
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async updateRestaurant(owner: User, updateRestaurantInput: UpdateRestaurantInput): Promise<UpdateRestaurantOutput> {
    try {
      // 1. 변경하고자 하는 레스토랑 찾고,
      const restaurant = await this.restaurants.findOne(updateRestaurantInput.restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      // 2. 변경하고자 하는 레스토랑이 주인인지 확인
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't update a restaurant that you don't own",
        };
      }

      // 3. update값으로 category를 변경하고자 한다면 추가처리진행
      let category: Category = null;

      if (updateRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(updateRestaurantInput.categoryName);
      }
      await this.restaurants.save([
        {
          id: updateRestaurantInput.restaurantId,
          ...updateRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not update restaurant',
      };
    }
  }
}
