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
  async join(@Res() response: Response, @Body() authJoinDto: AuthJoinDto) {
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

    const { ok, error, data } = await this.authService.loginUser(
      email,
      password,
    );
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

    // Update session settings.
    request.session['loggedInUser'] = data.user;
    request.session.save();

    // Remove sensitive fields.
    delete data.user;

    return response.status(200).json({
      ok: true,
      data,
    });
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res() response: Response) {
    const { id } = request.session.loggedInUser;
    const { ok, error } = await this.authService.logoutUser(id);
    if (!ok) {
      throw new InternalServerErrorException(error);
    }

    request.session.destroy(() => console.info('Session destroyed!'));

    return response.status(200).json({
      ok: true,
    });
  }

  @Get('me')
  async me(@Req() request: Request, @Res() response: Response) {
    return response.status(200).json({
      ok: true,
    });
  }
}
