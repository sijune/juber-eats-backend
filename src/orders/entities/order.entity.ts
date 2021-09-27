import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from 'typeorm';
import { Field, Float, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { OrderItem } from './order-item.entity';
import { IsEnum, IsNumber } from 'class-validator';

export enum OrderStatus {
  Pending = 'Pending', //Client
  Cooking = 'Cooking', //Owner
  Cooked = 'Cooked', //Owner
  PickedUp = 'PickedUp', //Delivery
  Delivered = 'Delivered', //Delivery
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true }) //dto 등 확장하는 경우만 사용, 이름을 지정하지 않으면 entity와 스키마 생성 시 충돌난다.
@ObjectType() //graphql을 위한 decorator
@Entity() // typeORM을 위한 decorator
export class Order extends CoreEntity {
  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.orders, { onDelete: 'SET NULL', nullable: true }) //customer 삭제 시 dish는 그대로 존재
  customer?: User;

  // 조인된 결과값에서 id를 가져올 때 사용하기 위해 선언
  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.rides, { onDelete: 'SET NULL', nullable: true }) //driver 삭제 시 dish는 그대로 존재
  driver?: User;

  // 조인된 결과값에서 id를 가져올 때 사용하기 위해 선언
  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field((type) => Restaurant, { nullable: true })
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.orders, { onDelete: 'SET NULL', nullable: true })
  restaurant?: Restaurant;

  @Field((type) => [OrderItem])
  @ManyToMany((type) => OrderItem)
  @JoinTable() // owning엔터티에 작성한다.
  items: OrderItem[];

  @Column({ nullable: true })
  @Field((type) => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field((type) => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
