import { Inject, Injectable } from '@nestjs/common';
import zohoConfig from '@config/zoho.config';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { readFileSync } from 'fs';
import { CrmStatusCode } from '@modules/zoho/core/crm-status-code.interface';
import { lastValueFrom, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { EkipException, NoResponseReceivedException } from '@exceptions';

@Injectable()
export class ZohoTokenService {
    private readonly statusCodes: CrmStatusCode[];

    constructor(
        @Inject(zohoConfig.KEY) private zohoCfg: ConfigType<typeof zohoConfig>,
        private httpService: HttpService,
    ) {
        const statusCodesPath =
            __dirname + '/../../../resources/crm-function-status-codes.json';
        const statusCodesBuffers = readFileSync(statusCodesPath, {
            encoding: 'utf8',
        });
        this.statusCodes = JSON.parse(statusCodesBuffers);
    }

    getNewAccessToken() {
        const observable = this.executeAxiosInstance();
        return lastValueFrom(observable)
            .then((result: AxiosResponse<any>) => result.data)
            .catch((err) => this.errorHandling(err));
    }

    private executeAxiosInstance(): Observable<AxiosResponse<any>> {
        const url = this.zohoCfg.tokenURL;

        const options = {
            params: {
                refresh_token: this.zohoCfg.refreshToken,
                client_id: this.zohoCfg.clientId,
                client_secret: this.zohoCfg.clientSecret,
                code: this.zohoCfg.code,
                grant_type: 'refresh_token',
            },
        };

        return this.httpService.post(url, null, options);
    }

    private errorHandling(err: any) {
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const crmStatusCode = this.statusCodes.find(
                (e: CrmStatusCode) => e.code === err.response.data.code,
            );
            const statusCode = crmStatusCode ? crmStatusCode.statusCode : 500;

            throw new EkipException(
                err.response.data.message,
                statusCode || err.response.status,
            );
        } else if (err.request) {
            // The request was made but no response was received from Zoho
            throw new NoResponseReceivedException(err);
        } else {
            // Something happened in setting up the request that triggered an Error
            throw err;
        }
    }
}
