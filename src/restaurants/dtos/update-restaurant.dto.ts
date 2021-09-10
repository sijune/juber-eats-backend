import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateRestaurantDto } from './create-restaurant.dto';

@InputType()
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {} //Restaurant로 하면 id도 옵션이 된다.

@InputType()
export class UpdateRestaurantDto {
  @Field((type) => Number)
  id: number;

  @Field((type) => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
