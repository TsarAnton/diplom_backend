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
import { SortingDto } from './common/sorting.dto';
import { PaginationDto } from './common/pagination.dto';

export class CreateLogWindowsDto {
    @IsDefined()
	@IsInt()
	@Transform(computerId => Number(computerId))
	computerId: number;

	@IsNotEmpty()
	@IsBoolean()
    type: boolean;

    @IsNotEmpty()
	@MaxLength(15)
	@IsString()
    loginId: string;

    @IsNotEmpty()
	@MaxLength(50)
	@IsString()
    operatingSystem: string;

    @IsNotEmpty()
	@MaxLength(50)
	@IsDate()
    date: Date;
}

export class UpdateLogWindowsDto {
    @IsOptional()
	@IsInt()
	@Transform(computerId => Number(computerId))
	computerId?: number;

	@IsOptional()
	@IsBoolean()
    type?: boolean;

    @IsOptional()
	@MaxLength(15)
	@IsString()
    loginId?: string;

    @IsOptional()
	@MaxLength(50)
	@IsString()
    operatingSystem?: string;

    @IsOptional()
	@MaxLength(50)
	@IsDate()
    date?: Date;
}

export class ReadLogWindowsDto {
	@IsOptional()
	@IsInt()
	@Transform(id => Number(id))
	id?: number;
	
    @IsOptional()
	@IsInt()
	@Transform(computerId => Number(computerId))
	computerId?: number;

	@IsOptional()
	@IsBoolean()
    type?: boolean;

    @IsOptional()
	@MaxLength(15)
	@IsString()
    loginId?: string;

    @IsOptional()
	@MaxLength(50)
	@IsString()
    operatingSystem?: string;

    @IsOptional()
	@MaxLength(50)
	@IsDate()
    date?: Date;
}

export class ReadAllLogWindowsDto {
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
	//@Transform((computerIds: string[]) => computerIds.map(id => Number(id)))
	computerIds?: number[];

	@IsOptional()
	@IsBoolean()
    type?: boolean;

    @IsOptional()
	@MaxLength(15)
	@IsString()
    loginId?: string;

    @IsOptional()
	@MaxLength(50)
	@IsString()
    operatingSystem?: string;

    @IsOptional()
	@MaxLength(50)
	@IsDate()
    date?: Date;
}