import { Inject, Injectable } from '@nestjs/common';
import firebaseConfig from '@config/firebase.config';
import { ConfigType } from '@nestjs/config';
import { App, initializeApp, cert } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getDatabase, Database } from 'firebase-admin/database';
import { isDefined } from 'class-validator';

@Injectable()
export class FirebaseAdminService {
    private readonly app: App;
    private readonly auth: Auth;
    private readonly firestore: Firestore;
    private readonly database: Database;

    constructor(
        @Inject(firebaseConfig.KEY)
        private firebaseCfg: ConfigType<typeof firebaseConfig>,
    ) {
        if (this.isExistsConfig()) {
            this.app = initializeApp({
                credential: cert(firebaseCfg.credential),
                databaseURL: firebaseCfg.databaseURL,
            });
        } else {
            this.app = initializeApp();
        }

        getFirestore(this.app).settings({
            ignoreUndefinedProperties: true,
        });

        this.auth = getAuth(this.app);
        this.firestore = getFirestore(this.app);
        this.database = getDatabase(this.app);
    }

    private isExistsConfig(): boolean {
        return (
            isDefined(this.firebaseCfg.credential) &&
            isDefined(this.firebaseCfg.databaseURL)
        );
    }

    getAuth() {
        return this.auth;
    }

    getFirestore() {
        return this.firestore;
    }

    getDatabase() {
        return this.database;
    }
}
