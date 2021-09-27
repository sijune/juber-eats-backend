import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';

@InputType()
export class OrderUpdatesInput extends PickType(Order, ['id']) {}
