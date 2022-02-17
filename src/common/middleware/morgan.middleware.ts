import * as morgan from 'morgan';
import { MORGAN_FORMAT_STRING } from '@constants';
import { LoggerService } from '@logger';

export function morganMiddleware(
    logger: LoggerService,
    formatString: string = MORGAN_FORMAT_STRING.REQUEST,
) {
    return morgan(formatString, {
        stream: {
            write: (message: string) => {
                logger.log(message);
            },
        },
    });
}
