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
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortingDto } from './common/sorting.dto';
import { PaginationDto } from './common/pagination.dto';

export class CreateComputerDto {
    @IsNotEmpty()
	@MaxLength(50)
	@IsString()
    name: string;

    @IsNotEmpty()
	@MaxLength(12)
	@IsString()
    macAddress: string;

    @IsNotEmpty()
	@MaxLength(15)
	@IsString()
    ipAddress: string;

	@IsOptional()
	@MaxLength(20)
	@IsString()
    audince?: string;
}

export class UpdateComputerDto {
    @IsOptional()
	@MaxLength(50)
	@IsString()
    name?: string;

    @IsOptional()
	@MaxLength(12)
	@IsString()
    macAddress?: string;

    @IsOptional()
	@MaxLength(15)
	@IsString()
    ipAddress?: string;

	@IsOptional()
	@MaxLength(20)
	@IsString()
    audince?: string;
}

export class ReadComputerDto {
	@IsOptional()
	@IsInt()
	@Transform(id => Number(id))
	id?: number;

    @IsOptional()
	@MaxLength(50)
	@IsString()
    name?: string;

    @IsOptional()
	@MaxLength(12)
	@IsString()
    macAddress?: string;

    @IsOptional()
	@MaxLength(15)
	@IsString()
    ipAddress?: string;

	@IsOptional()
	@MaxLength(20)
	@IsString()
    audince?: string;
}

export class ReadAllComputerDto {
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
	@MaxLength(50)
	@IsString()
    name?: string;

    @IsOptional()
	@MaxLength(12)
	@IsString()
    macAddress?: string;

    @IsOptional()
	@MaxLength(15)
	@IsString()
    ipAddress?: string;

	@IsOptional()
	@MaxLength(20)
	@IsString()
    audince?: string;
}