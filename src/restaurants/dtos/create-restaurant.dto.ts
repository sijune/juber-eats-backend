import { Field, InputType, ObjectType, OmitType, PickType } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, ['name', 'coverImg', 'address']) {
  @Field((type) => String)
  categoryName: string;
}
//Input Type이므로 id와 외래키 제외하여 생성

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
