import { EkipException } from '@exceptions';
import { HttpStatus } from '@nestjs/common';
import { BadRequestExceptionType } from '@constants';

export class BadRequestException extends EkipException {
    constructor(
        type: BadRequestExceptionType = BadRequestExceptionType.BAD_REQUEST,
        error?: Error,
    ) {
        super(type, HttpStatus.BAD_REQUEST, error);
    }
}
