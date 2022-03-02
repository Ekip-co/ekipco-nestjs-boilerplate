import { Module } from '@nestjs/common';
import { ZohoFunctionService } from '@modules/zoho/core/function/function.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        HttpModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                baseURL: configService.get('zoho.functionApiURL'),
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [ZohoFunctionService],
    exports: [ZohoFunctionService],
})
export class ZohoFunctionModule {}
