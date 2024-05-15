import { IPaginationOptions } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface IPeriodComputerWorkOptions {
    filter?: {
        dateStart?: Date;
        dateEnd?: Date;
        computers?: number[];
        operatingSystem?: string;
        loginId?: string;
    }
    sorting?: ISortingOptions;
    pagination?: IPaginationOptions;
}