/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ConsoleLogger, Inject, Injectable, Scope } from '@nestjs/common';
import {
  format,
  createLogger,
  transports as WinstonTransports,
  Logger as WinstonLogger,
} from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import SlackHook from 'winston-slack-webhook-transport';
import * as moment from 'moment';
import { convertToLines } from '../utils/utils';
import ZohoCliqTransport from './transports/zoho-cliq.transport';
import { ConfigType } from '@nestjs/config';
import generalConfig from '../config/general.config';
import { isDefined } from 'class-validator';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  private _logger: WinstonLogger;

  constructor(
    @Inject(generalConfig.KEY)
    private generalCfg: ConfigType<typeof generalConfig>,
  ) {
    super();

    const project_id = generalCfg.projectId;
    const transports = [];

    // Eğer App Engine üzerinde çalışıyorsa
    if (generalCfg.isServerLog) {
      const loggingWinston = new LoggingWinston();
      // Add Stackdriver Logging
      transports.push(loggingWinston);
    }

    // Eğer Cliq bildirimleri gönderilecekse
    if (this.isCliqNotification()) {
      const cliqTransport = new ZohoCliqTransport(
        generalCfg.cliqApiKey,
        generalCfg.cliqBot,
        generalCfg.cliqChannel,
        generalCfg.cliqMessageTitle,
        {
          level: 'error',
        },
      );
      transports.push(cliqTransport);
    }

    // Eğer Slack bildirimleri gönderilecekse
    if (generalCfg.isSlackNotification && generalCfg.slackWebhookUrl) {
      // slack notification for error
      transports.push(
        new SlackHook({
          level: 'error',
          webhookUrl: generalCfg.slackWebhookUrl,
          formatter: (info) => {
            const attachments = [];
            const metadata = info.metadata;

            attachments.push({
              text: `Message: ${info.message}`,
            });

            const metaText = convertToLines(metadata);

            metaText.forEach((line) => {
              attachments.push({
                text: line,
              });
            });

            return {
              text: `Back-End Error ${project_id} (${info.timestamp})`,
              attachments: attachments,
            };
          },
        }),
      );
    }

    // İstenilen özellikler
    const formats = format.combine(
      format.errors({ stack: true }),
      format.timestamp({
        format: () => moment().locale('tr').format('LL LTS'),
      }),
      // Ekstra parametre girilenleri metadata objectine atasın
      format.metadata({
        fillExcept: ['message', 'level', 'timestamp'],
      }),
      //winston.format.colorize(),
      format.printf((info) => {
        let out = `${info.timestamp} ${info.level}: ${info.message}`;
        if (Object.keys(info.metadata).length > 0) {
          out = out + '\n' + convertToLines(info.metadata).join('\n') + '\n';
        }
        return out;
      }),
    );

    this._logger = createLogger({
      level: 'debug',
      format: formats,
      transports: [
        new WinstonTransports.Console({ silent: false }),
        ...transports,
      ],
    });
  }

  isCliqNotification(): boolean {
    return (
      isDefined(this.generalCfg.isCliqNotification) &&
      isDefined(this.generalCfg.cliqApiKey) &&
      isDefined(this.generalCfg.cliqChannel) &&
      isDefined(this.generalCfg.cliqBot) &&
      isDefined(this.generalCfg.cliqBot)
    );
  }

  setContext(context: string) {
    this._logger.defaultMeta = {
      ...this._logger.defaultMeta,
      Context: context,
    };
  }

  appendDefaultMeta(key: string, value: string) {
    this._logger.defaultMeta = {
      ...this._logger.defaultMeta,
      [key]: value,
    };
  }

  log(...info: any[]) {
    // @ts-ignore
    return this._logger.debug(...info);
  }
  error(...info: any[]) {
    // @ts-ignore
    return this._logger.error(...info);
  }
  warn(...info: any[]) {
    // @ts-ignore
    return this._logger.warn(...info);
  }
  debug(...info: any[]) {
    // @ts-ignore
    return this._logger.debug(...info);
  }
  info(...info: any[]) {
    // @ts-ignore
    return this._logger.info(...info);
  }
}
