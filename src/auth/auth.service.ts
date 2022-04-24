import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { LOGIN_QUERY, ME_QUERY } from '@/queries/auth.queries';
import { AuthJoinDto } from '@/auth/dtos/auth-join.dto';
import { PrismaService } from '@/libs/prisma.service';
import { JoinMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async createUser({ email, username, password, method }: AuthJoinDto) {
    // Check exists.
    const isEmailExists = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (isEmailExists) {
      return {
        ok: false,
        error: {
          code: '001',
          message: 'The email already exists.',
        },
      };
    }

    const isUsernameExists = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (isUsernameExists) {
      return {
        ok: false,
        error: {
          code: '002',
          message: 'The username already exists.',
        },
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        joinMethod: method.toUpperCase() as JoinMethod,
      },
      select: {
        id: true,
      },
    });

    return {
      ok: true,
      data: createdUser,
    };
  }

  async login(email: string, password: string) {
    try {
      return null;
    } catch (e) {
      console.error('[login]', e?.message);
      return {
        ok: false,
        error: e,
      };
    }
  }

  async me(token: string) {
    try {
      const {
        data: { me },
      } = await lastValueFrom(
        this.httpService
          .post(
            process.env.AUTH_HOST_URL,
            JSON.stringify({
              query: ME_QUERY,
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: token,
              },
            },
          )
          .pipe(map((res) => res.data)),
      );
      return me;
    } catch (e) {
      console.error('[me]', e);
    }
  }
}
