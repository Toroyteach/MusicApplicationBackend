import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { updateDoc, DocumentReference, doc, getDoc, DocumentSnapshot, DocumentData, collection, orderBy, QuerySnapshot, CollectionReference, query, getDocs, where, limit } from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject, listAll, uploadBytesResumable, uploadString } from "firebase/storage";
import * as admin from "firebase-admin";
import { updateProfile } from 'firebase/auth';
import { User } from 'src/modules/auth/models/user.model';
import { UserDetails } from 'src/modules/auth/models/userDetails.model';
import { createReadStream } from 'fs';
import { join } from 'path';
import { of } from 'rxjs';

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

    //Not Used
    public async getProfileImageFromId(profileImage): Promise<any> {
        const fullPath = join(process.cwd(), './users/profileImages/'+profileImage);
        return Promise.resolve(of(fullPath))
    }

    public async getUserDashboardData(id: string): Promise<any> {

        try {

            return await this.getUserDashboardDataDetails(id)

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

    public async getUserFavouriteMix(id: string): Promise<any> {
        try {

            return await this.getUserFavouritesMixes(id)

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    //Abandoned
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

    //Abandoned
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

        return { status: "succes", data: newData, success: true }
    }

    private async updateProfileImage(file): Promise<any> {

        const user = this.firebaseService.auth.currentUser;

        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, user.uid);
        
        const newData = {
            photoUrl : file['filename'],
        } as User;
        
        await updateDoc(docRefUsersDetails, {
            ...newData
        });


        return { photoUrl: file['filename'], success: true }

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

    private async getUserDashboardDataDetails(id: string): Promise<any> {

        const docRefUserBio: DocumentReference = doc(this.firebaseService.usersCollection, id);
        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersDetails', id);

        const snapshotUsersBio: DocumentSnapshot<DocumentData> = await getDoc(docRefUserBio);
        const snapshotUsersDetails: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersDetails);

        const commentsCollectionRef: CollectionReference = this.firebaseService.musicMixCommentsCollection
        const commentsQuery = query(commentsCollectionRef, where("userId", "==", id), orderBy("dateCreated"), limit(100));
        const messagesSnapshot = await getDocs(commentsQuery);
        const comments = [];
        messagesSnapshot.forEach(doc => comments.push(doc.data()));
        const commentCount = messagesSnapshot.size;

        const musicMixCollectionRef: CollectionReference = this.firebaseService.mixItemsCollection
        const musicMixQuery = query(musicMixCollectionRef, where("status", "==", 'enabled'));
        const mixesSnapshot = await getDocs(musicMixQuery);
        const musicMix = [];
        mixesSnapshot.forEach(doc => musicMix.push(doc.data()));


        // Reference to the user's favorites subcollection
        const docRefUsersFavorites: CollectionReference = collection(docRefUserBio, 'usersFavourites'); // Use CollectionReference
        const querySnapshotUsersFavorites: QuerySnapshot<DocumentData> = await getDocs(docRefUsersFavorites);
        const favoritesCount = querySnapshotUsersFavorites.size;
        const favouritesList = [];
        querySnapshotUsersFavorites.forEach(doc => favouritesList.push(doc.data()));


        const docRefUserHistory: CollectionReference = collection(docRefUserBio, 'usersHistory'); // Use CollectionReference
        const querySnapshotUsersHis: QuerySnapshot<DocumentData> = await getDocs(docRefUserHistory);
        const historyCount = querySnapshotUsersHis.size;
        const historyList = [];
        querySnapshotUsersHis.forEach(doc => historyList.push(doc.data()));
        

        const docRefUserShazam: CollectionReference = collection(docRefUserBio, 'usersShazam'); // Use CollectionReference
        const querySnapshotUsersShaz: QuerySnapshot<DocumentData> = await getDocs(docRefUserShazam);
        const shazamCount = querySnapshotUsersShaz.size;
        const shazamList = [];
        querySnapshotUsersShaz.forEach(doc => shazamList.push(doc.data()));

        const userData = {
            userBio: snapshotUsersBio.data(),
            appData: snapshotUsersDetails.data(),
            history: {
                historyCount: historyCount,
                historyData: historyList,
            },
            favourite: {
                favouriteCount: favoritesCount,
                favouriteData: favouritesList,
            },
            shazam: {
                shazamCount: shazamCount,
                shazamData: shazamList,
            },
            comment: {
                commentsCount: commentCount,
                comments: comments,
            },
            musicList: musicMix,
        }

        return { status: "success", data: userData }
    }

    private async getUserFavouritesMixes(id: string): Promise<any> {

        const docRefUserBio: DocumentReference = doc(this.firebaseService.usersCollection, id);

        // Reference to the user's favorites subcollection
        const docRefUsersFavorites: CollectionReference = collection(docRefUserBio, 'usersFavourites'); // Use CollectionReference
        const querySnapshotUsersFavorites: QuerySnapshot<DocumentData> = await getDocs(docRefUsersFavorites);
        const favoritesCount = querySnapshotUsersFavorites.size;
        const favouritesList = [];
        querySnapshotUsersFavorites.forEach(doc => favouritesList.push(doc.data()));        

        const userData = {
            favourite: {
                favouriteCount: favoritesCount,
                favouriteData: favouritesList,
            },
        }

        return { status: "success", data: userData }
    }
}
