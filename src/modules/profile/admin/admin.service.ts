import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateMixItemDto } from './dto/create-mix-item.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateMixItemDto } from './dto/update-mix-item.dto';
import { getAuth } from 'firebase/auth'
import * as admin from "firebase-admin";
import { updateDoc, DocumentReference, doc, getDocs, CollectionReference, collection, deleteDoc, setDoc, query, where, limit } from 'firebase/firestore'
import { User } from 'src/modules/auth/models/user.model';
import { UserAccount } from 'src/modules/auth/models/userAccount.model';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UserAccountStatus } from './dto/userStatus.dto';
import { MixEnabledStatus } from './dto/mixStatus.dto';
import { EnableCommentsOnMix } from './dto/updateMixComment.dto';

@Injectable()
export class AdminService {


  public adminApp: any;

  constructor(private firebaseService: FirebaseService) {

    const firebase_params = {
      projectId: "",
      clientEmail: "",
      privateKey: "",
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

    const users = await this.adminApp.auth().listUsers();

    const usersList: UserAccount[] = users.users.map((userRecord: admin.auth.UserRecord) => {
      return this.mapUserFromUserRecord(userRecord);
    });

    return usersList;

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
      admin
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

    return mixes

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

    return { status: "success" }

  }

  private async disableCommentMixItem(id: string, status: EnableCommentsOnMix): Promise<any> {

    const musicMixDocRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, id);

    await updateDoc(musicMixDocRef, {
      ...status
    });

    return { status: "succes" }

  }

}
