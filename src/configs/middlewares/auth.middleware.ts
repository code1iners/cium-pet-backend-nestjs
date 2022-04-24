import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, _: Response, next: (error?: any) => void) {
    const isLocalEnvironment = process.env.NODE_ENV === 'local';
    // Is local environ
    if (isLocalEnvironment) return next();

    // Has access token?
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnauthorizedException('Should be login to use service.');
    }

    // Check user access token verified.
    const [protocol, accessToken] = authorization.split(' ');
    try {
      jwt.verify(accessToken, process.env.SECRET_KEY);
    } catch (e) {
      throw new UnauthorizedException(`The user's access token is invalid.`);
    }

    next();
  }
}
