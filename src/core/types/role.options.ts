import { IPaginationOptions } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface IRoleOptions {
    filter?: {
        name?: string;
    }
    sorting?: ISortingOptions;
    pagination?: IPaginationOptions;
}