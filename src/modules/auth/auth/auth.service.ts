import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { User } from '../models/user.model';
import { UserDetails } from '../models/userDetails.model';
import { UserHistory } from '../models/userHistory.model';
import { UserFavourite } from '../models/userFavourites.model';
import { UserShazam } from '../models/userShazam.model';
import RefreshToken from './entities/refresh-token.entity';
import { sign, verify } from 'jsonwebtoken';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    UserCredential,
    getAuth,
    signOut,
    deleteUser,
} from 'firebase/auth'

import { setDoc, DocumentReference, doc, getDoc, DocumentSnapshot, DocumentData } from 'firebase/firestore'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    private refreshTokens: RefreshToken[] = [];

    constructor(private firebaseService: FirebaseService, private jwtTokenService: JwtService) {

    }

    public async getOne(email): Promise<any> {
        const auth = getAuth();

        const user = auth.currentUser;

        const userData: User = {
            email: user.email,
        } as User;

        if (email === user.email) {

            return userData

        } else {

            return {}
        }
    }

    public async login(email: string, password: string, values: { userAgent: string; ipAddress: string }): Promise<any> {

        try {

            const userCredential: UserCredential = await signInWithEmailAndPassword(this.firebaseService.auth, email, password);

            if (userCredential) {

                const id: string = userCredential.user.uid;

                const user = {
                    email: email,
                    password: password,
                    id: id,
                } as User;

                return this.newRefreshAndAccessToken(user, values);
            }


        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

        }

    }

    public async register(body: Omit<User, 'id'>): Promise<void> {

        try {

            const userCredential: UserCredential = await createUserWithEmailAndPassword(
                this.firebaseService.auth,
                body.email,
                body.password,
            );

            if (userCredential) {

                this.createUserCollection(body, userCredential)

                this.createNewUserDetails(userCredential)

                this.createNewUserHistoryDetails(userCredential);

                this.createNewUserFavouritesDetails(userCredential);

                this.createNewUserShazamDetails(userCredential);
            }

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

        }
    }

    public async logout(refreshStr): Promise<void> {
        const refreshToken = await this.retrieveRefreshToken(refreshStr);
        /////failing here
        if (!refreshToken) {
            return;
        }


        try {

            const auth = this.firebaseService.auth;
            signOut(auth).then(() => {

                // delete refreshtoken from db
                this.refreshTokens = this.refreshTokens.filter(
                    (refreshToken) => refreshToken.id !== refreshToken.id,
                );

                return { message: 'logged out Succseffuly'}

            }).catch((error) => {

                // An error happened.
                console.log(error)
            });


        } catch (error: unknown) {
            console.log(error)
        }

    }

    public async deleteAccount(refreshStr): Promise<void>{

        const refreshToken = await this.retrieveRefreshToken(refreshStr);
        /////failing here
        if (!refreshToken) {
            return;
        }

        try {

            const auth = this.firebaseService.auth;
            const user = auth.currentUser;

            deleteUser(user).then(() => {

                // delete refreshtoken from db
                this.refreshTokens = this.refreshTokens.filter(
                    (refreshToken) => refreshToken.id !== refreshToken.id,
                );

                return { message: 'Deleted Account Succseffuly'}

            }).catch((error) => {

                // An error happened.
                console.log(error)
            });


        } catch (error: unknown) {
            console.log(error)
        }
        
    }

    
    // Helper methods
    // Support service methods to the class
    // from here onwards
    private async refresh(refreshStr: string): Promise<string | undefined> {

        const refreshToken = await this.retrieveRefreshToken(refreshStr);

        if (!refreshToken) {
            return undefined;
        }


        //replace
        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, refreshToken.userId);
        const snapshotUsersDetails: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersDetails);
        // const user = await this.firebaseService.findOne(refreshToken.userId);

        if (!snapshotUsersDetails.data()) {
            return undefined;
        }

        const accessToken = {
            userId: refreshToken.userId,
        };

        return sign(accessToken, 'topSecretAccess', { expiresIn: '1h' });
    }
    
    private async newRefreshAndAccessToken(user: User, values: { userAgent: string; ipAddress: string },): Promise<{ accessToken: string; refreshToken: string; userData: {} }> {

        const refreshObject = new RefreshToken({
            id: this.refreshTokens.length === 0 ? 0 : this.refreshTokens[this.refreshTokens.length - 1].id + 1,
            ...values,
            userId: user.id,
        });

        this.refreshTokens.push(refreshObject);

        try {

            const userData = await this.getUserData(user.id)

            return {
                refreshToken: refreshObject.sign(),
                accessToken: sign(
                    {
                        userId: user.id,
                        userEmail: user.email,
                    },
                    'topSecretAccess',
                    {
                        expiresIn: '1h',
                    },
                ),
                userData: userData,
            };

        } catch (error: unknown) {
            console.log(`[ERROR]: ${error}`)
        }
    }

    private retrieveRefreshToken(refreshStr: string): Promise<RefreshToken | undefined> {

        try {
            const decoded = verify(refreshStr, 'topSecretRefresh');

            console.log(decoded)
            if (typeof decoded === 'string') {
                return undefined;
            }
            return Promise.resolve(
                this.refreshTokens.find((token) => token.id === decoded.id),
            );
        } catch (e) {
            return undefined;
        }

    }

    private async getUserData(id: string): Promise<any> {

        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersDetails', id);
        const docRefUsersFavourite: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersFavourites', id);
        const docRefUsersHistory: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersHistory', id);
        const docRefUsersShazam: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersShazam', id);

        const snapshotUsersDetails: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersDetails);
        const snapshotUsersHistory: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersFavourite);
        const snapshotUsersFavourite: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersHistory);
        const snapshotUsersShazam: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersShazam);

        const userData = {
            appData: snapshotUsersDetails.data(),
            historyData: snapshotUsersHistory.data(),
            favouriteData: snapshotUsersFavourite.data(),
            shazamData: snapshotUsersShazam.data(),
        }

        return userData;
    }

    private async createUserCollection(body: Omit<User, 'id'>, userCredential: UserCredential): Promise<void> {
        const user: User = {
            ...body
        } as User;

        delete user.password;

        const id: string = userCredential.user.uid;

        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id)

        await setDoc(docRef, user)
    }

    private async createNewUserDetails(userCredential: UserCredential): Promise<void> {

        const id: string = userCredential.user.uid;

        const randId: string = this.getUuid();

        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersDetails', id)

        const userDetails: UserDetails = {
            activePlaylist: 'null',
            lastSong: 'null',
            recentSeekTime: 0,
            randomPlayback: false,
            replayPlayback: false,
            activeSpectrum: false,
            allowQuiz: false,
            allowWeather: false,
            allowComents: false,
            allowOnlineStatus: false,
            totalMinutesListenec: 0,
            totalPlaysCount: 0,
            appDarkMode: true,
            role: 'null',
            favouritesCount: 0,
            identifiedShazam: 0,
            userExcerpt: 'null',
        }

        await setDoc(docRef, userDetails)
    }

    private async createNewUserHistoryDetails(userCredential: UserCredential): Promise<void> {

        const id: string = userCredential.user.uid;

        const randId: string = this.getUuid();

        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersHistory', id)

        const UserHistory: UserHistory = {
            id: 'null',
            title: 'null',
            artist: 'null',
        }

        await setDoc(docRef, UserHistory)
    }

    private async createNewUserFavouritesDetails(userCredential: UserCredential): Promise<void> {

        const id: string = userCredential.user.uid;

        const randId: string = this.getUuid();

        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersFavourites', id)

        const UserFavourite: UserFavourite = {
            id: 'null',
            title: 'null',
            artist: 'null',
        }

        await setDoc(docRef, UserFavourite)
    }

    private async createNewUserShazamDetails(userCredential: UserCredential): Promise<void> {

        const id: string = userCredential.user.uid;

        const randId: string = this.getUuid();

        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersShazam', id)

        const UserShazam: UserShazam = {
            id: 'null',
            title: 'null',
            artist: 'null',
        }

        await setDoc(docRef, UserShazam)
    }

    private getUuid(): string {
        let wwww = Math.random().toString(32).slice(-4);
        let xxxx = Math.random().toString(32).slice(-4);
        let yyyy = Math.random().toString(32).slice(-4);
        let zzzz = Math.random().toString(32).slice(-4);

        const uid: string = wwww + xxxx + yyyy + zzzz;

        return uid
    }

}