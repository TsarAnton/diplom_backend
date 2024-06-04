import { DayComputerWork } from "../entities/day-computer-work.entity";
import { IPaginationOptions, IPaginationResult } from "./common/pagination-options";
import { ISortingOptions } from "./common/sorting-options";

export interface IDayComputerWorkOptions {
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

export class DayComputerWorkPaginationResult {
    meta: IPaginationResult;
    entities: DayComputerWork[];
}