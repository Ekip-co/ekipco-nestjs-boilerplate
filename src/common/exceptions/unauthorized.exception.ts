import { EkipException } from '@exceptions';
import { HttpStatus } from '@nestjs/common';
import { UnauthorizedExceptionType } from '@constants';

export class UnauthorizedException extends EkipException {
  constructor(
    type: UnauthorizedExceptionType = UnauthorizedExceptionType.UNAUTHORIZED_ACCESS,
    error?: Error,
  ) {
    super(type, HttpStatus.UNAUTHORIZED, error);
  }
}
