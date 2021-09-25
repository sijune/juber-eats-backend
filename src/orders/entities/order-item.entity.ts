import { CoreEntity } from '../../common/entities/core.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { InputType, ObjectType, Field, Int } from '@nestjs/graphql';
import { Dish, DishOption, DishChoice } from '../../restaurants/entities/dish.entity';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field((type) => String)
  name: string;
  @Field((type) => String, { nullable: true })
  choice: string; //DishChoice -> String : 유저가 가격을 mutation하는 건 말이 안됨
}

@InputType('OrderItemInputType', { isAbstract: true }) //dto 등 확장하는 경우만 사용, 이름을 지정하지 않으면 entity와 스키마 생성 시 충돌난다.
@ObjectType() //graphql을 위한 decorator
@Entity() // typeORM을 위한 decorator
export class OrderItem extends CoreEntity {
  @Field((type) => Dish)
  @ManyToOne((type) => Dish, { nullable: true, onDelete: 'SET NULL' })
  dish: Dish;

  //가격 필요없고, 필요한 옵션사항만 전달한다.
  @Field((type) => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
