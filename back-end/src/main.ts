import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Middleware here
  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalGuards(new Authguar)

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
