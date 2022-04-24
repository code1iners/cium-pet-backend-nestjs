import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { LOGIN_QUERY, ME_QUERY } from '@/queries/auth.queries';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  async login(email: string, password: string) {
    try {
      const query = LOGIN_QUERY;
      const variables = { email, password };

      const {
        data: {
          login: { ok, token, error },
        },
      } = await lastValueFrom(
        this.httpService
          .post(
            process.env.AUTH_HOST_URL,
            JSON.stringify({
              query,
              variables,
            }),
            { headers: { 'Content-Type': 'application/json' } },
          )
          .pipe(map((res) => res.data)),
      );

      if (!ok) throw new UnauthorizedException(error);

      return {
        ok,
        token,
      };
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
