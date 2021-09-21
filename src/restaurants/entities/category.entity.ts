import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { CoreEntity } from '../../common/entities/core.entity';

@InputType('CategoryInputType', { isAbstract: true }) //dto 등 확장하는 경우만 사용
@ObjectType() //graphql을 위한 decorator
@Entity() // typeORM을 위한 decorator
export class Category extends CoreEntity {
  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => String, { nullable: true }) //graphql
  @Column({ nullable: true }) //db
  @IsString() //dto
  coverImg: string;

  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field((type) => [Restaurant], { nullable: true }) //graphql
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.category) //db, 첫번째: 적용대상의 타입, 두번째: 첫번째 논리의 역
  restaurants: Restaurant[];
}
