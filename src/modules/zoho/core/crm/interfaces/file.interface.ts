// for multipart/form-data file upload
export interface File {
    fieldName: string;
    originalName: string;
    mimeType: string;
    buffer: Buffer;
}
