import { Field, ObjectType } from '@nestjs/graphql';
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field((type) => Number) //graphql
  id: number;

  @CreateDateColumn()
  @Field((type) => Date) //graphql
  createdAt: Date;

  @UpdateDateColumn()
  @Field((type) => Date) //graphql
  updatedAt: Date;
}
