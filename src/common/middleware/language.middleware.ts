import { NextFunction, Request, Response } from 'express';

export function languageMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    req.language = req.headers['accept-language']
        ? req.headers['accept-language']
        : 'en';
    next();
}
