import { Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { OAuthTokenService } from '@modules/firebase/oauth-token.service';

@Module({
    providers: [FirebaseAdminService, OAuthTokenService],
    exports: [FirebaseAdminService, OAuthTokenService],
})
export class FirebaseModule {}
