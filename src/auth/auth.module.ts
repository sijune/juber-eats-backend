import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersModule } from '../users/users.module';

// 1. 전역에서 AuthGuard 호출
@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: APP_GUARD, //AuthGuard 전체 적용
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
