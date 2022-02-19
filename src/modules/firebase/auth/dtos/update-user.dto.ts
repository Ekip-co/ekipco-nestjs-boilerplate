import {
    IsBoolean,
    IsEmail,
    IsPhoneNumber,
    IsString,
    IsUrl,
    ValidationArguments,
} from 'class-validator';

export class UpdateUserDto {
    @IsBoolean({
        message: (args: ValidationArguments) => {
            return `${args.property} is invalid.`;
        },
    })
    emailVerified?: boolean;

    @IsEmail({
        message: (args: ValidationArguments) => {
            return `${args.property} is invalid.`;
        },
    })
    email?: string;

    @IsPhoneNumber(undefined, {
        message: (args: ValidationArguments) => {
            return `${args.property} is invalid.`;
        },
    })
    phoneNumber?: string;

    @IsString({
        message: (args: ValidationArguments) => {
            return `${args.property} is invalid.`;
        },
    })
    password?: string;

    @IsString({
        message: (args: ValidationArguments) => {
            return `${args.property} is invalid.`;
        },
    })
    displayName?: string;

    @IsUrl({
        message: (args: ValidationArguments) => {
            return `${args.property} is invalid.`;
        },
    })
    photoURL?: string;

    @IsBoolean({
        message: (args: ValidationArguments) => {
            return `${args.property} is invalid.`;
        },
    })
    disabled?: boolean;
}
