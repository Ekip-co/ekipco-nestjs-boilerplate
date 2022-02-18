import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { ConfigService, ConfigType } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { morganConfig } from '@config/morgan.config';
import { corsOptions } from '@config/cors.config';
import generalConfig from '@config/general.config';
import { LoggerService, LoggingInterceptor, appendMetaToLogger } from '@logger';
import { TransformInterceptor } from '@interceptors';
import {
    httpRedirect,
    requestIdMiddleware,
    morganMiddleware,
    languageMiddleware,
} from '@middleware';
import { mw } from 'request-ip';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bufferLogs: true,
    });
    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
        .setTitle('ekip.co')
        .setDescription('The ekip.co API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const configService = app.get(ConfigService);
    const generalCfg: ConfigType<typeof generalConfig> =
        configService.get('general');

    app.use(requestIdMiddleware);
    app.use(mw());

    const logger = new LoggerService(generalCfg);
    app.useLogger(logger);
    app.useGlobalInterceptors(new LoggingInterceptor(logger));
    app.use(appendMetaToLogger(logger));

    morganConfig();
    app.use(morganMiddleware(logger));

    if (configService.get('general.NODE_ENV') === 'production') {
        app.use(httpRedirect(true));
    }

    app.use(helmet());

    app.enableCors(corsOptions);

    app.use(json({ limit: '200mb' }));
    app.use(
        urlencoded({
            extended: false,
            limit: '200mb',
        }),
    );

    app.use(cookieParser());

    app.use(languageMiddleware);

    app.useGlobalInterceptors(new TransformInterceptor());

    await app.listen(3000);
}

bootstrap();
