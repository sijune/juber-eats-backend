import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Entity, Column, OneToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@InputType({ isAbstract: true }) //dto를 위해서
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field((type) => String)
  code: string;

  @OneToOne((type) => User, { onDelete: 'CASCADE' })
  @JoinColumn() //반드시 한쪽에 정의되어야 한다. Verification으로 User를 접근한다면 해당칼럼은 Verification에 있어야 한다.
  user: User;

  //다른 곳에서 호출하기 위해 entity에 정의한다.
  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
