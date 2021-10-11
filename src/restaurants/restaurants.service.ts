import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Like, Raw, Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { Category } from './entities/category.entity';
import { UpdateRestaurantInput, UpdateRestaurantOutput } from './dtos/update-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dtos/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { UpdateDishInput, UpdateDishOutput } from './dtos/update-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant) //entity가 와야한다.
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository, //커스터마이징하기 위해 repository 생성 후 사용
    @InjectRepository(Dish) //entity가 와야한다.
    private readonly dishes: Repository<Dish>,
  ) {}

  async createRestaurant(owner: User, createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
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
        restaurantId: newRestaurant.id,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({ owner });
      return {
        restaurants,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants',
      };
    }
  }

  async myRestaurant(owner: User, { id }: MyRestaurantInput): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        {
          owner,
          id,
        },
        { relations: ['menu', 'orders'] },
      );
      return {
        restaurant,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
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
      // 업데이트시 save 인자로 배열을 준다.
      await this.restaurants.save([
        {
          id: updateRestaurantInput.restaurantId,
          ...updateRestaurantInput,
          ...(category && { category }), //category 값이 있다면 값으로 넘겨준다.
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

  async deleteRestaurant(owner: User, { restaurantId }: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
    try {
      // 1. 변경하고자 하는 레스토랑 찾고,
      const restaurant = await this.restaurants.findOne(restaurantId);
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
          error: "You can't delete a restaurant that you don't own",
        };
      }

      // 3. delete
      await this.restaurants.delete(restaurantId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete restaurant',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }
  //Computed Field를 위해 작성
  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
    try {
      //const category = await this.categories.findOne({ slug }, { relations: ['restaurants'] }); //가져오고자 하는 조인 칼럼이름 명시, pagination 적용 X
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      //pagination 적용
      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        take: 3,
        skip: (page - 1) * 3,
        order: {
          isPromoted: 'DESC',
        },
      });
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        restaurants,
        category,
        totalPages: Math.ceil(totalResults / 3),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 3,
        take: 3,
        order: {
          isPromoted: 'DESC',
        },
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 3),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not found restaurants',
      };
    }
  }
  async findRestaurantById({ restaurantId }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, { relations: ['menu'] }); //menu 까지 가져온다.
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  async searchRestaurantByName({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Raw((name) => `${name} ILIKE '%${query}%'`), //postgre에서 SQL을 직접사용하는 방법
        },
        skip: (page - 1) * 3,
        take: 3,
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 3),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not search for restaurants',
      };
    }
  }

  async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateDishOutput> {
    try {
      //1. restaurant 조회
      const restaurant = await this.restaurants.findOne(createDishInput.restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      //2. 실제 소유주인지 확인
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't create dish",
        };
      }

      //3. input과 레스토랑 오브젝트를 값으로 넘긴다.
      await this.dishes.save(this.dishes.create({ ...createDishInput, restaurant }));
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }

  async updateDish(owner: User, updateDishInput: UpdateDishInput): Promise<UpdateDishOutput> {
    try {
      const dish = await this.dishes.findOne(updateDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      if (owner.id !== dish.restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't update dish",
        };
      }
      await this.dishes.save([{ id: updateDishInput.dishId, ...updateDishInput }]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not update dish',
      };
    }
  }
  async deleteDish(owner: User, deleteDishInput: DeleteDishInput): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(deleteDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      if (owner.id !== dish.restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete dish",
        };
      }
      await this.dishes.delete(deleteDishInput.dishId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }
}
