import {
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '@libs/client';
import useJwt from '@/libs/useJwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: (error?: any) => void) {
    const { createAccessToken, createRefreshToken, verifyToken } = useJwt();
    // Is local environ
    const isLocalEnvironment = process.env.NODE_ENV === 'local';
    // if (isLocalEnvironment) return next();

    /*** Access & Refresh token start ***/

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
    verifiedAccessToken = verifyToken(realAccessToken);
    verifiedRefreshToken = verifyToken(userRefreshToken);

    if (verifiedAccessToken) {
      // Access token is valid?
      if (!verifiedRefreshToken) {
        // Refresh token is invalid?
        try {
          // Update refresh token by new one.
          await prisma.user.update({
            where: { id: loggedInUserId },
            data: { refreshToken: createRefreshToken() },
          });
        } catch (e) {
          throw new InternalServerErrorException("Failed user's refresh token");
        }
      }
    } else {
      // Access token is invalid?
      if (verifiedRefreshToken) {
        // Refresh token is valid?
        res.setHeader(
          'new-authorization',
          createAccessToken({ id: loggedInUserId }),
        );
      } else {
        // Refresh token is invalid?
        throw new UnauthorizedException(`The user's access token is invalid.`);
      }
    }

    /*** Access & Refresh token end ***/

    next();
  }
}
