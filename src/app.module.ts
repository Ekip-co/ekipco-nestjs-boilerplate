import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { LoggerModule } from '@logger';
import { ValidationPipe } from '@pipes';
import generalConfig from '@config/general.config';
import gcloudConfig from '@config/gcloud.config';
import firebaseConfig from '@config/firebase.config';
import zohoConfig from '@config/zoho.config';
import { MessageModule } from '@modules/message/message.module';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { FirebaseAuthGuard } from '@guards/firebase-auth.guard';
import { Locale } from '@enums';
import { AllExceptionsFilter } from '@filters';
import { SampleModule } from '@modules/sample/sample.module';
import { ZohoModule } from '@modules/zoho/zoho.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env.development', '.env.production', '.env'],
            isGlobal: true,
            load: [firebaseConfig, gcloudConfig, generalConfig, zohoConfig],
        }),
        LoggerModule.forRoot(),
        MessageModule.forRoot({
            path: __dirname + '/resources/locales/',
            defaultLanguage: Locale.en,
            languages: [Locale.en, Locale.de],
        }),
        FirebaseModule,
        ZohoModule,
        SampleModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: FirebaseAuthGuard,
        },
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
})
export class AppModule {}
