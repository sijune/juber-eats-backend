import { Field, InputType, ObjectType, OmitType, PartialType, PickType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CreateRestaurantInput } from './create-restaurant.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field((type) => Number)
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
