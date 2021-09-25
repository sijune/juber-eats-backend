import { Field, InputType, Int, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CreateDishInput } from './create-dish.dto';
import { Dish } from '../entities/dish.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class UpdateDishInput extends PartialType(PickType(Dish, ['name', 'price', 'description', 'options'])) {
  @Field((type) => Int)
  dishId: number;
}

@ObjectType()
export class UpdateDishOutput extends CoreOutput {}
