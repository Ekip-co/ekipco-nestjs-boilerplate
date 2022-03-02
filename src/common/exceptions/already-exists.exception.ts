import { EkipException } from '@exceptions';
import { HttpStatus } from '@nestjs/common';
import { AlreadyExistsExceptionType } from '@enums';

export class AlreadyExistsException extends EkipException {
    constructor(
        type: AlreadyExistsExceptionType = AlreadyExistsExceptionType.ALREADY_EXISTS,
        error?: Error,
    ) {
        super(type, HttpStatus.BAD_REQUEST, error);
    }
}
