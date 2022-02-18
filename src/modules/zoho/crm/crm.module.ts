import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ZohoCrmService } from '@modules/zoho/crm/crm.service';
import { FirebaseModule } from '@modules/firebase/firebase.module';

@Module({
    imports: [
        ConfigModule,
        HttpModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                baseURL: configService.get('zoho.crmApiURL'),
            }),
            inject: [ConfigService],
        }),
        FirebaseModule,
    ],
    providers: [ZohoCrmService],
    exports: [ZohoCrmService],
})
export class ZohoCrmModule {}
