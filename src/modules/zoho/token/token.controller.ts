import { All, Controller } from '@nestjs/common';
import { AllowUnauthorizedRequest } from '@/common/decorators';
import { ZohoTokenService } from '@modules/zoho/token/token.service';
import { OAuthTokenService } from '@modules/firebase/services/oauth-token.service';

@Controller('')
export class ZohoTokenController {
    constructor(
        private readonly tokenService: ZohoTokenService,
        private readonly oauthTokenService: OAuthTokenService,
    ) {}

    @All('update-token')
    @AllowUnauthorizedRequest()
    async updateToken() {
        const newAccessTokenBody = await this.tokenService.getNewAccessToken();
        const accessToken = newAccessTokenBody.access_token;
        await this.oauthTokenService.updateOAuthToken(accessToken);
        return { message: 'Success!' };
    }
}
