import { EkipException } from '@exceptions';
import { HttpStatus } from '@nestjs/common';

export class NoResponseReceivedZohoException extends EkipException {
    constructor(error?: Error) {
        super(
            'The request was made but no response was received from Zoho',
            HttpStatus.BAD_GATEWAY,
            error,
        );
    }
}
