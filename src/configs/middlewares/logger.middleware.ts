import { NestMiddleware } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: (error?: Error | any) => void): any {
    // console.log(req.url);

    next();
  }
}
