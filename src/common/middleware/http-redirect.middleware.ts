import { NextFunction, Request, Response } from 'express';

export function httpRedirect(redirectLocalhost: boolean) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (req.hostname === 'localhost' && !redirectLocalhost) {
      return next();
    }
    if (isSecure(req)) {
      return next();
    }
    // Note that we do not keep the port as we are using req.hostname
    // and not req.headers.host. The port number does not really have
    // a meaning in most cloud deployments since they port forward.
    res.redirect('https://' + req.hostname + req.originalUrl);
  };
}

function isSecure(req: Request) {
  // Check the trivial case first.
  if (req.secure) {
    return true;
  }
  // Check if we are behind Application Request Routing (ARR).
  // This is typical for Azure.
  if (req.headers['x-arr-log-id']) {
    return typeof req.headers['x-arr-ssl'] === 'string';
  }
  // Check for forwarded protocol header.
  // This is typical for AWS.
  return req.headers['x-forwarded-proto'] === 'https';
}
