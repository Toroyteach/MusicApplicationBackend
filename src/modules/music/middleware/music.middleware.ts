import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class MusicMiddleware implements NestMiddleware {

    private appSettings;

    constructor(private firebaseService: FirebaseService) {

        this.appSettings = firebaseService.getApplicationSettings()
    }

    async use(req: Request, res: Response, next: NextFunction) {

        let urlReq = req.route.path;

        let keyPhrase = ['mixDownload', 'astronomy', 'generateAiImage', 'anxietyVideo', 'generateShazamReq'];

        const settingResult = await this.getAppSettings()

        // keyPhrase.forEach(word => {

        //     if (urlReq.includes(word)) {

        //         if (settingResult[word] === true) {


        //             next();

        //         } else {

        //             throw new HttpException('This Action is not Authorised.', HttpStatus.UNAUTHORIZED);
        //         }

        //     }

        // });
        next();

    }

    private async getAppSettings() {

        const results = await this.firebaseService.getApplicationSettings()

        return results.data.appData

    }
}
