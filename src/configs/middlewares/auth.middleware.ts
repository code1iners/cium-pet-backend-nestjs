import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, _: Response, next: (error?: any) => void) {
    const isLocalEnvironment = process.env.NODE_ENV === 'local';

    // Session has logged in user data? && Is production or development environment?
    if (!req.session.loggedInUser && !isLocalEnvironment) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    next();
  }
}
