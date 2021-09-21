import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';

// 1. 전역에서 AuthGuard 호출
@Module({
  providers: [
    {
      provide: APP_GUARD, //AuthGuard 전체 적용
      useValue: AuthGuard,
    },
  ],
})
export class AuthModule {}
