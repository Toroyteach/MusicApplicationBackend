import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class CommentsMiddleware implements NestMiddleware {

    private appSettings;

    constructor(private firebaseService: FirebaseService) {

        this.appSettings = firebaseService.getApplicationSettings()
    }

    async use(req: Request, res: Response, next: NextFunction) {


        const mixId = req.body.mixItemId

        const mixItemResults = await this.getMixItemSettings(mixId)


        // if (mixItemResults) {

        //     next();

        // } else {

        //     throw new HttpException('This Action is not Authorised.', HttpStatus.UNAUTHORIZED);
        
        // }

        next();

    }

    private async getMixItemSettings(mixId: string) {

        const mixSet = await this.firebaseService.getMixItemSettings(mixId)


        if (mixSet.data.commentsEnabled === true) {

            return true

        } else {

            return false

        }

    }
}
