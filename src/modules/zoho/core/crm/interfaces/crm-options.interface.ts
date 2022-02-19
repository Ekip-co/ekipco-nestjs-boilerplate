import { File } from '@modules/zoho/core/crm/interfaces/file.interface';

export interface ZohoCrmOptions {
    isNotRequiredToken?: boolean;
    fileUpload?: File[];
}
