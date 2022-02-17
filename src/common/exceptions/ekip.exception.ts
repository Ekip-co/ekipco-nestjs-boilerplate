import { HttpException } from '@nestjs/common';

export class EkipException extends HttpException {
  error?: Error;

  constructor(message: string, statusCode: number, error?: Error) {
    super({ error: true, message: message }, statusCode);
    this.error = error;
  }
}
