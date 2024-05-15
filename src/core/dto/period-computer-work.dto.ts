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
	IsBoolean,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortingDto } from './common/sorting.dto';
import { PaginationDto } from './common/pagination.dto';

export class CreatePeriodComputerWorkDto {
    @IsDefined()
	@IsInt()
	@Transform(computerId => Number(computerId))
	computerId: number;

    @IsOptional()
	@IsDate()
    dateStart?: Date;

    @IsOptional()
	@IsDate()
    dateEnd?: Date;

    @IsNotEmpty()
	@IsString()
    @MaxLength(50)
    operatingSystem: string;

    @IsNotEmpty()
	@IsString()
    @MaxLength(15)
    loginId: string;
}

export class UpdatePeriodComputerWorkDto {
    @IsOptional()
	@IsInt()
	@Transform(computerId => Number(computerId))
	computerId?: number;

    @IsOptional()
	@MaxLength(50)
	@IsDate()
    dateStart?: Date;

    @IsOptional()
	@MaxLength(50)
	@IsDate()
    dateEnd?: Date;

    @IsOptional()
	@IsString()
    @MaxLength(50)
    operatingSystem?: string;

    @IsOptional()
	@IsString()
    @MaxLength(15)
    loginId?: string;
}

export class ReadPeriodComputerWorkDto {
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
    dateStart?: Date;

    @IsOptional()
	@MaxLength(50)
	@IsDate()
    dateEnd?: Date;

    @IsOptional()
	@IsString()
    @MaxLength(50)
    operatingSystem?: string;

    @IsOptional()
	@IsString()
    @MaxLength(15)
    loginId?: string;
}

export class ReadAllPeriodComputerWorkDto {
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
	@IsString()
    @MaxLength(50)
    operatingSystem?: string;

    @IsOptional()
	@IsString()
    @MaxLength(15)
    loginId?: string;
}