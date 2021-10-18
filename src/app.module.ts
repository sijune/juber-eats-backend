import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //import 없이 service를 작성하면 자동으로 주입된다.
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test', //NODE_ENV를 package.json에 설정해야 한다.
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'production', 'test').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
        ACCESS_KEY_ID: Joi.string().required(),
        SECRET_ACCESS_KEY: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot({
      // installSubscriptionHandlers: true, //web socket 기능을 가지기 위해 설정, 그러나 현재 아래방법(subscriptions)으로 변경하여 사용
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams: any) => ({
            token: connectionParams['x-jwt'],
          }),
        },
      },
      autoSchemaFile: true, //스키마 파일을 메모리에서 관리
      // context: ({ req, connection }) => {
      //   const TOKEN_KEY = 'x-jwt';
      //   return { token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY] };
      // },
      context: ({ req }) => ({ token: req.headers['x-jwt'] }), //http와 ws 따로 설정한다.
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod', //모듈과 DB 동기화
      logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test', //test할 때 logging을 보고 싶지 않다.
      entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem, Payment], //자동으로 DB에 생성
    }),
    UsersModule,
    RestaurantsModule,
    AuthModule,
    CommonModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    ScheduleModule.forRoot(),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
      domain: process.env.MAILGUN_DOMAIN_NAME,
    }),
    OrdersModule,
    PaymentsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
//JwtMiddleware는 http만 처리한다. 따라서 토큰으로 유저 인증하는 부분은 JwtMiddleware에서 AuthGuard로 변경한다.
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(JwtMiddleware).forRoutes({ path: '/graphql', method: RequestMethod.ALL });
//   }
// }
