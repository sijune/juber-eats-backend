import { Module, Global } from '@nestjs/common';
import { PUB_SUB } from './common.constants';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
//하나의 pubsub만 존재해야 한다.
//서버가 여러개인 경우는 Redis Pubsub를 사용해야한다.

@Global()
@Module({
  providers: [{ provide: PUB_SUB, useValue: pubsub }],
  exports: [PUB_SUB],
})
export class CommonModule {}
