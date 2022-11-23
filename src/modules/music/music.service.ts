import { Injectable } from '@nestjs/common';

@Injectable()
export class MusicService {

    public getdownloadMixItem(): any {
        //return the file location and the file to dowwnload
    }

    public downloadClippedMixItem(): any {
        //return the next mix clipped item of the mix to download
    }

    public getShazamIdentified(): any {
        //get the sahamza request from user analyse and return a response
    }

    public getNasaPicOfDay(): {} {
        //get the nasas pic of the day and return the object that has its details
        return {}
    }

    public getCalmAnxietyVideo(): any {

    }

    public getUsersAiGenImage(): any {
        //this will get ther users typed texts then communicate with dalle to generate the images
        return {}
    }
}
