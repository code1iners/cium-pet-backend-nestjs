import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    const { authorization } = req.headers;
    // console.log(authorization, process.env.SECRET_KEY);

    if (!authorization) throw new UnauthorizedException('로그인이 필요합니다.');

    next();
  }
}
