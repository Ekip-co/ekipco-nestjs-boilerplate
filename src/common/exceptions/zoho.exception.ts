import { HttpException } from '@nestjs/common';

export class ZohoException extends HttpException {
    private readonly details: any;
    private readonly moduleName: string;
    private readonly method: string;
    private readonly error: Error;

    constructor(
        message: string,
        statusCode: number,
        details: any,
        moduleName: string,
        method: string,
        error?: Error,
    ) {
        super({ error: true, message: message }, statusCode);
        this.details = details;
        this.moduleName = moduleName;
        this.method = method;
        this.error = error;
    }
}
