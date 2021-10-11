import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { UpdateRestaurantOutput, UpdateRestaurantInput } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { SearchRestaurantOutput, SearchRestaurantInput } from './dtos/search-restaurant.dto';
import { Dish } from './entities/dish.entity';
import { CreateDishOutput, CreateDishInput } from './dtos/create-dish.dto';
import { UpdateDishOutput, UpdateDishInput } from './dtos/update-dish.dto';
import { DeleteDishOutput, DeleteDishInput } from './dtos/delete-dish.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant.dto';

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Mutation((returns) => CreateRestaurantOutput)
  @Role(['Owner']) //metadata에 값을 넣는다.
  async createRestaurant(
    @AuthUser() authUser: User, //restaurant 생성 시 참조하기 위해서
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.createRestaurant(authUser, createRestaurantInput);
  }

  @Query((returns) => MyRestaurantsOutput)
  @Role(['Owner'])
  myRestaurants(@AuthUser() owner: User): Promise<MyRestaurantsOutput> {
    return this.restaurantsService.myRestaurants(owner);
  }

  @Query((returns) => MyRestaurantOutput)
  @Role(['Owner'])
  myRestaurant(
    @AuthUser() owner: User,
    @Args('input') myRestaurantInput: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    return this.restaurantsService.myRestaurant(owner, myRestaurantInput);
  }

  @Mutation((returns) => UpdateRestaurantOutput)
  @Role(['Owner']) //metadata에 값을 넣는다.
  async updateRestaurant(
    @AuthUser() owner: User, //restaurant 생성 시 참조하기 위해서
    @Args('input') updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.updateRestaurant(owner, updateRestaurantInput);
  }

  @Mutation((returns) => DeleteRestaurantOutput)
  @Role(['Owner']) //metadata에 값을 넣는다.
  async deleteRestaurant(
    @AuthUser() owner: User, //restaurant 생성 시 참조하기 위해서
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantsService.deleteRestaurant(owner, deleteRestaurantInput);
  }

  @Query((returns) => RestaurantsOutput)
  restaurants(@Args('input') restaurantInput: RestaurantsInput): Promise<RestaurantsOutput> {
    return this.restaurantsService.allRestaurants(restaurantInput);
  }

  @Query((returns) => RestaurantOutput)
  restaurant(@Args('input') restaurantInput: RestaurantInput): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.findRestaurantById(restaurantInput);
  }

  @Query((returns) => SearchRestaurantOutput)
  searchRestaurant(@Args('input') searchRestaurantInput: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    return this.restaurantsService.searchRestaurantByName(searchRestaurantInput);
  }
}

@Resolver((of) => Category)
export class CategoriesResolver {
  //굳이 Category service를 안 만들어도 된다. 단지 2가지 기능만 추가할 것이기 때문에 RestaurantService 사용
  constructor(private readonly restaurantsService: RestaurantsService) {}

  //Entity 선언 X, 따라서 DB 저장 X, Computed Field : Request마다 요청하는 값
  @ResolveField((type) => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    //Parent 값을 넘겨주어야 계산이 가능
    return this.restaurantsService.countRestaurants(category);
  }

  @Query((type) => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantsService.allCategories();
  }

  @Query((type) => CategoryOutput)
  category(@Args('input') categoryInput: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantsService.findCategoryBySlug(categoryInput);
  }
}

@Resolver((of) => Dish)
export class DishesResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Mutation((type) => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.createDish(owner, createDishInput);
  }

  @Mutation((type) => UpdateDishOutput)
  @Role(['Owner'])
  updateDish(@AuthUser() owner: User, @Args('input') updateDishInput: UpdateDishInput): Promise<UpdateDishOutput> {
    return this.restaurantsService.updateDish(owner, updateDishInput);
  }

  @Mutation((type) => DeleteDishOutput)
  @Role(['Owner'])
  deleteDish(@AuthUser() owner: User, @Args('input') deleteDishInput: DeleteDishInput): Promise<DeleteDishOutput> {
    return this.restaurantsService.deleteDish(owner, deleteDishInput);
  }
}
