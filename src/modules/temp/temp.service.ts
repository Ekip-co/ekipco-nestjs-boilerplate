import { Injectable } from '@nestjs/common';
import { ZohoFunctionService } from '@modules/zoho/function/function.service';
import { ZohoCrmService } from '@modules/zoho/crm/crm.service';

@Injectable()
export class TempService {
    constructor(
        private zohoFunctionService: ZohoFunctionService,
        private zohoCrmService: ZohoCrmService,
    ) {}

    async zohoFunctionServiceExecute() {
        return this.zohoFunctionService.executeFunction('bbtemp');
    }

    async zohoCrmServiceExecute() {
        const tempQueryString =
            'SELECT First_Name FROM Contacts WHERE First_Name = Berkant';

        return this.zohoCrmService.selectQuery(tempQueryString);
    }

    async zohoCrmServiceUpdateRecord() {
        return this.zohoCrmService.update('Contacts', '4992756000000684001', [
            { First_Name: 'TEMPberkant', Last_Name: 'test' },
        ]);
    }

    async zohoCrmServiceDeleteOneRecord() {
        return this.zohoCrmService.deleteOne('Contacts', '4992756000001079012');
    }

    async zohoCrmServiceDeleteManyRecord() {
        return this.zohoCrmService.deleteMany('Contacts', [
            '4992756000001082010',
        ]);
    }
}
