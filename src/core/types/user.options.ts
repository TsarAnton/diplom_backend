import { User } from "../entities/user.entity";
import { IPaginationOptions, IPaginationResult } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface IUserOptions {
    filter?: {
        login?: string;
    }
    sorting?: ISortingOptions;
    pagination?: IPaginationOptions;
}

export class UserPaginationResult {
    meta: IPaginationResult;
    entities: User[];
}