import { Transform } from 'class-transformer';
import {
	IsInt,
	IsNotEmpty,
	IsString,
	MaxLength,
    IsOptional,
	IsObject,
	ValidateNested,
    IsDefined,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortingDto } from './common/sorting.dto';
import { PaginationDto } from './common/pagination.dto';

export class CreateUserDto {
    @IsNotEmpty()
	@MaxLength(50)
	@IsString()
    login: string;

    @IsNotEmpty()
	@MaxLength(12)
	@IsString()
    password: string;

    @IsNotEmpty()
    @IsDefined()
	@IsArray()
	@IsInt({ each: true })
    roles: number[];
}

export class UpdateUserDto {
    @IsOptional()
	@MaxLength(50)
	@IsString()
    login?: string;

    @IsOptional()
	@MaxLength(12)
	@IsString()
    password?: string;

    @IsNotEmpty()
    @IsOptional()
	@IsArray()
	@IsInt({ each: true })
    roles: number[];
}

export class ReadUserDto {
	@IsOptional()
	@IsInt()
	@Transform(id => Number(id))
	id?: number;

    @IsOptional()
	@MaxLength(50)
	@IsString()
    login?: string;

    @IsOptional()
	@MaxLength(12)
	@IsString()
    password?: string;
}

export class ReadAllUserDto {
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
    public login?: string;

    @IsNotEmpty()
    @IsOptional()
	@IsArray()
	@IsInt({ each: true })
    @Transform(roles => Array(roles).map(id => Number(id)))
    roles: number[];
}