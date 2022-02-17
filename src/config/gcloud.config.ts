import { registerAs } from '@nestjs/config';
import atob from '../utils/atob';

const env = process.env;

export default registerAs('gcloud', () => ({
    serviceAccountKey: env['GCLOUD_SERVICE']
        ? JSON.parse(atob(env['GCLOUD_SERVICE']))
        : undefined,
}));
