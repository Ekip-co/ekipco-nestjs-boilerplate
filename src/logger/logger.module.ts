import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import { LoggerService, getLoggerContexts, getLoggerToken } from '@logger';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import generalConfig from '@config/general.config';

@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    const contexts = getLoggerContexts();

    const loggerProviders: FactoryProvider<LoggerService>[] = contexts.map(
      (context: string) => {
        return {
          provide: getLoggerToken(context),
          useFactory: (configService: ConfigService) => {
            const generalCfg: ConfigType<typeof generalConfig> =
              configService.get('general');
            const logger = new LoggerService(generalCfg);
            logger.setContext(context);
            return logger;
          },
          inject: [ConfigService],
        };
      },
    );

    return {
      module: LoggerModule,
      imports: [ConfigModule],
      providers: [LoggerService, ...loggerProviders],
      exports: [
        LoggerService,
        ...contexts.map((context: string) => getLoggerToken(context)),
      ],
    };
  }
}
