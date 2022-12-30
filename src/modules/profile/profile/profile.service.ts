import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { updateDoc, DocumentReference, doc, getDoc, DocumentSnapshot, DocumentData, deleteDoc, CollectionReference, query, getDocs, where, limit } from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject, listAll, uploadBytesResumable, uploadString } from "firebase/storage";
import * as admin from "firebase-admin";
import { updateProfile } from 'firebase/auth';
import { User } from 'src/modules/auth/models/user.model';
import { UserDetails } from 'src/modules/auth/models/userDetails.model';
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class ProfileService {

    constructor(private firebaseService: FirebaseService) { }

    //gets the user profile data for the profile
    public async getUserData(): Promise<{}> {

        try {

            const user = this.firebaseService.auth.currentUser;

            const userData = await this.getData(user.uid)

            return userData;


        } catch (error: unknown) {

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }

    }

    public async updateUserData(userData: User): Promise<any> {

        try {

            return await this.updateProfileData(userData);

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }

    }

    //this method uploads if missing or updates profile images
    public async updateUserImage(file: Express.Multer.File): Promise<any> {
        try {

            return await this.updateProfileImage(file)

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    //this method updates the user settings of the application
    public async updateUserSettings(body: UserDetails): Promise<any> {
        try {

            return await this.updateUserAppSettings(body)

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async downloadAiImage(id: string): Promise<any> {
        try {

            const fileDir = './users/generatedImages/' + id + '.png'

            if (!fileDir) {
                throw new NotFoundException();
            }

            return createReadStream(join(process.cwd(), fileDir));
            //await this.downloadAiGeneratedImages(id)

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async getUserDalleImages(): Promise<any> {
        try {

            return await this.getUsersGeneratedImages()

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }


    //helper Methods
    private async getData(id: string): Promise<{}> {

        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, id);

        const snapshotUsersDetails: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersDetails);

        const userData = {
            appData: snapshotUsersDetails.data(),
        }

        return userData;
    }

    private async updateProfileData(newData: Omit<User, 'email'>): Promise<any> {

        const user = this.firebaseService.auth.currentUser;

        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, user.uid);

        await updateDoc(docRefUsersDetails, {
            ...newData
        });

        return { status: "succes", data: newData }
    }

    private async updateProfileImage(file): Promise<any> {

        const user = this.firebaseService.auth.currentUser;

        const fileDir = './users/profileImages/' + file.filename


        // SEND THE IMG URL TO FIREBASE PROFILE PHOTO

        return { message: 'TODO get 3rd party platform to store and get download url to use on your website' }

    }

    private async updateUserAppSettings(body: UserDetails): Promise<any> {

        const user = this.firebaseService.auth.currentUser;

        const docRefUserAppSettings: DocumentReference = doc(this.firebaseService.usersCollection, user.uid, 'usersDetails', user.uid);

        await updateDoc(docRefUserAppSettings, {
            ...body
        });

        return { status: "succes", data: body }
    }


    private async getUsersGeneratedImages(): Promise<any> {

        const user = this.firebaseService.auth.currentUser;

        const usersDalleCollectionRef: CollectionReference = this.firebaseService.usersGeneratedImage

        const dalleQuery = query(usersDalleCollectionRef, where("userId", "==", user.uid), limit(20));

        const usersImagesSnapshot = await getDocs(dalleQuery);

        const usersImagesList = [];

        usersImagesSnapshot.forEach(doc => usersImagesList.push(doc.data()));

        return { status: "success", data: usersImagesList }
    }

}
