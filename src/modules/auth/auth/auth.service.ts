import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { User } from '../models/user.model';
import { UserDetails } from '../models/userDetails.model';
import { UserHistory } from '../models/userHistory.model';
import { UserFavourite } from '../models/userFavourites.model';
import { UserShazam } from '../models/userShazam.model';
import RefreshToken from './entities/refresh-token.entity';
import { sign, verify } from 'jsonwebtoken';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential, getAuth, signOut, deleteUser, sendPasswordResetEmail, updateEmail, updateProfile } from 'firebase/auth'
import { setDoc, DocumentReference, doc, getDoc, DocumentSnapshot, DocumentData, deleteDoc, CollectionReference, query, getDocs, where, limit, orderBy, QuerySnapshot, collection, updateDoc, increment } from 'firebase/firestore'
import { JwtService } from '@nestjs/jwt';
import { UserAccount } from '../models/userAccount.model';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/firebase/config.models';
import { RefreshTokenService } from 'src/shared/refresh-token/refresh-token.service';
@Injectable()
export class AuthService {

    private refreshTokens: RefreshToken[] = [];

    constructor(private firebaseService: FirebaseService, private readonly refreshTokenService: RefreshTokenService, private configService: ConfigService<Config>) { }

    public async login(email: string, password: string, values: { userAgent: string; ipAddress: string }): Promise<any> {

        try {

            const userCredential: UserCredential = await signInWithEmailAndPassword(this.firebaseService.auth, email, password);

            if (userCredential) {

                const id: string = userCredential.user.uid;

                const user = {
                    email: email,
                    id: id,
                } as User;

                return this.newRefreshAndAccessToken(user, values);
            }


        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }

    }

    public async register(body: User): Promise<{}> {

        try {

            const userCredential: UserCredential = await createUserWithEmailAndPassword(
                this.firebaseService.auth,
                body.email,
                body.password,
            );

            if (userCredential) {

                this.createUserCollection(body, userCredential)

                this.createNewUserDetails(userCredential)

                // this.createNewUserHistoryDetails(userCredential);

                // this.createNewUserFavouritesDetails(userCredential);

                // this.createNewUserShazamDetails(userCredential);

                return { status: "succes", data: body }
            }

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async logout(refreshStr): Promise<object> {

        const refreshToken = await this.retrieveRefreshToken(refreshStr);

        if (!refreshToken) {
            return;
        }

        try {
            const auth = this.firebaseService.auth;

            signOut(auth).then(() => {

                this.refreshTokenService.revokeTokensForUser(refreshToken.id)

            }).catch((error) => {

                console.warn(error)
            });

            return Promise.resolve({ message: 'logged out Succseffuly', success: true });

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);
        }

    }

    public async refreshToken(refreshStr: string): Promise<any> {
        try {

            return await this.refresh(refreshStr)

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error Retreiving Refresh Token', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async deleteAccount(refreshStr): Promise<void> {

        const refreshToken = await this.retrieveRefreshToken(refreshStr);

        if (!refreshToken) {
            return;
        }

        try {

            const user = this.firebaseService.auth.currentUser;

            deleteUser(user).then(() => {

                // delete refreshtoken from db
                this.refreshTokens = this.refreshTokens.filter(
                    (refreshToken) => refreshToken.id !== refreshToken.id,
                );

                return this.deleteAccountData(user.uid)

            }).catch((error) => {

                // An error happened.
                console.log(error)
            });


        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);
        }

    }

    public async updateUserAuth(userAccount: UserAccount): Promise<any> {
        try {

            return await this.updateUserAuthData(userAccount)

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async resetPassword(email: string): Promise<any> {
        try {

            return await this.sendResetPassword(email);

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }


    // Util functions
    private async refresh(refreshStr: string): Promise<string | undefined> {

        const refreshToken = await this.retrieveRefreshToken(refreshStr);

        if (!refreshToken) {
            return undefined;
        }

        //replace
        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, refreshToken.userId);
        const snapshotUsersDetails: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersDetails);

        if (!snapshotUsersDetails.data()) {
            return undefined;
        }

        const accessToken = {
            userId: refreshToken.userId,
        };

        const accessSecret = this.configService.get<string>('ACCESS_SECRET')

        return sign(accessToken, accessSecret, { expiresIn: '2h' });
    }

    private async newRefreshAndAccessToken(user: User, values: { userAgent: string; ipAddress: string },): Promise<{ newToken: {}; userData: {} }> {

        try {

            const userData = await this.getUserData(user.id)

            const newToken = this.refreshTokenService.generateToken(user, values);

            return {
                newToken,
                userData: userData,
            };

        } catch (error: unknown) {
            console.log(`[ERROR]: ${error}`)
        }
    }

    private async retrieveRefreshToken(refreshStr: string): Promise<RefreshToken | undefined> {

        try {

            const decoded = this.refreshTokenService.retrieveRefreshToken(refreshStr);

            if (typeof decoded === 'string') {
                return undefined;
            }

            return Promise.resolve(
                decoded
            );

        } catch (e) {

            return undefined;

        }

    }

    private async getUserData(id: string): Promise<any> {

        const docRefUserBio: DocumentReference = doc(this.firebaseService.usersCollection, id);
        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersDetails', id);

        const snapshotUsersBio: DocumentSnapshot<DocumentData> = await getDoc(docRefUserBio);
        const snapshotUsersDetails: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersDetails);

        const docRefAppData: DocumentReference = doc(this.firebaseService.appSettingsCollection, 'uk6P9Jpic6mBylhbvVUR');
        const snapshotAppData: DocumentSnapshot<DocumentData> = await getDoc(docRefAppData);


        const userData = {
            firebaseUid: id,
            userBio: snapshotUsersBio.data(),
            appData: snapshotUsersDetails.data(),
            appSettings: snapshotAppData.data(),
        }

        return userData;
    }

    private async getAppData(id: string): Promise<any> {

        const docRefUserBio: DocumentReference = doc(this.firebaseService.appSettingsCollection, id);

        const snapshotUsersDetails: DocumentSnapshot<DocumentData> = await getDoc(docRefUserBio);

        const responseData = {
            appSettings: snapshotUsersDetails
        }

        return responseData;
    }

    private async getMusicData(id: string): Promise<any> {

        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersDetails', id);

        const snapshotUsersDetails: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersDetails);

        const responseData = {
            musicSettings: snapshotUsersDetails.data(),
        }

        return responseData;
    }

