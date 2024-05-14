import { IPaginationOptions } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface IDayComputerWorkOptions {
    filter?: {
        date?: Date;
        hours?: number;
        computerIds?: number[];
    }
    sorting?: ISortingOptions;
    pagination?: IPaginationOptions;
}