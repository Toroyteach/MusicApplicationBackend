import { Injectable, HttpException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UserFavourite } from '../auth/models/userFavourites.model';
import { collection, CollectionReference, DocumentReference, updateDoc, doc, addDoc, query, orderBy, limit, where, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { UserHistory } from '../auth/models/userHistory.model';
import { HttpService } from '@nestjs/axios';
import { Configuration, OpenAIApi } from 'openai';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/firebase/config.models';
import { DalleRequestE } from './entity/dalleRequest.entity';
import { ShazamRequest } from './entity/shazamrequest.entity';
import { map, catchError } from 'rxjs';
import * as fs from 'fs';

@Injectable()
export class MusicService {

    constructor(private firebaseService: FirebaseService, private readonly httpService: HttpService, private configService: ConfigService<Config>) { }

    public async getdownloadMixItem(): Promise<any> {
        //return the file location and the file to dowwnload
    }

    public async downloadClippedMixItem(): Promise<any> {
        //return the next mix clipped item of the mix to download
    }

    public async addHistoryListens(body: UserFavourite): Promise<any> {
        try {

            const userData = await this.addUserHistoryItems(body)

            return userData;

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async addFavouritesMixList(body: UserFavourite): Promise<any> {
        try {

            const userData = await this.addUserFavouriteItems(body)

            return userData;

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async deleteFavouriteMix(body: UserFavourite): Promise<any> {
        try {

            const userData = await this.removeUserFavouriteItems(body)

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

            return this.httpService.get('https://api.nasa.gov/planetary/apod?api_key=' + nasaKey, {
                headers: {
                    'Accept': 'application/json'
                }
            }).pipe(
                map(response => response.data),
            );

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

    public async createShazamRequest(body: ShazamRequest): Promise<any> {

        try {

            const userData = await this.makeShazazamApiReq(body)

            return userData;

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Rapid Api', HttpStatus.SERVICE_UNAVAILABLE);

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

    private async addUserHistoryItems(body: UserFavourite): Promise<any> {

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

    private async addUserFavouriteItems(body: UserFavourite): Promise<any> {

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

    private async removeUserFavouriteItems(body: UserFavourite): Promise<any> {

        const auth = getAuth();

        const user = auth.currentUser;

        const userFavouriteDocRef: DocumentReference = doc(this.firebaseService.usersCollection, user.uid, 'usersFavourites', body.id);

        await deleteDoc(userFavouriteDocRef);

        return { status: "delete successucces" }

    }

    private async saveUserGenImage(body): Promise<{}> {

        //TODO: save the image to storage
        const imageName = this.getUuid();

        const writer = fs.createWriteStream('./' + imageName + '.png');

        const response = await this.httpService.axiosRef({
            url: body.imageUrl,
            method: 'GET',
            responseType: 'stream',
        });

        response.data.pipe(writer);

        const result = new Promise((resolve, reject) => {

            writer.on('finish', () => {
                resolve('Success')
            });

            writer.on('error', () => {
                reject('failed')
            });

        });

        result.then((value) => {

            if (value === 'Success') {

                // const file = createReadStream()
                // const imageRef = ref(this.firebaseService.storage, imageName);
                // const metatype = { contentType: 'png', name: imageName };

                // // const imageUrl = async () => {
                // //     return await getDownloadURL(imageRef);
                // // }

                // const userRequest: DalleRequestE = {
                //     text: body.prompt,
                //     size: body.size,
                //     userId: body.userId,
                //     imageName,
                // } as DalleRequestE;

                // const addDalleColl = async () => {

                //     await addDoc(this.firebaseService.usersGeneratedImage, userRequest)

                //     await uploadBytes(imageRef, file.buffer, metatype)
                //         .then((snapshot) => {
                //             return 'success'
                //         })
                //         .catch((error) => console.log(error.message));

                // }

                // addDalleColl()
                console.log('success on getting file stream')

            }

        })


        return {
            success: true,
            data: body.imageUrl,
        }

    }

    private async makeShazazamApiReq(body: ShazamRequest): Promise<any> {

        const base54Data = Buffer.from("Hello World").toString('base64')
        const url = 'https://shazam.p.rapidapi.com/songs/v2/detect'
        const data = base54Data
        const shazamKey = this.configService.get<string>('openAiKey')

        const requestConfig = {
            headers: {
                'content-type': 'text/plain',
                'X-RapidAPI-Key': shazamKey,
                'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
            },
        };

        const results = this.httpService
            .post(url, data, requestConfig)
            .pipe(
                map((res) => res.data),
                map((data) => {
                    return data;
                }),
            )
            .pipe(
                catchError(() => {
                    throw new ForbiddenException('API not available');
                }),
            );

        if (results) {

            const auth = getAuth();

            const user = auth.currentUser;

            body.id = this.getUuid();

            const userShazam: ShazamRequest = {
                ...body
            } as ShazamRequest;


            const docRef: DocumentReference = doc(this.firebaseService.usersCollection, user.uid, 'usersShazam', body.id)

            await setDoc(docRef, userShazam)
        }

    }
}
