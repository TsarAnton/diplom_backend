import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { defaultPagination } from 'src/core/types/constants/pagination.constants';

export class PaginationDto {
	@IsInt()
	@Min(1)
	@Type(() => Number)
	public page: number = defaultPagination.page;

	@IsInt()
	@Min(1)
	@Max(50)
	@Type(() => Number)
	public size: number = defaultPagination.size;
}