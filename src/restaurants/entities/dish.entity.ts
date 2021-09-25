import { InputType, ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { IsNumber, IsString, Length } from 'class-validator';
import { Restaurant } from './restaurant.entity';

//세부 옵션
@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field((type) => String)
  name: string;

  @Field((type) => Int, { nullable: true })
  extra?: number;
}

//기본 옵션
@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field((type) => String)
  name: string;
  @Field((type) => [DishChoice], { nullable: true })
  choices?: DishChoice[]; //옵션이 여러 개인 경우, 소시지추가: 1, 치즈추가: 2
  @Field((type) => Int, { nullable: true })
  extra?: number; //피클에 대한 가격: 1
}

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

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
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

  //테이블을 하나 조인하여 만들 수 있지만, json 형태로 저장도 가능
  @Field((type) => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
