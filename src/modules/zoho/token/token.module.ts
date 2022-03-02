import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ZohoTokenService } from '@modules/zoho/token/token.service';
import { ZohoTokenController } from '@modules/zoho/token/token.controller';
import { FirebaseModule } from '@modules/firebase/firebase.module';

@Module({
    imports: [ConfigModule, HttpModule, FirebaseModule],
    controllers: [ZohoTokenController],
    providers: [ZohoTokenService],
    exports: [ZohoTokenService],
})
export class ZohoTokenModule {}
