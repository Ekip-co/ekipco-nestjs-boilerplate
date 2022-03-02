/* eslint-disable @typescript-eslint/no-unused-vars */
import * as morgan from 'morgan';
import { Request } from 'express';

export function morganConfig() {
    morgan.token('req-headers', (req: Request, _) =>
        JSON.stringify(req.headers),
    );
    morgan.token('body', (req: Request, _) => JSON.stringify(req.body));
}
