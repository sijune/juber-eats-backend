import { InputType, ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { IsNumber, IsString, Length } from 'class-validator';
import { Restaurant } from './restaurant.entity';

@InputType('DishInputType', { isAbstract: true }) //dto 등 확장하는 경우만 사용
@ObjectType() //graphql을 위한 decorator
@Entity() // typeORM을 위한 decorator
export class Dish extends CoreEntity {
  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field((tpye) => String)
  @Column()
  @IsString()
  photo: string;

  @Field((type) => String)
  @Column()
  @Length(5, 140)
  description: string;

  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.menu, { onDelete: 'CASCADE' }) //db, 첫번째: 적용대상의 타입, 두번째: 첫번째 논리의 역
  restaurant: Restaurant;

  // 조인된 결과값에서 id를 가져올 때 사용하기 위해 선언, id만 필요한 경우가 있다.
  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;
}
