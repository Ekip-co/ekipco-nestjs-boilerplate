import { registerAs } from '@nestjs/config';

const env = process.env;

export default registerAs('zoho', () => ({
    clientId: env['ZOHO_CRM_CLIENT_ID'],
    code: env['ZOHO_CRM_CODE'],
    clientSecret: env['ZOHO_CRM_CLIENT_SECRET'],
    refreshToken: env['ZOHO_CRM_REFRESH_TOKEN'],
    tokenURL: env['ZOHO_CRM_TOKEN_URL'],
    crmApiURL: env['ZOHO_CRM_API_URL'],
    organizationId: env['ZOHO_CRM_ORGANIZATION_ID'],
    apiKey: env['ZOHO_CRM_API_KEY'],
    functionApiURL: env['ZOHO_CRM_FUNCTION_API_URL'],
}));
