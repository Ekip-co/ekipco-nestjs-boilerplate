import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from '@modules/firebase/firebase-admin.service';
import { FirebaseException } from '@exceptions';
import { UpdateUserDto } from '@modules/firebase/auth/dtos/update-user.dto';

@Injectable()
export class FirebaseAuthService {
    constructor(private fbAdmin: FirebaseAdminService) {}

    getUserByUID(uid: string) {
        return this.fbAdmin
            .getAuth()
            .getUser(uid)
            .catch((err) => {
                throw new FirebaseException(err);
            });
    }

    getUserByEmail(email: string) {
        return this.fbAdmin
            .getAuth()
            .getUserByEmail(email)
            .catch((err) => {
                throw new FirebaseException(err);
            });
    }

    updateUser(uid: string, updateUserDto: UpdateUserDto) {
        return this.fbAdmin
            .getAuth()
            .updateUser(uid, updateUserDto)
            .catch((err) => {
                throw new FirebaseException(err);
            });
    }

    deleteUser(uid: string) {
        return this.fbAdmin
            .getAuth()
            .deleteUser(uid)
            .catch((err) => {
                throw new FirebaseException(err);
            });
    }
}
