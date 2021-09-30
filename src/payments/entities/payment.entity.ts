import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@InputType('PaymentInputType', { isAbstract: true }) //dto 등 확장하는 경우만 사용, 이름을 지정하지 않으면 entity와 스키마 생성 시 충돌난다.
@ObjectType() //graphql을 위한 decorator
@Entity() // typeORM을 위한 decorator
export class Payment extends CoreEntity {
  @Field((type) => String)
  @Column()
  transactionId: string;

  //user 한명이 여러 payment를 가질 수 있다.
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.payments)
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  //Restaurant 참조만 한다.
  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant)
  restaurant: Restaurant;

  @Field((type) => Int) //graphql
  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}
