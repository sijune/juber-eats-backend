import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { UpdateRestaurantOutput, UpdateRestaurantInput } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((returns) => CreateRestaurantOutput)
  @Role(['Owner']) //metadata에 값을 넣는다.
  async createRestaurant(
    @AuthUser() authUser: User, //restaurant 생성 시 참조하기 위해서
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(authUser, createRestaurantInput);
  }

  @Mutation((returns) => UpdateRestaurantOutput)
  @Role(['Owner']) //metadata에 값을 넣는다.
  async updateRestaurant(
    @AuthUser() owner: User, //restaurant 생성 시 참조하기 위해서
    @Args('input') updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.updateRestaurant(owner, updateRestaurantInput);
  }
}
