import {
    EkipException,
    NoResponseReceivedException,
    ZohoException,
} from '@exceptions';
import { readFileSync } from 'fs';
import { CrmStatusCode } from './crm-status-code.interface';

export class ZohoCoreService {
    protected readonly statusCodes: CrmStatusCode[];

    constructor() {
        const statusCodesPath =
            __dirname + '/../../../resources/crm-function-status-codes.json';
        const statusCodesBuffers = readFileSync(statusCodesPath, {
            encoding: 'utf8',
        });
        this.statusCodes = JSON.parse(statusCodesBuffers);
    }

    protected resultExceptionCheck(
        parsedResult: {
            code: string;
            status: string;
            message: any;
            details: any;
        },
        moduleName: string,
        method: string,
    ) {
        if (
            parsedResult.code !== 'success' &&
            parsedResult.status === 'error'
        ) {
            const crmStatusCode = this.statusCodes.find(
                (e: CrmStatusCode) => e.code === parsedResult.code,
            );
            const statusCode = crmStatusCode ? crmStatusCode.statusCode : 500;

            throw new ZohoException(
                parsedResult.message,
                statusCode,
                parsedResult.details,
                moduleName,
                method,
            );
        }
    }

    protected errorHandler(err: any, moduleName: string, method: string) {
        if (
            err.response &&
            !(err instanceof EkipException) &&
            !(err instanceof ZohoException)
        ) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const crmStatusCode = this.statusCodes.find(
                (e: CrmStatusCode) => e.code === err.response.data.code,
            );
            const statusCode = crmStatusCode
                ? crmStatusCode.statusCode
                : err.response.status;

            throw new ZohoException(
                err.response.data.message,
                statusCode || 500,
                err.response.data.details || '',
                moduleName,
                method,
                err,
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
