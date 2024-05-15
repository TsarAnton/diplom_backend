import {
	IsNotEmpty,
	IsString,
	MaxLength,
} from 'class-validator';

export class AuthDto {
    @IsNotEmpty()
	@MaxLength(100)
	@IsString()
    login: string;

    @IsNotEmpty()
	@MaxLength(255)
	@IsString()
    password: string;
}