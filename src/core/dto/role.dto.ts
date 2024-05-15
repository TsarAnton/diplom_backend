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

export class CreateRoleDto {
    @IsNotEmpty()
	@MaxLength(50)
	@IsString()
    name: string;
}

export class UpdateRoleDto {
    @IsOptional()
	@MaxLength(50)
	@IsString()
    name?: string;
}

export class ReadRoleDto {
	@IsOptional()
	@IsInt()
	@Transform(id => Number(id))
	id?: number;

    @IsOptional()
	@MaxLength(50)
	@IsString()
    name?: string;
}

export class ReadAllRoleDto {
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
    public name?: string;
}