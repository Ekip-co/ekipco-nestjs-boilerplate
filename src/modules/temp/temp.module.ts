import { Module } from '@nestjs/common';
import { TempService } from '@modules/temp/temp.service';
import { TempController } from '@modules/temp/temp.controller';
import { ZohoModule } from '@modules/zoho/zoho.module';

@Module({
    imports: [ZohoModule],
    controllers: [TempController],
    providers: [TempService],
})
export class TempModule {}
