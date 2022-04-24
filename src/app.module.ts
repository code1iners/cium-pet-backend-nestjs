import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from '@/configs/middlewares/auth.middleware';
import { LoggerMiddleware } from '@configs/middlewares/logger.middleware';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { UsersController } from '@/users/users.controller';
import { ProductsModule } from '@/products/products.module';

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
      .apply(AuthMiddleware)
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
