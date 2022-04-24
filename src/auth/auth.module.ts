import { Module } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { UsersModule } from '@/users/users.module';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '@/libs/prisma.service';

@Module({
  imports: [UsersModule, HttpModule],
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
