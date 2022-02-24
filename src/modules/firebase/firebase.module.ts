import { Module } from '@nestjs/common';
import { FirebaseAdminService } from './services/firebase-admin.service';
import { OAuthTokenService } from '@modules/firebase/services/oauth-token.service';
import { FirebaseAuthService } from '@modules/firebase/auth/auth.service';

@Module({
    providers: [FirebaseAdminService, OAuthTokenService, FirebaseAuthService],
    exports: [FirebaseAdminService, OAuthTokenService, FirebaseAuthService],
})
export class FirebaseModule {}
