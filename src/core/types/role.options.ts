import { Role } from "../entities/role.entity";
import { IPaginationOptions, IPaginationResult } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface IRoleOptions {
    filter?: {
        name?: string;
    }
    sorting?: ISortingOptions;
    pagination?: IPaginationOptions;
}

export class RolePaginationResult {
    meta: IPaginationResult;
    entities: Role[];
}