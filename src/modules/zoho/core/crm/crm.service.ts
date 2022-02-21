import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import zohoConfig from '@config/zoho.config';
import { ConfigType } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { NotFoundException } from '@exceptions';
import { isDefined } from 'class-validator';
import { OAuthTokenService } from '@modules/firebase/oauth-token.service';
import { ZohoCrmOptions } from '@modules/zoho/core/crm/interfaces/crm-options.interface';
import { File } from '@modules/zoho/core/crm/interfaces/file.interface';
import { RecordApiResponse } from '@modules/zoho/core/crm/entities/record-api-response.entity';
import { ZohoCoreService } from '../core.service';

type ZohoHttpMethod = 'POST' | 'PUT' | 'DELETE';

@Injectable()
export class ZohoCrmService extends ZohoCoreService {
    constructor(
        @Inject(zohoConfig.KEY) private zohoCfg: ConfigType<typeof zohoConfig>,
        private httpService: HttpService,
        private tokenService: OAuthTokenService,
    ) {
        super();
    }

    async create(moduleName: string, data: Record<string, any>[]) {
        return (await this.executeAPI('POST', moduleName, null, null, {
            data: data,
        })) as RecordApiResponse[];
    }

    async update(
        moduleName: string,
        recordId: string,
        data: Record<string, any>[],
    ) {
        const result: RecordApiResponse[] = await this.executeAPI(
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
        const result: RecordApiResponse[] = await this.executeAPI(
            'DELETE',
            moduleName,
            recordId,
        );
        return result[0];
    }

    async deleteMany(moduleName: string, recordIds: string[]) {
        return (await this.executeAPI(
            'DELETE',
            moduleName,
            null,
            recordIds,
        )) as RecordApiResponse[];
    }

    async selectQuery(query: string) {
        return this.executeAPI('POST', 'coql', null, null, {
            select_query: query,
        });
    }

    private async executeAPI(
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
            .then((response: AxiosResponse<any>) =>
                this.responseHandler(response, moduleName, method),
            )
            .catch((err) => this.errorHandler(err));
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

        this.bodyHandler(extraOpts, body, options);

        return this.httpService.request(options);
    }

    private bodyHandler(extraOpts: ZohoCrmOptions, body: any, options: any) {
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

    private responseHandler(
        response: AxiosResponse<any>,
        moduleName: string,
        method: string,
    ) {
        // Zoho undefined dönderiyor aranan coql bulamayınca. Undefined sıkıntılarını çözmek için.
        if (!response) {
            return { data: [] };
        }

        const info = response.data.info;
        let parsedResults = response.data.data;

        if (!parsedResults) throw new NotFoundException();

        parsedResults = parsedResults.map(
            (parsedResult: {
                code: string;
                status: string;
                message: any;
                details: any;
            }) => {
                this.resultExceptionCheck(parsedResult, moduleName, method);

                return parsedResult.details || parsedResult;
            },
        );

        return info ? { data: parsedResults, info: info } : parsedResults;
    }
}
