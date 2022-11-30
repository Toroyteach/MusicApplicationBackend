import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { FirebaseService } from 'src/firebase/firebase.service';
import { updateDoc, DocumentReference, doc, getDoc, DocumentSnapshot, DocumentData, deleteDoc } from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject, listAll } from "firebase/storage";
import { updateProfile } from 'firebase/auth';

import { User } from 'src/modules/auth/models/user.model';
import { UserDetails } from 'src/modules/auth/models/userDetails.model';

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

    public async updateUserData(id: string, userData: User): Promise<any> {

        try {

            return await this.updateProfileData(id, userData);

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }

    }

    //this method uploads if missing or updates profile images
    public async updateUserImage(file): Promise<any> {
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

    public async deleteUserAccountPlusData(): Promise<any> {
        try {

            return await this.deleteAccountData()

        } catch (error: unknown) {

            console.warn(`[ERROR]: ${error}`)

            throw new HttpException('Error connecting to Google', HttpStatus.SERVICE_UNAVAILABLE);

        }
    }

    public async downloadAiImage(id: string): Promise<any> {
        try {

            //TODO
            await this.downloadAiGeneratedImages(id)

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

    private async updateProfileImage(file): Promise<any> {

        const user = this.firebaseService.auth.currentUser;

        //TODO: check file extension
        //TODO: Check if file exists and delete
        this.checkIfFileExists

        const fileRef = ref(this.firebaseService.storage, 'profileImages/' + user.uid + '.png');

        const snapshot = await uploadBytes(fileRef, file);

        const photoURL = await getDownloadURL(fileRef);

        updateProfile(user, { photoURL });

        console.log({ status: 'success', pic: user.photoURL })
    }

    private async updateUserAppSettings(body: UserDetails): Promise<any> {

        const user = this.firebaseService.auth.currentUser;

        const docRefUserAppSettings: DocumentReference = doc(this.firebaseService.usersCollection, user.uid, 'usersDetails', user.uid);

        await updateDoc(docRefUserAppSettings, {
            ...body
        });
    }

    private async deleteAccountData(): Promise<any> {

        const user = this.firebaseService.auth.currentUser;

        const docRefDeatils: DocumentReference = doc(this.firebaseService.usersCollection, user.uid);

        //Delete Sub COllections
        await this.deleteCollection(this.firebaseService.firestore, this.firebaseService.usersCollection + '/' + user.uid + '/usersDetails/' + user.uid, 100)
        await this.deleteCollection(this.firebaseService.firestore, this.firebaseService.usersCollection + '/' + user.uid + '/usersFavourites/' + user.uid, 100)
        await this.deleteCollection(this.firebaseService.firestore, this.firebaseService.usersCollection + '/' + user.uid + '/usersHistory/' + user.uid, 100)
        await this.deleteCollection(this.firebaseService.firestore, this.firebaseService.usersCollection + '/' + user.uid + '/usersShazam/' + user.uid, 100)

        //Delete User Document
        await deleteDoc(docRefDeatils)
    }

    private async downloadAiGeneratedImages(file: string): Promise<any> {

        const storage = this.firebaseService.storage;

        getDownloadURL(ref(storage, 'dalleImages/' + file))
            .then((url) => {
                // This can be downloaded directly:
                const xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = (event) => {
                    const blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
            })
            .catch((error) => {
                // Handle any errors
            });

    }

    //get all users dalle images
    private async getUsersGeneratedImages(): Promise<any> {

        const user = this.firebaseService.auth.currentUser;

        const storage = getStorage();

        // Create a reference under which you want to list
        const listRef = ref(storage, 'dalleImages/' + user.uid + '/');

        const images = [];

        // Find all the prefixes and items.
        listAll(listRef)
            .then((res) => {
                res.prefixes.forEach((folderRef) => {
                    // All the prefixes under listRef.
                    // You may call listAll() recursively on them.
                });

                res.items.forEach((itemRef) => {
                    // All the items under listRef.
                    images.push(itemRef.name)
                });

                return images
            }).catch((error) => {
                // Uh-oh, an error occurred!
            });
    }

    //check if image exist in storage
    private async checkIfFileExists(filePath: string): Promise<any> {
        const storage = getStorage();
        const storageRef = ref(storage, filePath);

        getDownloadURL(storageRef)
            .then(url => {

                // delete the image and return true
                const desertRef = ref(storage, filePath);

                // Delete the file
                deleteObject(desertRef).then(() => {
                    // File deleted successfully
                }).catch((error) => {
                    // Uh-oh, an error occurred!
                });

                return Promise.resolve(true);
            })
            .catch(error => {
                if (error.code === 'storage/object-not-found') {
                    return Promise.resolve(false);
                } else {
                    return Promise.reject(error);
                }
            });
    }

    //Helper function to help delete collections
    private async deleteCollection(db, collectionPath, batchSize) {
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

}
