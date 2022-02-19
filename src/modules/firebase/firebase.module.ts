import { Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { OAuthTokenService } from '@modules/firebase/oauth-token.service';
import { FirebaseAuthService } from '@modules/firebase/auth/auth.service';

@Module({
    providers: [FirebaseAdminService, OAuthTokenService, FirebaseAuthService],
    exports: [FirebaseAdminService, OAuthTokenService, FirebaseAuthService],
})
export class FirebaseModule {}
