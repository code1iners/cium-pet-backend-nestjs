import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthLoginDto } from '@/auth/dtos/auth-login.dto';
import { AuthService } from '@/auth/auth.service';
import { lastValueFrom } from 'rxjs';
import { Req, Res, Session } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Req() request: Request,
    @Res() response: Response,
    @Body() authLoginDto: AuthLoginDto,
  ) {
    try {
      const { email, password } = authLoginDto;
      const { ok, token, error } = await this.authService.login(
        email,
        password,
      );

      if (!ok) {
        request.session.destroy(() => console.info('Session destroyed!'));
        return response.status(401).json({
          ok: false,
          error: error,
        });
      }

      request.session['access_token'] = token;
      request.session.save();

      response.status(200).json({
        ok: true,
      });
    } catch (e) {
      console.error('[login]', e);
      request.session.destroy(() => console.info('Session destroyed!'));
      response.status(500).json({
        ok: false,
        error: e,
      });
    }
  }

  @Get('me')
  async me(@Req() request: Request, @Res() response: Response) {
    try {
      console.log(request.session);

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
