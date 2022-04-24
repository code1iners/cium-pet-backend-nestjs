import { NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: (error?: Error | any) => void): any {
    console.log(req.url);
    const { authorization } = req.headers;
    console.log(authorization);
    if (!authorization) throw new UnauthorizedException('로그인이 필요합니다.');

    next();
  }
}
