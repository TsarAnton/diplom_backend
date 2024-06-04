import { Transform } from 'class-transformer';
import {
	IsArray,
	IsDate,
	IsDefined,
	IsInt,
	IsNotEmpty,
	IsString,
    IsDecimal,
	MaxLength,
    IsOptional,
	IsObject,
	ValidateNested,
	IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortingDto } from './common/sorting.dto';
import { PaginationDto } from './common/pagination.dto';

export class CreateYearComputerWorkDto {
    @IsDefined()
	@IsInt()
	@Transform(computerId => Number(computerId))
	computerId: number;

    @IsNotEmpty()
	@MaxLength(50)
	@IsDate()
    date: Date;

    @IsNotEmpty()
	@IsDecimal()
    @Transform(hours => Number(hours))
    hours: number;

	@IsNotEmpty()
	@IsString()
	@MaxLength(50)
	operatingSystem: string;
}

export class UpdateYearComputerWorkDto {
    @IsOptional()
	@IsInt()
	@Transform(computerId => Number(computerId))
	computerId?: number;

    @IsOptional()
	@MaxLength(50)
	@IsDate()
    date?: Date;

    @IsOptional()
	@IsDecimal()
    @Transform(hours => Number(hours))
    hours?: number;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	operatingSystem?: string;
}

export class ReadYearComputerWorkDto {
	@IsOptional()
	@IsInt()
	@Transform(id => Number(id))
	id?: number;
	
    @IsOptional()
	@IsInt()
	@Transform(computerId => Number(computerId))
	computerId?: number;

    @IsOptional()
	@MaxLength(50)
	@IsDate()
    date?: Date;

    @IsOptional()
	@IsDecimal()
    @Transform(hours => Number(hours))
    hours?: number;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	operatingSystem?: string;
}

export class ReadAllYearComputerWorkDto {
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
	@IsDefined()
	@IsArray()
	@IsInt({ each: true })
	//@Transform((computers: string[]) => computers.map(id => Number(id)))
	@Transform(computers => Array(computers).map(id => Number(id)))
	computers?: number[];

    @IsOptional()
	@MaxLength(50)
	@IsDate()
    dateStart?: Date;

	@IsOptional()
	@MaxLength(50)
	@IsDate()
    dateEnd?: Date;

	@IsOptional()
	@MaxLength(50)
	@IsDate()
    date?: Date;

    @IsOptional()
	@IsDecimal()
    @Transform(hours => Number(hours))
    hours?: number;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	operatingSystem?: string;
}