import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationErrorFilter
    implements ExceptionFilter<BadRequestException>
{
    catch(exception: BadRequestException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const statusCode = exception.getStatus();
        const r = exception.getResponse() as { message: ValidationError[] };

        const validationErrors = r.message;

        res.status(statusCode).json({ error: true, errors: validationErrors });
    }
}
