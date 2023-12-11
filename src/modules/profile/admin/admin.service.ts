import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateMixItemDto } from './dto/create-mix-item.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateMixItemDto } from './dto/update-mix-item.dto';
import * as admin from "firebase-admin";
import { updateDoc, DocumentReference, doc, getDocs, CollectionReference, collection, deleteDoc, setDoc, query, where, limit, increment, getDoc, DocumentSnapshot, DocumentData, } from 'firebase/firestore'
import { createUserWithEmailAndPassword, UserCredential, getAuth, updateProfile, signInWithCustomToken } from 'firebase/auth'
import { User } from 'src/modules/auth/models/user.model';
import { UserAccount } from 'src/modules/auth/models/userAccount.model';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UserAccountStatus } from './dto/userStatus.dto';
import { MixEnabledStatus } from './dto/mixStatus.dto';
import { EnableCommentsOnMix } from './dto/updateMixComment.dto';
import { UserComment } from './dto/update-user-comment.dto';
import { generate } from 'generate-password-ts';
import { UserDetails } from 'src/modules/auth/models/userDetails.model';
import RefreshToken from 'src/modules/auth/auth/entities/refresh-token.entity';
import { RefreshTokenService } from 'src/shared/refresh-token/refresh-token.service';

@Injectable()
export class AdminService {


  public adminApp: any;

  private refreshTokens: RefreshToken[] = [];

  constructor(private firebaseService: FirebaseService, private readonly refreshTokenService: RefreshTokenService) {

    const firebase_params = {
      projectId: "musicapplication-16b96",
      clientEmail: "firebase-adminsdk-unc4k@musicapplication-16b96.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDJQGabE2TkMDwd\nnKSSQUPw3mwT1L36QGmdM5tZcC6lX6fs2eenXvhgTeryIATaJJGrSb4UMh6d+Ybv\n2WJc9I/jy5/OEWsv10r7E6omk8865fJrub1JX9PN73iSN1Ij8Ho0qMfuDzzjMuVK\nhMTf6MM/7KRbpDbGeaDz8CyS/wdqZlXVAgvv9sEsIajRILG3PkP1an84tJjoCWs/\nvwOqI15xXVfObgIU/7hEGbJvT55Udpi87D/qZbWabfV14AQDGrfZrzIVUyZlYySd\ng1DyQVhRQmJY+2Cv9zoDkw2HfHeqhInRDlRKRxgamHqrq/GdUwBolVXAuCY7LEH2\n8ZiNMLi/AgMBAAECggEAAmck8nwQS9MxnI7mviJOW91j//ad0BOdzzUzCSXYQLw8\nJo1RgUOWhpvXjs2IEUy3eoqWXOpeSDeW/10imgaHg0pGnbDCjV8uM4JAGVbRdhwR\nwWyF0I722fIeh+xmLCyuYNuVC4geC35rk3CzYxMF5cj/C2MSDlucat02wwiNf500\nwjlDjKrErUspNti7lHbVhppEHvRhfc6oMvmp+1ALH+v1XgtcvtDZ3Bk/hEwHK9Bk\nePnP5CvUu+QS9hZK7OWDvkBr5xaxZRLEFDB8BA9ftBcj8ot4ZnJFj75gLtLedjOJ\nbpDNnECpz34ISNaMblUPCqSzycFr3iEvvHoTxJufiQKBgQDwhLI/Z5NH5EZe24T2\nYEFTaqiGaUuhVdi9QPWtt123CHdqAPyH2+H2SAeTzXhxIqHrqo2D/iNYPhD+tFh3\ncDeXzGu1szyPYzUNzlYdjhDgdjgM87glpXEaBoFPia8AI3+bhhQx4csbj9H9P+MM\nxz5Eo1ubb2WuO79H0k9yQiAu+QKBgQDWNKjcGGWmvDa6Ag7AWKbmlZ84XrQ7ET3t\na5xdpOaNvUb/9XHflVfFRc8tqqi7EZXEq4y+N+xageKn28hScQvPe/PF05SM8XFF\nHdZGBlTcJAwe3QdhBL4Q7y+JlMS0MSQhdZgX67+GD30dxScwxotedvSOfhL1xdQT\nR90fCQO7dwKBgQDWFHaHowxf2BqeweumVGSw9+WKxdwwfTXOtiw29Fhw2xNXAgvE\nbX3B9bjw4NlMchQHrKYLj0Asggoke6emn/aLocNZVnEX+6i0Yi0aX2I8OF2JgcEt\nmQWDsbiVcCqZB//EEWKWR7C+FpRFQwE4VXviIjker9ekbr/CELrwK1V0GQKBgGmK\nysSfVL6hsAlYaDJHu/yTLj9VElKkPTIVOpc9X8fowent4qy6ZeOycNFcbAS4NmYP\n7Knw3gj+RFJWzU4pmxshRMxtYp1LfXcDq4cXKYrKTBqM50zbTFcFsxOD9KOgLuA5\nk7X9l4GTch9P++5hdVwXGop2/hqQ3dyeJQpco7UjAoGAEpZYBIWznvTJ1+LTQnTP\nj2JvHKvItvQQVeMXl9xDhGBFmMPnx41QI7KDHV/CZAGIoeKyYxlxfrSx6KU9s3cB\nDpkbpSDlg4AEVTxZQQXCciWAHzAj0PW9EgL4vFIa3j1sSePDsP3bgsBQZ6xxsXuX\nDESa039gxyzLyQJvVhR32mk=\n-----END PRIVATE KEY-----\n"
    }

    this.adminApp = admin.initializeApp({
      credential: admin.credential.cert(firebase_params),
      databaseURL: "https://musicapplication-16b96.firebaseio.com"
    })

  }

