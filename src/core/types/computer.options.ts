import { Computer } from "../entities/computer.entity";
import { IPaginationOptions, IPaginationResult } from "./common/pagination-options";
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

export class ComputerPaginationResult {
    meta: IPaginationResult;
    entities: Computer[];
}