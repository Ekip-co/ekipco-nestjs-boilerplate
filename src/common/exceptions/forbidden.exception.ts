import { EkipException } from '@exceptions';
import { HttpStatus } from '@nestjs/common';
import { ForbiddenExceptionType } from '@constants';

export class ForbiddenException extends EkipException {
    constructor(
        type: ForbiddenExceptionType = ForbiddenExceptionType.FORBIDDEN,
        error?: Error,
    ) {
        super(type, HttpStatus.FORBIDDEN, error);
    }
}
