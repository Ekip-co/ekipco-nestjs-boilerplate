import { EkipException } from '@exceptions';
import { FirebaseError } from 'firebase-admin';

export class FirebaseException extends EkipException {
    constructor(error: FirebaseError) {
        let statusCode = 500;

        if (
            error.code === 'auth/claims-too-large' ||
            error.code === 'auth/reserved-claims' ||
            error.code === 'auth/operation-not-allowed' ||
            error.code.includes('invalid') ||
            error.code.includes('already-exists') ||
            error.code.includes('missing')
        ) {
            statusCode = 400;
        } else if (
            error.code.includes('expired') ||
            error.code.includes('revoked')
        ) {
            statusCode = 401;
        } else if (
            error.code === 'auth/insufficient-permission' ||
            error.code.includes('unauthorized')
        ) {
            statusCode = 403;
        } else if (error.code.includes('not-found')) {
            statusCode = 404;
        } else if (error.code.includes('internal-error')) {
            statusCode = 502;
        }

        super(error.message, statusCode);
    }
}
