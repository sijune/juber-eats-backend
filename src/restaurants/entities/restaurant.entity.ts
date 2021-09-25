import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { CoreEntity } from '../../common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Dish } from './dish.entity';
import { Order } from '../../orders/entities/order.entity';

@InputType('RestaurantInputType', { isAbstract: true }) //dto 등 확장하는 경우만 사용, 이름을 지정하지 않으면 entity와 스키마 생성 시 충돌난다.
@ObjectType() //graphql을 위한 decorator
@Entity() // typeORM을 위한 decorator
export class Restaurant extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => String) //graphql
  @Column() //db
  @IsString() //dto
  coverImg: string;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  //category가 없어도 저장가능하게 엔터티 설정
  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category.restaurants, { nullable: true, onDelete: 'SET NULL' }) //db, 첫번째: 적용대상의 타입, 두번째: 첫번째 논리의 역
  category: Category;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.restaurants, { onDelete: 'CASCADE' }) //db, 첫번째: 적용대상의 타입, 두번째: 첫번째 논리의 역
  owner: User;

  // 조인된 결과값에서 id를 가져올 때 사용하기 위해 선언
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field((type) => [Order])
  @OneToMany((type) => Order, (order) => order.restaurant)
  orders: Order[];

  @Field((type) => [Dish]) //graphql
  @OneToMany((type) => Dish, (dish) => dish.restaurant) //db, 첫번째: 적용대상의 타입, 두번째: 첫번째 논리의 역
  menu: Dish[];
}
