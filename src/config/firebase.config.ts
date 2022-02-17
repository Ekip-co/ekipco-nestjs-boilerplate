import atob from '@utils/atob';
import { registerAs } from '@nestjs/config';

const env = process.env;

export default registerAs('firebase', () => ({
  credential: env['FIREBASE_SA_KEY']
    ? JSON.parse(atob(env['FIREBASE_SA_KEY']))
    : undefined,
  databaseURL: env['FIREBASE_DB_URL'],
}));
