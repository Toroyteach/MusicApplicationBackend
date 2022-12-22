import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class MusicMiddleware implements NestMiddleware {

    private appSettings;

    constructor(private firebaseService: FirebaseService) {

        this.appSettings = firebaseService.getApplicationSettings()
    }

    use(req: Request, res: Response, next: NextFunction) {

        // let urlReq = req.route.path;
        // let result_1 = urlReq.slice(6, 18);

        // let result_2 = result_1.substring(
        //     result_1.indexOf("/") + 1,
        //     result_1.lastIndexOf("/")
        // );

        // let keyPhrase = ['mix', 'nasaPic', 'generateAiImage', 'calmAnxiety', 'generateShazamReq'];

        // let pattern = new RegExp("\\b" + result_2 + "\\b");;

        // console.log(result_2)

        // keyPhrase.forEach(word => {

        //     if (pattern.test(word)) {

        //         const settingResult = this.getAppSettings(word)

        //         console.log(settingResult)

        //         if(settingResult){

        //             next();

        //         } else {

        //             throw new HttpException('This Action is not Authorised.', HttpStatus.UNAUTHORIZED);
        //         }

        //     }

        // });

        next()

    }

    private async getAppSettings(setting: string) {
        
        const results =  await this.firebaseService.getApplicationSettings()

        return results.appData[setting]

    }
}
