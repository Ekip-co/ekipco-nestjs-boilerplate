import { Module } from '@nestjs/common';
import { SampleService } from '@modules/sample/sample.service';
import { SampleController } from '@modules/sample/sample.controller';
import { ZohoModule } from '@modules/zoho/zoho.module';

@Module({
    imports: [ZohoModule],
    controllers: [SampleController],
    providers: [SampleService],
})
export class SampleModule {}
