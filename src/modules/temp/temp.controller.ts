import { TempService } from '@modules/temp/temp.service';
import { Controller, Delete, Get, Put } from '@nestjs/common';
import { AllowUnauthorizedRequest } from '@/common/decorators';

@Controller('temp')
export class TempController {
    constructor(private readonly tempService: TempService) {}

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