    private async createUserCollection(body: User, userCredential: UserCredential): Promise<void> {
        const user: User = {
            ...body
        } as User;

        delete user.password;

        const id: string = userCredential.user.uid;

        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id)
        const docRefAppData: DocumentReference = doc(this.firebaseService.appSettingsCollection, 'uk6P9Jpic6mBylhbvVUR');

        await updateDoc(docRefAppData, {
            usersCount: increment(1)
        });


        const thisUser = this.firebaseService.auth.currentUser;
        updateProfile(thisUser, { displayName: user.firstname + user.lastname }).then(() => {
            return 'success'
        }).catch((error) => {
            // An error occurred
        });

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
            allowComments: false,
            allowOnlineStatus: false,
            totalMinutesListenec: 0,
            totalPlaysCount: 0,
            appDarkMode: true,
            role: 'null',
            favouritesCount: 0,
            identifiedShazam: 0,
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

        const userFavourite: UserFavourite = {
            id: 'null',
            title: 'null',
            artist: 'null',
            mixId: 'null'
        }

        await setDoc(docRef, userFavourite)
    }

    private async createNewUserShazamDetails(userCredential: UserCredential): Promise<void> {

        const id: string = userCredential.user.uid;

        const randId: string = this.getUuid();

        const docRef: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersShazam', id)

        const UserShazam: UserShazam = {
            id: 'null',
            title: 'null',
            artist: 'null',
            mixId: 'null',
            timeSearched: 'null',
            userId: 'null',
            coverArt: 'null',
        }

        await setDoc(docRef, UserShazam)
    }

    private updateUserAuthData(userAccount: Omit<UserAccount, 'uid'>) {

        const user = this.firebaseService.auth.currentUser;

        updateEmail(user, userAccount.email).then(() => {

            return 'success'

        }).catch((error) => {
            // An error occurred
            // ...
        });

    }

    private sendResetPassword(email: string) {
        const auth = getAuth()

        sendPasswordResetEmail(auth, email)
        .then(() => {
                return 'success'
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    }

    private async deleteAccountData(uid): Promise<any> {

        //const user = this.firebaseService.auth.currentUser;

        //TODO: add delete users ( ratings, chats, comments )

        //Delete User Sub COllections
        await this.deleteCollection(this.firebaseService.firestore, this.firebaseService.usersCollection + '/' + uid + '/usersDetails/', 100)
        await this.deleteCollection(this.firebaseService.firestore, this.firebaseService.usersCollection + '/' + uid + '/usersFavourites/', 100)
        await this.deleteCollection(this.firebaseService.firestore, this.firebaseService.usersCollection + '/' + uid + '/usersHistory/', 100)
        await this.deleteCollection(this.firebaseService.firestore, this.firebaseService.usersCollection + '/' + uid + '/usersShazam/', 100)

        //Delete User Document
        const docRefDeatils: DocumentReference = doc(this.firebaseService.usersCollection, uid);
        await deleteDoc(docRefDeatils)

        return { status: "succes", data: 'User deleted successfully' }
    }

    //Helper function to help delete collections
    private async deleteCollection(db, collectionPath, batchSize): Promise<any> {

        //const collectionRef: CollectionReference = collection(db, collectionPath);

        const collectionRef = db.collection(collectionPath);

        const query = collectionRef.orderBy('__name__').limit(batchSize);

        return new Promise((resolve, reject) => {
            this.deleteQueryBatch(db, query, resolve).catch(reject);
        });
    }

    private async deleteQueryBatch(db, query, resolve) {
        const snapshot = await query.get();

        const batchSize = snapshot.size;
        if (batchSize === 0) {
            // When there are no documents left, we are done
            resolve();
            return;
        }

        // Delete documents in a batch
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
            this.deleteQueryBatch(db, query, resolve);
        });
    }

    private getUuid(): string {
        let uuuu = Math.random().toString(32).slice(-4);
        let wwww = Math.random().toString(32).slice(-4);
        let xxxx = Math.random().toString(32).slice(-4);
        let yyyy = Math.random().toString(32).slice(-4);
        let zzzz = Math.random().toString(32).slice(-4);

        const uid: string = wwww + xxxx + yyyy + zzzz + uuuu;

        return uid
    }

}
