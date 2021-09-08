import { ArgsType, Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/restaurant.entity';

//@ArgsType() // 하나씩 파라미터를 받게 하고 싶을 때 사용
@InputType() // 전체 DTO를 그대로 넘긴다
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
