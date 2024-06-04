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
	isDecimal,
	IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './common/pagination.dto';
import { SortingDto } from './common/sorting.dto';

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

    @IsOptional()
	@MaxLength(15)
	@IsString()
    loginId?: string;

	@IsOptional()
	@IsDecimal()
	time?: number;

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

export class ReadStatisticsDto {
	@IsOptional()
	@IsObject()
	@ValidateNested()
	@Type(() => PaginationDto)
	public pagination?: PaginationDto;

	@IsOptional()
	@IsObject()
	@ValidateNested()
	@Type(() => SortingDto)
	public sorting?: SortingDto;
	
	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	@Transform(computers => Array(computers).map(id => Number(id)))
	computers?: number[];

	@IsNotEmpty()
	@IsDate()
    dateStart: Date;

	@IsNotEmpty()
	@IsDate()
    dateEnd: Date;

	@IsOptional()
	@IsString()
    @MaxLength(50)
    operatingSystem?: string;
}
