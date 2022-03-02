import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import zohoConfig from '@config/zoho.config';
import { ConfigType } from '@nestjs/config';
import { lastValueFrom, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { NotFoundException } from '@exceptions';
import { ZohoCoreService } from '../core.service';

@Injectable()
export class ZohoFunctionService extends ZohoCoreService {
    private readonly FUNCTION_METHOD: string = 'FUNCTION'; // for Zoho Exception

    constructor(
        @Inject(zohoConfig.KEY) private zohoCfg: ConfigType<typeof zohoConfig>,
        private httpService: HttpService,
    ) {
        super();
    }

    executeFunction(functionName: string, data?: any) {
        const observable = this.executeAxiosInstance(functionName, data);
        return lastValueFrom(observable)
            .then((response: AxiosResponse<any>) =>
                this.responseHandler(
                    response,
                    functionName,
                    this.FUNCTION_METHOD,
                ),
            )
            .catch((err) =>
                this.errorHandler(err, functionName, this.FUNCTION_METHOD),
            );
    }

    private executeAxiosInstance(
        functionName: string,
        data?: any,
    ): Observable<AxiosResponse<any>> {
        const url = `/${functionName}/actions/execute`;

        // NOT: Zoho verileri FormData olarak kabul ediyor.
        const bodyFormData: FormData = new FormData();

        if (data) {
            Object.keys(data).forEach((key: string) =>
                data[key] ? bodyFormData.append(key, data[key]) : {},
            );
        }

        const formHeaders = bodyFormData.getHeaders();

        const options = {
            params: {
                auth_type: 'apikey',
                zapikey: this.zohoCfg.apiKey,
            },
            headers: {
                ...formHeaders,
            },
        };

        return this.httpService.post(url, bodyFormData, options);
    }

    private responseHandler(
        response: AxiosResponse<any>,
        moduleName: string,
        method: string,
    ) {
        // Axios dan gelen bilgi "data" içerisinde, Zohodan gelen bilgi "details.output.data" içerisinde.
        // Output string olarak geliyor JSON'a çevirilmesi lazım.
        // JSON'a çevirdikten sonra data 'data' key'inin içerisinde.

        const stringResult = response.data.details.output as string;

        const parsedResult = stringResult
            ? JSON.parse(stringResult).data
            : undefined;

        if (!parsedResult) throw new NotFoundException();

        this.resultExceptionCheck(parsedResult, moduleName, method);

        return parsedResult;
    }
}
