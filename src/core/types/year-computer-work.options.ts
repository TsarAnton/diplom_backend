import { YearComputerWork } from "../entities/year-computer-work.entity";
import { IPaginationOptions, IPaginationResult } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface IYearComputerWorkOptions {
    filter?: {
        dateStart?: Date;
        dateEnd?: Date;
        date?: Date;
        hours?: number;
        computers?: number[];
        operatingSystem?: string;
    }
    sorting?: ISortingOptions;
    pagination?: IPaginationOptions;
}

export class YearComputerWorkPaginationResult {
    meta: IPaginationResult;
    entities: YearComputerWork[];
}