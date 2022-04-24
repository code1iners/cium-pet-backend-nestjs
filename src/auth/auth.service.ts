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
import { JoinMethod, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
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
    let foundUser = undefined;
    try {
      foundUser = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true,
          gender: true,
          password: true,
        },
      });
    } catch (e) {
      return {
        ok: false,
        error: {
          code: '001',
          message: 'Failed find the user.',
        },
      };
    }

    if (!foundUser) {
      return {
        ok: false,
        error: {
          code: '002',
          message: 'The user does not found.',
        },
      };
    }

    // Check password verify.
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return {
        ok: false,
        error: {
          code: '003',
          message: 'Incorrect password.',
        },
      };
    }

    // Delete sensitive fields.
    delete foundUser.password;

    // Create access token.
    const accessToken = jwt.sign({ id: foundUser.id }, process.env.SECRET_KEY);

    return {
      ok: true,
      data: `Bearer ${accessToken}`,
    };
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
