import { MonthComputerWork } from "../entities/month-computer-work.entity";
import { IPaginationOptions, IPaginationResult } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface IMonthComputerWorkOptions {
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

export class MonthComputerWorkPaginationResult {
    meta: IPaginationResult;
    entities: MonthComputerWork[];
}