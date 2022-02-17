import { LoggerService } from './logger.service';
import { Inject } from '@nestjs/common';

/**
 * Hold all unique logger context
 * @name loggerContexts
 */
const loggerContexts = new Set<string>();

/**
 * format unique provider token
 * @name getLoggerToken
 */
export function getLoggerToken(context: string): string {
    return `${LoggerService.name}:${context}`;
}

/**
 * Custom decorator for easy inject LoggerService
 * @param context - prefer input your service name
 */
export function InjectLogger(context = '') {
    loggerContexts.add(context);
    return Inject(getLoggerToken(context));
}

export function getLoggerContexts() {
    return [...loggerContexts.values()];
}
