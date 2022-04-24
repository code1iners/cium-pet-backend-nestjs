import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, _: Response, next: (error?: any) => void) {
    console.log(process.env.NODE_ENV);

    if (!req.session.loggedInUser)
      throw new UnauthorizedException('로그인이 필요합니다.');

    next();
  }
}
