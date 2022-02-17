import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private logger: LoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const loggerContext =
            context.getClass().name + ' -> ' + context.getHandler().name;
        this.logger.setContext(loggerContext);

        return next.handle();
    }
}
