import { Injectable } from '@nestjs/common';

import { FirebaseService } from 'src/firebase/firebase.service';
import { setDoc, DocumentReference, doc, getDoc, DocumentSnapshot, DocumentData } from 'firebase/firestore'

@Injectable()
export class ProfileService {

    constructor(private firebaseService: FirebaseService) {

    }

    public getUserData(): any {

        try {

            const userData = this.getData('O2jZhyLpFGW9E6P20QtvPsOjcTX2')

            return userData;


        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

        }

    }

    private async getData(id: string): Promise<any> {

        const docRefUser: DocumentReference = doc(this.firebaseService.usersCollection, id);
        const docRefUsersDetails: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersDetails', id);
        const docRefUsersFavourite: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersFavourites', id);
        const docRefUsersHistory: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersHistory', id);
        const docRefUsersShazam: DocumentReference = doc(this.firebaseService.usersCollection, id, 'usersShazam', id);

        const snapshotUser: DocumentSnapshot<DocumentData> = await getDoc(docRefUser);
        const snapshotUsersDetails: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersDetails);
        const snapshotUsersHistory: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersFavourite);
        const snapshotUsersFavourite: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersHistory);
        const snapshotUsersShazam: DocumentSnapshot<DocumentData> = await getDoc(docRefUsersShazam);

        const userData = {
            user: snapshotUser.data(),
            appData: snapshotUsersDetails.data(),
            historyData: snapshotUsersHistory.data(),
            favouriteData: snapshotUsersFavourite.data(),
            shazamData: snapshotUsersShazam.data(),
        }

        return userData;
    }
}
