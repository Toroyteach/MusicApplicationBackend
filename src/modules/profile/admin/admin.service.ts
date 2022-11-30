import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateMixItemDto } from './dto/create-mix-item.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateMixItemDto } from './dto/update-mix-item.dto';
import { getAuth } from 'firebase/auth'
import * as admin from "firebase-admin";
import { updateDoc, DocumentReference, doc, addDoc, getDocs, CollectionReference, collection, DocumentData, deleteDoc } from 'firebase/firestore'
import { User } from 'src/modules/auth/models/user.model';
import { UserAccount } from 'src/modules/auth/models/userAccount.model';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class AdminService {

  constructor(private firebaseService: FirebaseService) { }

  public async findAllUsers(): Promise<any> {
    try {

      return await this.getAllUsers();

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  public async disableUser(id: string): Promise<any> {
    try {

      return await this.disableUserAccount(id);

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

  public async getUsersDalleGenImages(): Promise<any> {
    try {

      return await this.usersDalleGenImages();

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

  public async disableMixItem(id: string, status: string): Promise<any> {
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


  //Util Functions

  private async getAllUsers(): Promise<any> {

    const users = await admin.auth().listUsers();

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

  private async disableUserAccount(id: string): Promise<any> {

    admin.auth().updateUser(id, {
      disabled: true
    });

  }

  private async updateAdminAppSettings(updateAdminDto: UpdateAdminDto): Promise<any> {

    const docRefUserAppSettings: DocumentReference = doc(this.firebaseService.appSettingsCollection, 'uk6P9Jpic6mBylhbvVUR');

    await updateDoc(docRefUserAppSettings, {
      ...updateAdminDto
    });

  }

  private async usersDalleGenImages(): Promise<any> {

  }

  private async createNewMixItem(createMixItemDto: CreateMixItemDto): Promise<any> {

    await addDoc(this.firebaseService.mixItemsCollection, createMixItemDto)

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

  private async disableSingleMixItem(id: string, status: string): Promise<any> {

    const musicMixDocRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, id);

    await updateDoc(musicMixDocRef, {
      status
    });

  }

  private async updateMixItemData(id: string, updateMixItem: UpdateMixItemDto): Promise<any> {

    const musicMixDocRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, id);

    await updateDoc(musicMixDocRef, {
      updateMixItem
    });

  }

  private async deleteMixItemData(id: string): Promise<any> {

    const musicMixDocRef: DocumentReference = doc(this.firebaseService.mixItemsCollection, id);

    await deleteDoc(musicMixDocRef);

  }

}
