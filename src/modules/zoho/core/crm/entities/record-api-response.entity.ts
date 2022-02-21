export class RecordApiResponse {
    Modified_Time?: Date;
    Modified_By?: OwnerDetail;
    Created_Time?: Date;
    id: string;
    Created_By?: OwnerDetail;
}

interface OwnerDetail {
    id: string;
    name: string;
}
