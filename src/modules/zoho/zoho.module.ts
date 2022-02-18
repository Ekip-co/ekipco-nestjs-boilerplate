import { Module } from '@nestjs/common';
import { ZohoFunctionModule } from '@modules/zoho/function/function.module';
import { ZohoCrmModule } from '@modules/zoho/crm/crm.module';
import { ZohoTokenModule } from '@modules/zoho/token/token.module';

@Module({
    imports: [ZohoFunctionModule, ZohoCrmModule, ZohoTokenModule],
    exports: [ZohoFunctionModule, ZohoCrmModule, ZohoTokenModule],
})
export class ZohoModule {}
