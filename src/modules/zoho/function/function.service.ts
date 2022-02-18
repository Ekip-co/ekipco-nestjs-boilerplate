import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import zohoConfig from '@config/zoho.config';
import { ConfigType } from '@nestjs/config';
import { lastValueFrom, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
    EkipException,
    NoResponseReceivedZohoException,
    NotFoundException,
} from '@exceptions';
import { CrmStatusCode } from '@modules/zoho/crm-status-code.interface';
import { readFileSync } from 'fs';

@Injectable()
export class ZohoFunctionService {
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

    executeFunction(functionName: string, data?: any) {
        const observable = this.executeAxiosInstance(functionName, data);
        return lastValueFrom(observable)
            .then((result: AxiosResponse<any>) => this.resultHandling(result))
            .catch((err) => this.errorHandling(err));
    }

    private executeAxiosInstance(
        functionName: string,
        data?: any,
    ): Observable<AxiosResponse<any>> {
        const url = `/${functionName}/actions/execute`;

        // NOT: Zoho verileri FormData olarak kabul ediyor.
        const bodyFormData: FormData = new FormData();

        if (data) {
            Object.keys(data).forEach((key: string) =>
                data[key] ? bodyFormData.append(key, data[key]) : {},
            );
        }

        const formHeaders = bodyFormData.getHeaders();

        const options = {
            params: {
                auth_type: 'apikey',
                zapikey: this.zohoCfg.apiKey,
            },
            headers: {
                ...formHeaders,
            },
        };

        return this.httpService.post(url, bodyFormData, options);
    }

    private resultHandling(result: AxiosResponse<any>) {
        // Axios dan gelen bilgi "data" içerisinde, Zohodan gelen bilgi "details.output.data" içerisinde.
        // Output string olarak geliyor JSON'a çevirilmesi lazım.
        // JSON'a çevirdikten sonra data 'data' key'inin içerisinde.

        const stringResult = result.data.details.output as string;

        const parsedResult = stringResult
            ? JSON.parse(stringResult).data
            : undefined;

        if (!parsedResult) throw new NotFoundException();

        // Herhangi bir hata çıkarsa diye kontrol et.
        if (
            parsedResult.code !== 'success' &&
            parsedResult.status === 'error'
        ) {
            const crmStatusCode = this.statusCodes.find(
                (e: CrmStatusCode) => e.code === parsedResult.code,
            );
            const statusCode = crmStatusCode ? crmStatusCode.statusCode : 500;
            const message = `${parsedResult.message}, details: ${JSON.stringify(
                parsedResult.details,
            )}`;

            throw new EkipException(message, statusCode);
        }

        return parsedResult;
    }

    private errorHandling(err: any) {
        if (err.response && !(err instanceof EkipException)) {
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
            throw new NoResponseReceivedZohoException(err);
        } else {
            // Something happened in setting up the request that triggered an Error
            throw err;
        }
    }
}
