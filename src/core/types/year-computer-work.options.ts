import { IPaginationOptions } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface IYearComputerWorkOptions {
    filter?: {
        date?: Date;
        hours?: number;
        computerIds?: number[];
    }
    sorting?: ISortingOptions;
    pagination?: IPaginationOptions;
}