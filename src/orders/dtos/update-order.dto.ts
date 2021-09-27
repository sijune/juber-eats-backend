import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class UpdateOrderInput extends PickType(Order, ['id', 'status']) {}

@ObjectType()
export class UpdateOrderOutput extends CoreOutput {}
