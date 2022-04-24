import { JwtMiddleware } from './configs/middlewares/jwt.middelware';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { LoggerMiddleware } from '@configs/middlewares/logger.middleware';
import { ProductsModule } from '@/products/products.module';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : process.env.NODE_ENV === 'development'
          ? '.env.development'
          : '.env.local',
    }),
    ProductsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });

    consumer
      .apply(JwtMiddleware)
      .exclude({
        path: 'auth/(.*)',
        method: RequestMethod.ALL,
      })
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }
}
