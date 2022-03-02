import {
    IsBoolean,
    IsEmail,
    IsPhoneNumber,
    IsString,
    IsUrl,
} from 'class-validator';

export class UpdateUserDto {
    @IsBoolean()
    emailVerified?: boolean;

    @IsEmail()
    email?: string;

    @IsPhoneNumber()
    phoneNumber?: string;

    @IsString()
    password?: string;

    @IsString()
    displayName?: string;

    @IsUrl()
    photoURL?: string;

    @IsBoolean()
    disabled?: boolean;
}
