import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as firebase from 'firebase-admin';
import { Config } from 'src/firebase/config.models';

@Injectable()
export class PreauthMiddleware implements NestMiddleware {

    private defaultApp: any;

    constructor(private configService: ConfigService<Config>) {

        const firebase_params = {
            projectId: configService.get<string>('adminprojectId'),
            privateKey: configService.get<string>('adminprivateKey'),
            clientEmail: configService.get<string>('adminclientEmail'),
        }


        this.defaultApp = firebase.initializeApp({
            credential: firebase.credential.cert({
                projectId: configService.get<string>('adminprojectId'),
                privateKey: configService.get<string>('adminprivateKey'),
                clientEmail: configService.get<string>('adminclientEmail'),
            })
        });
    }

    use(req: Request, res: Response, next: Function) {
        const token = req.headers.authorization;
        if (token != null && token != '') {
            this.defaultApp.auth().verifyIdToken(token.replace('Bearer ', ''))
                .then(async decodedToken => {
                    const user = {
                        email: decodedToken.email
                    }
                    req['user'] = user;
                    next();
                }).catch(error => {
                    console.error(error);
                    this.accessDenied(req.url, res);
                });
        } else {
            next();
        }
    }

    private accessDenied(url: string, res: Response) {
        res.status(403).json({
            statusCode: 403,
            timestamp: new Date().toISOString(),
            path: url,
            message: 'Access Denied'
        });
    }
}