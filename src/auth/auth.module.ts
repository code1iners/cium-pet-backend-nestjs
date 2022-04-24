import { Module } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { UsersModule } from '@/users/users.module';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [UsersModule, HttpModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
