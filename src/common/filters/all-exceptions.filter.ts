import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { LoggerService } from '@logger';
import { InjectMessage } from '@modules/message/message.decorator';
import { MessageService } from '@modules/message/message.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private logger: LoggerService,
        @InjectMessage() private messageService: MessageService,
    ) {}

    async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? this.messageService.getMessage(
                      exception.message,
                      req.language,
                  )
                : 'Internal Server Error';

        const body = {
            error: true,
            message: message,
        };

        if (httpStatus >= 500) {
            this.logger.error(
                exception,
                { Body: req.body },
                { Headers: req.headers },
            );
        } else {
            this.logger.warn(exception);
        }

        res.status(httpStatus).send(body);
    }
}
