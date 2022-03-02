import { File } from '@modules/zoho/core/crm/interfaces/file.interface';

export interface ZohoCrmOptions {
    isNotRequiredToken?: boolean;
    isDownload?: boolean;
    file?: File;
    fileId?: string;
    fileType?: FileType;
}

export enum FileType {
    PHOTO,
    ATTACHMENT,
}
