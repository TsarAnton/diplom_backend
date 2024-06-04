export interface IPaginationOptions {
	page: number;
	size: number;
}

export interface IPaginationResult {
	page: number;
	maxPage: number;
	entitiesCount: number;
}