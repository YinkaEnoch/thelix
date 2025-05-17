import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { AppConfig } from './config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const appConfig = new AppConfig();

  const app = await NestFactory.create(AppModule);
  app.flushLogs();

  app.use(helmet());

  app.setGlobalPrefix('/api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: true,
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  });

  await app.listen(appConfig.httpPort);
}

bootstrap().catch(console.error);
