import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { AuthLoginDto } from '@/auth/dtos/auth-login.dto';
import { AuthService } from '@/auth/auth.service';
import { Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthJoinDto } from '@/auth/dtos/auth-join.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('join')
  async join(
    @Req() request: Request,
    @Res() response: Response,
    @Body() authJoinDto: AuthJoinDto,
  ) {
    try {
      const { ok, error, data } = await this.authService.createUser(
        authJoinDto,
      );
      if (!ok) {
        throw new ConflictException(error.message);
      }

      return response.status(201).json({
        ok: true,
        data,
      });
    } catch (e) {
      throw new InternalServerErrorException(e?.message ?? e);
    }
  }

  @Post('login')
  async login(
    @Req() request: Request,
    @Res() response: Response,
    @Body() authLoginDto: AuthLoginDto,
  ) {
    const { email, password } = authLoginDto;

    const { ok, error, data } = await this.authService.login(email, password);
    if (!ok) {
      switch (error.code) {
        case '001':
          throw new InternalServerErrorException(error.message);
        case '002':
          throw new NotFoundException(error.message);
        case '003':
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }

    return response.status(200).json({
      ok: true,
      data,
    });
  }

  @Get('me')
  async me(@Req() request: Request, @Res() response: Response) {
    try {
      const token = request.session['access_token'];

      if (!token) {
        return response.status(401).json({
          ok: true,
          error: 'Access token does not exist.',
        });
      }

      // Getting me data.
      const me = await this.authService.me(token);
      if (!me) {
        request.session.destroy(() => console.info('Session destroyed!'));
        return response.status(400).json({
          ok: false,
          error: 'Failed getting me.',
        });
      }

      request.session['me'] = me;
      request.session.save();

      return response.status(200).json({
        ok: true,
        me,
      });
    } catch (e) {
      console.error('[me]', e);
      return response.status(500).json({
        ok: false,
        error: e?.message,
      });
    }
  }
}
