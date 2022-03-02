import { NextFunction, Request, Response } from 'express';
import { LoggerService } from './logger.service';

export function appendMetaToLogger(logger: LoggerService) {
    return function (req: Request, res: Response, next: NextFunction) {
        logger.appendDefaultMeta('Client-Ip', req.clientIp);
        logger.appendDefaultMeta(
            'Request-ID',
            req.headers['request-id'] as string,
        );
        logger.appendDefaultMeta('User', req.user);
        next();
    };
}
