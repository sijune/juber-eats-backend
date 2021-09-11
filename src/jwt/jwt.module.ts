import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';

import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';

@Module({})
@Global() //import 없이 service 선언만 하면 자동으로 주입된다.
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      //의존성 주입 초기화 & 모듈 간 공유되는 값
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options, //값을 넘길 때 사용, 자동 주입된다. {privateKey: 'xxxx'}
        },
        JwtService,
      ],
      //다른 모듈에서도 사용가능하기 위해 export
      exports: [JwtService],
    };
  }
}
