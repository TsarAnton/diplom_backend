import { Log } from "../entities/log.entity";
import { IPaginationOptions, IPaginationResult } from "./common/pagination-options";
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

export class LogPaginationResult {
    meta: IPaginationResult;
    entities: Log[];
}