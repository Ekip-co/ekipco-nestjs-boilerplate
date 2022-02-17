import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.headers['request-id']) {
    req.headers['request-id'] = uuidv4();
  }
  next();
}
