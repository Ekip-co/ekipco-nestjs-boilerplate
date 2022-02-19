import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import zohoConfig from '@config/zoho.config';
import { ConfigType } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
    EkipException,
    NotFoundException,
    NoResponseReceivedZohoException,
} from '@exceptions';
import { CrmStatusCode } from '@modules/zoho/core/crm-status-code.interface';
import { readFileSync } from 'fs';
import { isDefined } from 'class-validator';
import { OAuthTokenService } from '@modules/firebase/oauth-token.service';
import { ZohoCrmOptions } from '@modules/zoho/core/crm/interfaces/crm-options.interface';
import { File } from '@modules/zoho/core/crm/interfaces/file.interface';

type ZohoHttpMethod = 'POST' | 'PUT' | 'DELETE';

@Injectable()
export class ZohoCrmService {
    private readonly statusCodes: CrmStatusCode[];

    constructor(
        @Inject(zohoConfig.KEY) private zohoCfg: ConfigType<typeof zohoConfig>,
        private httpService: HttpService,
        private tokenService: OAuthTokenService,
    ) {
        const statusCodesPath =
            __dirname + '/../../../resources/crm-function-status-codes.json';
        const statusCodesBuffers = readFileSync(statusCodesPath, {
            encoding: 'utf8',
        });
        this.statusCodes = JSON.parse(statusCodesBuffers);
    }

    async create(moduleName: string, data: Record<string, any>[]) {
        return this.executeQuery('POST', moduleName, null, null, {
            data: data,
        });
    }

    async update(
        moduleName: string,
        recordId: string,
        data: Record<string, any>[],
    ) {
        const result = await this.executeQuery(
            'PUT',
            moduleName,
            recordId,
            null,
            {
                data: data,
            },
        );

        return result[0];
    }

    async deleteOne(moduleName: string, recordId: string) {
        const result = await this.executeQuery('DELETE', moduleName, recordId);
        return result[0];
    }

    async deleteMany(moduleName: string, recordIds: string[]) {
        return this.executeQuery('DELETE', moduleName, null, recordIds);
    }

    async selectQuery(query: string) {
        return this.executeQuery('POST', 'coql', null, null, {
            select_query: query,
        });
    }

    private async executeQuery(
        method: ZohoHttpMethod,
        moduleName: string,
        recordId?: string,
        recordIds?: string[],
        body: any = {},
        extraOpts: ZohoCrmOptions = {},
    ) {
        const observable = await this.executeAxiosInstance(
            method,
            moduleName,
            recordId,
            recordIds,
            body,
            extraOpts,
        );

        return lastValueFrom(observable)
            .then((result: AxiosResponse<any>) => this.resultHandling(result))
            .catch((err) => this.errorHandling(err));
    }

    private async executeAxiosInstance(
        method: ZohoHttpMethod,
        moduleName: string,
        recordId?: string,
        recordIds?: string[],
        body: any = {},
        extraOpts: ZohoCrmOptions = {},
    ) {
        const url = `/${moduleName}`;

        let token;

        if (!extraOpts.isNotRequiredToken) {
            token = await this.tokenService.getOAuthToken();
        }

        const options = {
            method: method,
            url: url,
            headers: {},
        };

        if (isDefined(recordId)) {
            options['url'] = url + '/' + recordId;
        }

        if (isDefined(recordIds)) {
            options['params'] = {
                ids: recordIds.join(','),
            };
        }

        if (token) {
            options['headers']['Authorization'] = `Zoho-oauthtoken ${token}`;
        }

        this.bodyHandling(extraOpts, body, options);

        return this.httpService.request(options);
    }

    private bodyHandling(extraOpts: ZohoCrmOptions, body: any, options: any) {
        if (extraOpts.fileUpload && extraOpts.fileUpload.length > 0) {
            const formDataObject: any = {
                ...body,
            };

            extraOpts.fileUpload.forEach((file: File) => {
                if (!(file.fieldName in formDataObject)) {
                    formDataObject[file.fieldName] = [];
                }

                formDataObject[file.fieldName].push({
                    value: file.buffer,
                    options: {
                        filename: file.originalName,
                        contentType: file.mimeType,
                    },
                });
            });

            const formData = new FormData();
            for (const formDataKey in formDataObject) {
                formData.append(formDataKey, formDataObject[formDataKey]);
            }

            options['data'] = formData;
        } else {
            options['data'] = body;
        }
    }

    private resultHandling(result: AxiosResponse<any>) {
        // Zoho undefined dönderiyor aranan coql bulamayınca. Undefined sıkıntılarını çözmek için.
        if (!result) {
            return { data: [] };
        }

        const info = result.data.info;
        let parsedResults = result.data.data;

        if (!parsedResults) throw new NotFoundException();

        parsedResults = parsedResults.map(
            (parsedResult: {
                code: string;
                status: string;
                message: any;
                details: any;
            }) => {
                if (
                    parsedResult.code !== 'success' &&
                    parsedResult.status === 'error'
                ) {
                    const crmStatusCode = this.statusCodes.find(
                        (e: CrmStatusCode) => e.code === parsedResult.code,
                    );
                    const statusCode = crmStatusCode
                        ? crmStatusCode.statusCode
                        : 500;
                    const message = `${
                        parsedResult.message
                    }, details: ${JSON.stringify(parsedResult.details)}`;
                    throw new EkipException(message, statusCode);
                }

                return parsedResult.details || parsedResult;
            },
        );

        return info ? { data: parsedResults, info: info } : parsedResults;
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
