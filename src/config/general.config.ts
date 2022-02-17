import { registerAs } from '@nestjs/config';

const env = process.env;

export default registerAs('general', () => ({
  NODE_ENV: env['NODE_ENV'],
  projectId: env['PROJECT_ID'],
  apiAccessToken: env['API_ACCESS_TOKEN'],
  isServerLog: env['IS_SERVER_LOG'] ?? false,
  isSlackNotification: env['IS_SLACK_NOTIFICATION'] ?? false,
  isCliqNotification: env['IS_ZOHO_CLIQ_NOTIFICATION'] ?? false,
  slackWebhookUrl: env['SLACK_WEBHOOK_URL'],
  cliqApiKey: env['ZOHO_CLIQ_API_KEY'],
  cliqChannel: env['ZOHO_CLIQ_CHANNEL'],
  cliqBot: env['ZOHO_CLIQ_BOT'],
  cliqMessageTitle: env['ZOHO_CLIQ_MESSAGE_TITLE'],
}));
