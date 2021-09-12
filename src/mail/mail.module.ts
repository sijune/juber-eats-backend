import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import { MailService } from './mail.service';

@Module({})
@Global()
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      //의존성 주입 초기화 & 모듈 간 공유되는 값
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options, //값을 넘길 때 사용, 자동 주입된다. {privateKey: 'xxxx'}
        },
        MailService,
      ],
      //다른 모듈에서도 사용가능하기 위해 export
      exports: [MailService],
    };
  }
}
