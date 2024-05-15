import { Transform } from 'class-transformer';
import {
	IsArray,
	IsDate,
	IsDefined,
	IsInt,
	IsNotEmpty,
	IsString,
	MaxLength,
    IsOptional,
	IsObject,
	ValidateNested,
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStatisticsDto {
    @IsNotEmpty()
    @IsBoolean()
    type: boolean;
    
    @IsNotEmpty()
	@MaxLength(50)
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
	@MaxLength(15)
	@IsString()
    loginId: string;

    @IsNotEmpty()
	@IsDate()
    date: Date;

	@IsOptional()
	@MaxLength(20)
	@IsString()
    audince?: string;

    @IsOptional()
	@IsString()
    @MaxLength(50)
    operatingSystem?: string;
}