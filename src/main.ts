import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { PrismaService } from '@libs/prisma.service';
import { LoggingInterceptor } from '@configs/interceptors/logging.interceptor';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(
    session({
      name: 'CIUM_PET_BACKEND_SESSION_ID',
      secret: process.env.SECRET_KEY + '',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000 * 2, // 3600000 = 1Hours
      },
    }),
  );
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  await app.listen(3001);
}
bootstrap();
