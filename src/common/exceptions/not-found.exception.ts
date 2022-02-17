import { EkipException } from '@exceptions';
import { HttpStatus } from '@nestjs/common';

export class NotFoundException extends EkipException {
    constructor(error?: Error) {
        super('NOT_FOUND', HttpStatus.UNAUTHORIZED, error);
    }
}
