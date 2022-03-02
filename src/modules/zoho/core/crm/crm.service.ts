import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import zohoConfig from '@config/zoho.config';
import { ConfigType } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { BadRequestException, NotFoundException } from '@exceptions';
import { isDefined } from 'class-validator';
import { OAuthTokenService } from '@modules/firebase/services/oauth-token.service';
import {
    FileType,
    ZohoCrmOptions,
} from '@modules/zoho/core/crm/interfaces/crm-options.interface';
import { File } from '@modules/zoho/core/crm/interfaces/file.interface';
import { RecordApiResponse } from '@modules/zoho/core/crm/entities/record-api-response.entity';
import { ZohoCoreService } from '../core.service';
import { CoqlApiResponse } from '@modules/zoho/core/crm/entities/coql-api-response.entity';
import { BadRequestExceptionType } from '@enums';
import { FilesApiResponse } from '@modules/zoho/core/crm/entities/files-api-response.entity';

type ZohoHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

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

    // for Attachments and Profile Photos
    async upload(
        moduleName: string,
        recordId: string,
        extraOpts: ZohoCrmOptions,
    ) {
        if (!isDefined(extraOpts.fileType)) {
            throw new BadRequestException(
                BadRequestExceptionType.MISSING_FILE_TYPE,
            );
        }

        if (!isDefined(extraOpts.file)) {
            throw new BadRequestException(BadRequestExceptionType.MISSING_FILE);
        }

        const result = await this.executeAPI(
            'POST',
            moduleName,
            recordId,
            null,
            null,
            extraOpts,
        );

        switch (extraOpts.fileType) {
            case FileType.ATTACHMENT: // https://www.zoho.com/crm/developer/docs/api/v2/upload-attachment.html
                return result[0] as RecordApiResponse;
            case FileType.PHOTO: // https://www.zoho.com/crm/developer/docs/api/v2/upload-image.html
                return 'SUCCESS';
        }
    }

    // DOCS: https://www.zoho.com/crm/developer/docs/api/v2/upload-files-to-zfs.html
    async uploadToZFS(options: ZohoCrmOptions) {
        if (!isDefined(options.file)) {
            throw new BadRequestException(BadRequestExceptionType.MISSING_FILE);
        }

        const result = await this.executeAPI(
            'POST',
            'files',
            null,
            null,
            null,
            options,
        );

        return result as FilesApiResponse[];
    }

    // DOCS: https://www.zoho.com/crm/developer/docs/api/v2/get-attachments.html
    async getAttachments(moduleName: string, recordId: string) {
        return (await this.executeAPI('GET', moduleName, recordId, null, null, {
            fileType: FileType.ATTACHMENT,
        })) as RecordApiResponse[];
    }

    // DOCS: https://www.zoho.com/crm/developer/docs/api/v2/delete-attachments.html
    async deleteAttachment(
        moduleName: string,
        recordId: string,
        attachmentId: string,
    ) {
        const result: RecordApiResponse[] = await this.executeAPI(
            'DELETE',
            moduleName,
            recordId,
            null,
            null,
            {
                fileType: FileType.ATTACHMENT,
                fileId: attachmentId,
            },
        );

        return result[0];
    }

    // DOCS: https://www.zoho.com/crm/developer/docs/api/v2/delete-image.html
    async deletePhoto(moduleName: string, recordId: string) {
        await this.executeAPI('DELETE', moduleName, recordId, null, null, {
            fileType: FileType.PHOTO,
        });

        return 'SUCCESS';
    }

    async previewAttachment(
        moduleName: string,
        recordId: string,
        attachmentId: string,
    ) {
        const result = await this.executeAPI(
            'GET',
            moduleName,
            recordId,
            null,
            null,
            {
                fileType: FileType.ATTACHMENT,
                fileId: attachmentId,
                isDownload: true,
            },
        );

        return result as {
            data: any;
            contentType: string;
            contentDisposition: string;
        };
    }

    async previewPhoto(moduleName: string, recordId: string) {
        const result = await this.executeAPI(
            'GET',
            moduleName,
            recordId,
            null,
            null,
            {
                fileType: FileType.PHOTO,
                isDownload: true,
            },
        );

        return result as {
            data: any;
            contentType: string;
            contentDisposition: string;
        };
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
        return (await this.executeAPI('POST', 'coql', null, null, {
            select_query: query,
        })) as CoqlApiResponse;
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
                this.responseHandler(
                    response,
                    moduleName,
                    method,
                    extraOpts.isDownload,
                ),
            )
            .catch((err) => this.errorHandler(err, moduleName, method));
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

    // noinspection JSMethodCanBeStatic
    private bodyHandler(extraOpts: ZohoCrmOptions, body: any, options: any) {
        if (extraOpts.isDownload) {
            options['responseType'] = 'stream';
        }

        if (extraOpts.file) {
            const file: File = extraOpts.file;

            const formData = new FormData();

            formData.append(file.fieldname, file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });

            const formHeaders = formData.getHeaders();

            options['data'] = formData;
            options['headers'] = {
                ...options['headers'],
                ...formHeaders,
            };
        } else {
            options['data'] = body;
        }

        switch (extraOpts.fileType) {
            case FileType.ATTACHMENT:
                options['url'] = options['url'] + '/' + 'Attachments';
                break;
            case FileType.PHOTO:
                options['url'] = options['url'] + '/' + 'photo';
                break;
        }

        if (extraOpts.fileId) {
            options['url'] = options['url'] + '/' + extraOpts.fileId;
        }
    }

    private responseHandler(
        response: AxiosResponse<any>,
        moduleName: string,
        method: string,
        isDownload: boolean,
    ) {
        // Zoho undefined dönderiyor aranan coql bulamayınca. Undefined sıkıntılarını çözmek için.
        if (!response) {
            return { data: [] };
        }

        if (isDownload) {
            if (response.status === 204) throw new NotFoundException();

            return {
                data: response.data,
                contentType: response.headers['content-type'],
                contentDisposition: response.headers['content-disposition'],
            };
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
