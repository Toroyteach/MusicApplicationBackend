import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Config } from 'src/firebase/config.models';

import { CollectionReference, Firestore, getFirestore, collection } from 'firebase/firestore'
import { FirebaseStorage, getStorage } from 'firebase/storage';

@Injectable()
export class FirebaseService {

    public app: FirebaseApp;
    public auth: Auth
    public firestore: Firestore
    public storage: FirebaseStorage

    //Collections
    public usersCollection: CollectionReference;
    public usersMessagesCollection: CollectionReference;
    public musicMixCommentsCollection: CollectionReference;
    public appSettingsCollection: CollectionReference;
    public mixItemsCollection: CollectionReference;

    constructor(private configService: ConfigService<Config>) {
        this.app = initializeApp({
            apiKey: configService.get<string>('apiKey'),
            authDomain: configService.get<string>('authDomain'),
            projectId: configService.get<string>('projectId'),
            storageBucket: configService.get<string>('storageBucket'),
            messagingSenderId: configService.get<string>('messagingSenderId'),
            appId: configService.get<string>('appId'),
            measurementId: configService.get<string>('measurementId'),
        });

        this.auth = getAuth(this.app);

        this.firestore = getFirestore(this.app);

        this.storage = getStorage()

        this._refUsersCollection();
    }

    private _refUsersCollection() {
        this.usersCollection = collection(this.firestore, 'users')
        this.usersMessagesCollection = collection(this.firestore, 'messages')
        this.musicMixCommentsCollection = collection(this.firestore, 'comments')
        this.appSettingsCollection = collection(this.firestore, 'appSettings')
        this.mixItemsCollection = collection(this.firestore, 'mixItems')
    }

}
