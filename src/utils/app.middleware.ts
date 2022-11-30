import { JwtService } from '@nestjs/jwt';
import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth/auth.service';
interface UserRequest extends Request {
    user: any
}
@Injectable()
export class isAuthenticated implements NestMiddleware {
    constructor(private readonly jwt: JwtService, private readonly userService: AuthService) { }
    async use(req: UserRequest, res: Response, next: NextFunction) {
        try {

            if (
                req.headers.authorization &&
                req.headers.authorization.startsWith('Bearer')
            ) {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = await this.jwt.verify(token);
                const user = await this.userService.getOne(decoded.email)
                if (user) {
                    req.user = user
                    console.log(user)
                    next()
                } else {
                    console.log('thrown here')
                    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)

                }
            } else {
                throw new HttpException('No token found', HttpStatus.NOT_FOUND)

            }
        } catch (error: unknown) {
            console.log('thrown here far out')
            console.warn(`[ERROR]: ${error}`)
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
        }
    }
}