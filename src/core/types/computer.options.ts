import { IPaginationOptions } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface IComputerOptions {
    filter?: {
        name?: string;
        macAddress?: string;
        ipAddress?: string;
        audince?: string;
    }
    sorting?: ISortingOptions;
    pagination?: IPaginationOptions;
}