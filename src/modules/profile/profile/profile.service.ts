import { Injectable } from '@nestjs/common';

import { FirebaseService } from 'src/firebase/firebase.service';
import { updateDoc, DocumentReference, doc, getDoc, DocumentSnapshot, DocumentData } from 'firebase/firestore'

import { User } from 'src/modules/auth/models/user.model';
import console from 'console';
import { UserDetails } from 'src/modules/auth/models/userDetails.model';

@Injectable()
export class ProfileService {

    constructor(private firebaseService: FirebaseService) {

    }

    public async getUserData(): Promise<{}> {

        try {

            const user = this.firebaseService.auth.currentUser;
            const userData = await this.getData(user.uid)

            return userData;


        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

        }

    }

    public async updateUserData(id: string, userData: User): Promise<any> {

        try {

            await this.updateProfileData(id, userData);

            return 'updated successfully'

        } catch (error) {
            console.log(error)
        }

    }

    public async updateUserImage(id: string, body): Promise<any> {
        try {

            //await this.updateProfileImage(id, body)
            return 'User image updated'

        } catch (error) {

            console.log(error)

        }
    }

    public async updateUserSettings(id: string, body: UserDetails): Promise<any> {
        try {

            //await this.updateUserAppSettings(id, body)
            return 'settings updated'

        } catch (error) {

            console.log(error)

        }
    }


    //helper Methods
    private async getData(id: string): Promise<any> {

        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, id);

        const snapshotUsersDetails: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersDetails);

        const userData = {
            appData: snapshotUsersDetails.data(),
        }

        return userData;
    }

    private async updateProfileData(id: string, newData: Omit<User, 'email'>): Promise<any> {

        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, id);

        await updateDoc(docRefUsersDetails, {
            ...newData
        });
    }

    private async updateProfileImage(id: string, body): Promise<any> {

    }

    private async updateUserAppSettings(id: string, body: UserDetails): Promise<any> {

        const docRefUserAppSettings: DocumentReference = doc(this.firebaseService.usersCollection, id, 'UsersDetails', id);

        await updateDoc(docRefUserAppSettings, {
            ...body
        });
    }
}
