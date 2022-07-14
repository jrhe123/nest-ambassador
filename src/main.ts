import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // prefix all routes
  app.setGlobalPrefix('api');
  // validate class
  app.useGlobalPipes(new ValidationPipe());
  // cors
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4300',
      'http://localhost:5000',
    ],
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
