import { File } from '@modules/zoho/crm/interfaces/file.interface';

export interface ZohoCrmOptions {
    isNotRequiredToken?: boolean;
    fileUpload?: File[];
}