  public async findAllUsers(): Promise<any> {
    try {

      return await this.getAllUsers();

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async disableUser(id: string, body: UserAccountStatus): Promise<any> {
    try {

      return await this.disableUserAccount(id, body.status);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async getAppData(): Promise<any> {
    try {

      const results = await this.firebaseService.getApplicationSettings()

      return results

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async updateAppSettings(updateAdminDto: UpdateAdminDto): Promise<any> {
    try {

      return await this.updateAdminAppSettings(updateAdminDto);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async getUsersDalleGenImages(id: string): Promise<any> {
    try {

      return await this.usersDalleGenImages(id);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async createMixItem(createMixItemDto: CreateMixItemDto): Promise<any> {
    try {

      return await this.createNewMixItem(createMixItemDto);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async getAllMixItems(): Promise<any> {
    try {

      return await this.listAllMixItems();

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async disableMixItem(id: string, status: MixEnabledStatus): Promise<any> {
    try {

      return await this.disableSingleMixItem(id, status);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async updateMixItem(id: string, updateMixItem: UpdateMixItemDto): Promise<any> {
    try {

      return await this.updateMixItemData(id, updateMixItem);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async deleteMixItem(id: string): Promise<any> {
    try {

      return await this.deleteMixItemData(id);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async disableCommentOnMixItem(id: string, status: EnableCommentsOnMix): Promise<any> {
    try {

      return await this.disableCommentMixItem(id, status);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async disableUserCommentItem(id: string, status: UserComment): Promise<any> {
    try {

      return await this.disableCommentItem(id, status);

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async loginSocially(body: User, values: { userAgent: string; ipAddress: string }): Promise<any> {

    try {

      const uid = body.id
      const checkUser = await this.adminApp.auth().getUser(uid)

      if (checkUser) {

        const usersCollectionRef: CollectionReference = this.firebaseService.usersCollection
        const userQuery = query(usersCollectionRef, where("id", "==", uid));
        const usersSnapshot = await getDocs(userQuery);
        const usersList = [];
        usersSnapshot.forEach(doc => usersList.push(doc.data()));


        if (usersList.length != 1) {

          const uid = body.id
          const email = body.email

          this.createUserCollection(body)

          this.createNewUserDetails(body)

          const user = {
            email: body.email,
            id: uid,
          } as User;

          return this.newRefreshAndAccessTokenSocial(user, values);
        }

        return await this.returninRefreshAndAccessTokenSocial(body, values)

      } else {

        const usersCollectionRef: CollectionReference = this.firebaseService.usersCollection
        const userQuery = query(usersCollectionRef, where("id", "==", uid));
        const usersSnapshot = await getDocs(userQuery);
        const usersList = [];
        usersSnapshot.forEach(doc => usersList.push(doc.data()));


        if (usersList.length != 1) {

          const uid = body.id

          await this.adminApp.auth().createUser({
            email: body.email,
            phoneNumber: body.phone,
            displayName: body.username,
            photoURL: body.photoUrl,
          })

          this.createUserCollection(body)

          this.createNewUserDetails(body)

          const user = {
            email: body.email,
            id: uid,
          } as User;

          return this.newRefreshAndAccessTokenSocial(user, values);
        }

        return await this.returninRefreshAndAccessTokenSocial(body, values)
      }

    } catch (error) {

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }

  }

  //Util Functions
  private getUuid(): string {
    let uuuu = Math.random().toString(32).slice(-4);
    let wwww = Math.random().toString(32).slice(-4);
    let xxxx = Math.random().toString(32).slice(-4);
    let yyyy = Math.random().toString(32).slice(-4);
    let zzzz = Math.random().toString(32).slice(-4);

    const uid: string = wwww + xxxx + yyyy + zzzz + uuuu;

    return uid
  }

  private async getAllUsers(): Promise<any> {

    const usersCollectionRef: CollectionReference = this.firebaseService.usersCollection;
    const mixesSnapshot = await getDocs(usersCollectionRef);
    const usersCollectionList = [];

    mixesSnapshot.forEach(doc => {
      const userData = doc.data();
      const { firstname, lastname, photoUrl, role } = userData;
      usersCollectionList.push({ firstname, lastname, photoUrl, role });
    });

    const users = await this.adminApp.auth().listUsers();
    const usersList: UserAccount[] = users.users.map((userRecord: admin.auth.UserRecord) => {
      const { uid, email, disabled } = userRecord;
      return { uid, email, disabled };
    });

    const userDataList = usersCollectionList.map((userData, index) => ({
      ...userData,
      ...usersList[index],
    }));

    return { status: "succes", data: userDataList }

  }

  private mapUserFromUserRecord = (userRecord: admin.auth.UserRecord): UserAccount => {
    const customClaims = (userRecord.customClaims || { admin: false }) as { admin?: boolean }
    const admin = customClaims.admin ? customClaims.admin : false;
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      creationTime: userRecord.metadata.creationTime,
      emailVerified: userRecord.emailVerified,
      admin,
      disabled: userRecord.disabled
    }
  }

  private async disableUserAccount(id: string, status: boolean): Promise<any> {

    if (status) {

      admin.auth().updateUser(id, {
        disabled: true
      });

    } else {

      admin.auth().updateUser(id, {
        disabled: false
      });

    }

    return { status: "succes" }

  }

  private async updateAdminAppSettings(updateAdminDto: UpdateAdminDto): Promise<any> {

    const docRefUserAppSettings: DocumentReference = doc(this.firebaseService.appSettingsCollection, 'uk6P9Jpic6mBylhbvVUR');

    await updateDoc(docRefUserAppSettings, {
      ...updateAdminDto
    });

    return { status: "succes", data: updateAdminDto }

  }

  private async usersDalleGenImages(id: string): Promise<any> {

    const usersDalleCollectionRef: CollectionReference = this.firebaseService.usersGeneratedImage

    const dalleQuery = query(usersDalleCollectionRef, where("userId", "==", id), limit(20));

    const usersImagesSnapshot = await getDocs(dalleQuery);

    const usersImagesList = [];

    usersImagesSnapshot.forEach(doc => usersImagesList.push(doc.data()));

    return { status: "success", data: usersImagesList }

  }

  private async createNewMixItem(createMixItemDto: CreateMixItemDto): Promise<any> {

    createMixItemDto.mixId = this.getUuid();

    const mixData: CreateMixItemDto = {
      ...createMixItemDto
    } as CreateMixItemDto;


    const docRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, createMixItemDto.mixId)

    await setDoc(docRef, mixData)

    return { status: "succes: Mix item Created", data: mixData }

  }

  private async listAllMixItems(): Promise<any> {

    const musicMixesCollection: CollectionReference = collection(this.firebaseService.firestore, 'mixItems');

    const musicMIxesSnapshot = await getDocs(musicMixesCollection);

    const mixes = []

    musicMIxesSnapshot.forEach(doc => {
      mixes.push(doc.data())
    })

    return { status: "succes", data: mixes }


  }

  private async disableSingleMixItem(id: string, status: MixEnabledStatus): Promise<any> {

    const musicMixDocRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, id);

    await updateDoc(musicMixDocRef, {
      status: status.status
    });

    return { status: "succes" }

  }

  private async updateMixItemData(id: string, updateMixItem: UpdateMixItemDto): Promise<any> {

    const musicMixDocRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, id);

    await updateDoc(musicMixDocRef, {
      ...updateMixItem
    });

    return { status: "succes", data: updateMixItem }

  }

  private async deleteMixItemData(id: string): Promise<any> {

    const musicMixDocRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, id);

    await deleteDoc(musicMixDocRef);

    return { status: "succes" }

  }

  private async disableCommentMixItem(id: string, status: EnableCommentsOnMix): Promise<any> {

    const musicMixDocRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, id);

    await updateDoc(musicMixDocRef, {
      ...status
    });

    return { status: "succes" }

  }

  private async disableCommentItem(id: string, status: UserComment): Promise<any> {

    const musicMixDocRef: DocumentReference = doc(this.firebaseService.musicMixCommentsCollection, id);

    await updateDoc(musicMixDocRef, {
      ...status
    });

    return { status: "succes" }

  }

  private async newRefreshAndAccessTokenSocial(user: User, values: { userAgent: string; ipAddress: string }): Promise<{ newToken: {}; userData: {} }> {

    try {

      const token = await this.adminApp.auth().createCustomToken(user.id)

      const userAuth = await signInWithCustomToken(this.firebaseService.auth, token)

      if (userAuth) {
        const userData = await this.getUserData(user.id)

        const newToken = this.refreshTokenService.generateToken(user, values);

        return {
          newToken,
          userData: userData,
        };
      }

    } catch (error: unknown) {
      console.log(`[ERROR]: ${error}`)
    }
  }

  private async returninRefreshAndAccessTokenSocial(user: User, values: { userAgent: string; ipAddress: string }): Promise<{ newToken: {}; userData: {} }> {

    try {


      const token = await this.adminApp.auth().createCustomToken(user.id)

      const userAuth = await signInWithCustomToken(this.firebaseService.auth, token)

      if (userAuth) {
        const userData = await this.getUserData(user.id)

        const newToken = this.refreshTokenService.generateToken(user, values);

        return {
          newToken,
          userData: userData,
        };
      }

    } catch (error: unknown) {
      console.log(`[ERROR]: ${error}`)
    }
  }

  private async createUserCollection(body: User): Promise<void> {
    const user: User = {
      ...body
    } as User;

    delete user.password;

    const id: string = body.id;

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

  private async createNewUserDetails(userCredential: any): Promise<void> {

    const id: string = userCredential.id;

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
}
