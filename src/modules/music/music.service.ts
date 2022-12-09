import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UserFavourite } from '../auth/models/userFavourites.model';
import { collection, CollectionReference, DocumentReference, updateDoc, doc, addDoc, query, orderBy, limit, where, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { UserHistory } from '../auth/models/userHistory.model';
import { HttpService } from '@nestjs/axios';
import { Configuration, OpenAIApi } from 'openai';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/firebase/config.models';
import { DalleRequestE } from './entity/dalleRequest.entity';

@Injectable()
export class MusicService {

    constructor(private firebaseService: FirebaseService, private readonly httpService: HttpService, private configService: ConfigService<Config>) { }

    public async getdownloadMixItem(): Promise<any> {
        //return the file location and the file to dowwnload
    }

    public async downloadClippedMixItem(): Promise<any> {
        //return the next mix clipped item of the mix to download
    }

    public async addHistoryListens(id: string, body: UserFavourite): Promise<any> {
        try {

            const userData = await this.addUserHistoryItems(id, body)

            return userData;

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async addFavouritesMixList(id: string, body: UserFavourite): Promise<any> {
        try {

            const userData = await this.addUserFavouriteItems(id, body)

            return userData;

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async deleteFavouriteMix(id: string, body: UserFavourite): Promise<any> {
        try {

            const userData = await this.removeUserFavouriteItems(id, body)

            return userData;

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async getCalmAnxietyVideo(): Promise<any> {

    }

    public async getNasaPicOfDay(): Promise<{}> {
        try {

            const nasaKey = this.configService.get<string>('nasaApiKey')

            return this.httpService.get('https://api.nasa.gov/planetary/apod?api_key=' + nasaKey);

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error Connecting to Nasa Api', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async createDalleAiImages(body: DalleRequestE): Promise<{}> {

        const auth = getAuth();

        const user = auth.currentUser;

        const configuration = new Configuration({
            apiKey: this.configService.get<string>('openAiKey')
        });

        const openai = new OpenAIApi(configuration);

        const prompt = body.text
        const imageSize = body.size === 'small' ? '256x256' : body.size === 'medium' ? '512x512' : '1024x1024';

        try {

            const response = await openai.createImage({ prompt, n: 1, size: imageSize, });

            const imageUrl = response.data.data[0].url;

            const userDalleData = {
                imageUrl,
                prompt,
                userId: user.uid,
            }

            return await this.saveUserGenImage(userDalleData)

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error Connecting to Open Api', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    //Util Methods
    private getUuid(): string {
        let wwww = Math.random().toString(32).slice(-4);
        let xxxx = Math.random().toString(32).slice(-4);
        let yyyy = Math.random().toString(32).slice(-4);
        let zzzz = Math.random().toString(32).slice(-4);

        const uid: string = wwww + xxxx + yyyy + zzzz;

        return uid
    }

    private async addUserHistoryItems(id, body: UserFavourite): Promise<any> {

        const auth = getAuth();

        const user = auth.currentUser;

        body.id = this.getUuid();

        const userHistory: UserHistory = {
            ...body
        } as UserHistory;


        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, user.uid, 'usersHistory', body.id)

        await setDoc(docRef, userHistory)

        return { status: "succes", data: userHistory }
    }

    private async addUserFavouriteItems(id, body: UserFavourite): Promise<any> {

        const auth = getAuth();

        const user = auth.currentUser;

        body.id = this.getUuid();

        const userFavourite: UserFavourite = {
            ...body
        } as UserFavourite;


        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, user.uid, 'usersFavourites', body.id)

        await setDoc(docRef, userFavourite)

        return { status: "succes", data: userFavourite }
    }

    private async removeUserFavouriteItems(id, body: UserFavourite): Promise<any> {

        const auth = getAuth();

        const user = auth.currentUser;

        const userFavouriteDocRef: DocumentReference = doc(this.firebaseService.usersCollection, user.uid, 'usersFavourites', id);

        await deleteDoc(userFavouriteDocRef);

        return { status: "delete successucces" }

    }

    private async saveUserGenImage(body): Promise<{}> {

        const userRequest: DalleRequestE = {
            text: body.prompt,
            size: body.size,
            userId: body.userId,
        } as DalleRequestE;

        await addDoc(this.firebaseService.usersGeneratedImage, userRequest)

        //TODO: save the image to storage

        return {
            success: true,
            data: body.imageUrl,
        }
    }
}
