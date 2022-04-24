import {
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '@libs/client';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: (error?: any) => void) {
    const isLocalEnvironment = process.env.NODE_ENV === 'local';
    // Is local environ
    // if (isLocalEnvironment) return next();

    // Has access token?
    const { authorization } = req.headers;
    if (!authorization || !req.session.loggedInUser) {
      throw new UnauthorizedException('Should be login to use service.');
    }

    // Check user access token verified.
    let verifiedAccessToken = undefined;
    let verifiedRefreshToken = undefined;
    const { id: loggedInUserId } = req.session.loggedInUser;
    const { refreshToken: userRefreshToken } = await prisma.user.findUnique({
      where: { id: loggedInUserId },
      select: { refreshToken: true },
    });

    const realAccessToken = authorization.split(' ')[1];
    try {
      verifiedAccessToken = jwt.verify(realAccessToken, process.env.SECRET_KEY);
    } catch (e) {
      verifiedAccessToken = null;
    }
    try {
      verifiedRefreshToken = jwt.verify(
        userRefreshToken,
        process.env.SECRET_KEY,
      );
    } catch (e) {
      verifiedRefreshToken = null;
    }

    if (verifiedAccessToken) {
      // Access token is valid?
      if (!verifiedRefreshToken) {
        // Refresh token is invalid?
        const newRefreshToken = jwt.sign({}, process.env.SECRET_KEY, {
          expiresIn: '14d',
        });
        try {
          await prisma.user.update({
            where: { id: loggedInUserId },
            data: { refreshToken: newRefreshToken },
          });
        } catch (e) {
          throw new InternalServerErrorException("Failed user's refresh token");
        }
      }
    } else {
      // Access token is invalid?
      if (verifiedRefreshToken) {
        // Refresh token is valid?
        const newAccessToken = jwt.sign(
          { id: loggedInUserId },
          process.env.SECRET_KEY,
          {
            expiresIn: '1h',
          },
        );
        res.setHeader('new-authorization', newAccessToken);
      } else {
        // Refresh token is invalid?
        throw new UnauthorizedException(`The user's access token is invalid.`);
      }
    }

    prisma.$disconnect();

    next();
  }
}
