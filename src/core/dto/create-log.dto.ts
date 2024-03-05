import {
	IsArray,
	IsDate,
	IsDefined,
	IsInt,
	IsNotEmpty,
	IsString,
	MaxLength,
    IsOptional,
	ValidateNested,
	IsObject,
} from 'class-validator';

export class CreateLogDto {
    @IsNotEmpty()
	@MaxLength(100)
	@IsString()
    computerName: string;

    @IsNotEmpty()
	@MaxLength(12)
	@IsString()
    macAddress: string;

	@IsNotEmpty()
	@MaxLength(15)
	@IsString()
    ipAddress: string;

    @IsNotEmpty()
	@IsDate()
    date: Date;

	@MaxLength(15)
	@IsString()
    loginId: string;

    @IsNotEmpty()
	@MaxLength(10)
	@IsString()
    audince: string;

    @IsNotEmpty()
	@MaxLength(20)
	@IsString()
    operatingSystem: string;
}