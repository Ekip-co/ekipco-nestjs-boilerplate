import { SampleService } from '@modules/sample/sample.service';
import { Controller, Delete, Get, Put } from '@nestjs/common';
import { AllowUnauthorizedRequest } from '@/common/decorators';

@Controller('sample')
export class SampleController {
    constructor(private readonly tempService: SampleService) {}

    @Get('zoho/function')
    @AllowUnauthorizedRequest()
    zohoFunction() {
        return this.tempService.zohoFunctionServiceExecute();
    }

    @Get('zoho/crm-select')
    @AllowUnauthorizedRequest()
    zohoCrmSelect() {
        return this.tempService.zohoCrmServiceExecute();
    }

    @Put('zoho/crm-update')
    @AllowUnauthorizedRequest()
    zohoCrmUpdate() {
        return this.tempService.zohoCrmServiceUpdateRecord();
    }

    @Delete('zoho/crm-delete-one')
    @AllowUnauthorizedRequest()
    zohoCrmDeleteOne() {
        return this.tempService.zohoCrmServiceDeleteOneRecord();
    }

    @Delete('zoho/crm-delete-many')
    @AllowUnauthorizedRequest()
    zohoCrmDeleteMany() {
        return this.tempService.zohoCrmServiceDeleteManyRecord();
    }
}
