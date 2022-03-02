import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from '@modules/firebase/services/firebase-admin.service';
import { UpdateUserDto } from '@modules/firebase/auth/dtos/update-user.dto';
import { FirebaseException } from '@modules/firebase/firebase.exception';

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
