import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from '@modules/firebase/services/firebase-admin.service';
import { FirebaseException } from '@modules/firebase/firebase.exception';

@Injectable()
export class OAuthTokenService {
    constructor(private fbAdmin: FirebaseAdminService) {}

    getOAuthToken() {
        const collectionPath = this.fbAdmin.getZohoTokenCollectionPath();
        const documentPath = this.fbAdmin.getZohoTokenDocumentPath();
        const fieldName = this.fbAdmin.getZohoTokenFieldName();

        return this.fbAdmin
            .getFirestore()
            .collection(collectionPath)
            .doc(documentPath)
            .get()
            .then((result) => result.data()[fieldName])
            .catch((err) => {
                throw new FirebaseException(err);
            });
    }

    updateOAuthToken(token: string) {
        const collectionPath = this.fbAdmin.getZohoTokenCollectionPath();
        const documentPath = this.fbAdmin.getZohoTokenDocumentPath();

        return this.fbAdmin
            .getFirestore()
            .collection(collectionPath)
            .doc(documentPath)
            .set({ token }, { merge: true });
    }
}
