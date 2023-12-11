import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getAuth } from "firebase/auth";

@Injectable()
export class DisabledUsersMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {

    try {

      const auth = getAuth();
      const user = auth.currentUser;

      console.log(req.path)

      if (user !== null) {

        next();

      } else {

        next(new UnauthorizedException('Unauthorized'));
      }

    } catch (error) {

      next(new UnauthorizedException('Unauthorized'));
    }

  }
}
