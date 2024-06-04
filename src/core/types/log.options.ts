import { IPaginationOptions } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface ILogOptions {
    filter?: {
        dateStart?: Date;
        dateEnd?: Date;
        date?: Date;
        loginId?: string;
        operatingSystem?: string;
        computerIds?: number[];
        type?: boolean;
    }
    sorting?: ISortingOptions;
    pagination?: IPaginationOptions;
}