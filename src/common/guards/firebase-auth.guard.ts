// noinspection JSMethodCanBeStatic

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectLogger, LoggerService } from '@logger';
import { Request } from 'express';
import { FirebaseAdminService } from '@modules/firebase/firebase-admin.service';
import { IncomingHttpHeaders } from 'http';
import { isDefined } from 'class-validator';
import { ForbiddenException, UnauthorizedException } from '@exceptions';
import { ForbiddenExceptionType, UnauthorizedExceptionType } from '@constants';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    constructor(
        @InjectLogger(FirebaseAuthGuard.name) private logger: LoggerService,
        private fbAdmin: FirebaseAdminService,
        private reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): Promise<boolean> | boolean {
        const contextName =
            context.getClass().name + ' -> ' + context.getHandler().name;

        this.logger.log(contextName);

        const ctx = context.switchToHttp();
        const req = ctx.getRequest<Request>();

        const allowUnauthorizedRequest = this.reflector.get<boolean>(
            'allowUnauthorizedRequest',
            context.getHandler(),
        );

        return allowUnauthorizedRequest || this.validateRequest(req);
    }

    private validateRequest(req: Request): Promise<boolean> | boolean {
        const idToken = this.getBearerToken(req.headers);
        return this.validateFirebase(idToken, req);
    }

    private getBearerToken(headers: IncomingHttpHeaders) {
        if (this.isNotExistsBearerToken(headers)) {
            throw new UnauthorizedException(
                UnauthorizedExceptionType.NO_AUTHORIZATION_TOKEN,
            );
        }
        return headers['authorization'].split('Bearer ')[1];
    }

    private isNotExistsBearerToken(headers: IncomingHttpHeaders): boolean {
        const authorization = headers['authorization'];
        return (
            !isDefined(authorization) || !authorization.startsWith('Bearer ')
        );
    }

    private async validateFirebase(
        idToken: string,
        req: Request,
    ): Promise<boolean> {
        return this.fbAdmin
            .getAuth()
            .verifyIdToken(idToken)
            .then((user) => {
                if (!user.email_verified) {
                    throw new ForbiddenException(
                        ForbiddenExceptionType.EMAIL_NOT_VERIFIED,
                    );
                }

                return this.fbAdmin
                    .getFirestore()
                    .collection('users')
                    .doc(user.uid)
                    .get()
                    .then((res) => {
                        const userData = res.data();

                        req.user = { ...userData, ...user };

                        return true;
                    })
                    .catch((error) => {
                        throw new UnauthorizedException(
                            UnauthorizedExceptionType.USER_NOT_REGISTERED,
                            error,
                        );
                    });
            })
            .catch((error) => {
                throw new UnauthorizedException(undefined, error);
            });
    }
}
