import { EkipException } from '@exceptions';
import { HttpStatus } from '@nestjs/common';

export class NoResponseReceivedException extends EkipException {
    constructor(error?: Error) {
        super(
            'The request was made but no response was received.',
            HttpStatus.BAD_GATEWAY,
            error,
        );
    }
}
