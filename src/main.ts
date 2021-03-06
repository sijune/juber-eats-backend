import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors(); //CORS 에러 해결
  //heroku 배포를 위해 PORT 추가
  await app.listen(process.env.PORT || 4000); //프론트를 3000에서 돌릴 예정이므로 포트변경
}
bootstrap();
