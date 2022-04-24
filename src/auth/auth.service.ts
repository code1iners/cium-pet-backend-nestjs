import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthJoinDto } from '@/auth/dtos/auth-join.dto';
import { PrismaService } from '@/libs/prisma.service';
import { JoinMethod } from '@prisma/client';
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

  async loginUser(email: string, password: string) {
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
    const accessToken = jwt.sign({ id: foundUser.id }, process.env.SECRET_KEY, {
      expiresIn: '1h',
    });

    // Create refresh token.
    const refreshToken = jwt.sign({}, process.env.SECRET_KEY, {
      expiresIn: '14d',
    });

    // Update user refresh token.
    try {
      await this.prisma.user.update({
        where: { id: foundUser.id },
        data: { refreshToken },
      });
    } catch (e) {
      return {
        ok: false,
        error: {
          code: '004',
          message: 'Failed update refresh token.',
        },
      };
    }

    return {
      ok: true,
      data: {
        user: foundUser,
        accessToken: `Bearer ${accessToken}`,
      },
    };
  }

  async logoutUser(id: number) {
    try {
      const { refreshToken } = await this.prisma.user.update({
        where: { id },
        data: { refreshToken: null },
        select: { refreshToken: true },
      });
      if (refreshToken) {
        throw new InternalServerErrorException(
          "Failed delete user's refresh token",
        );
      }

      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: {
          code: '001',
          message: e?.message ?? e,
        },
      };
    }
  }

  async me(token: string) {
    // this.prisma.user.findUnique
  }
}
