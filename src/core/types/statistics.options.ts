import { Computer } from "../entities/computer.entity";
import { DayComputerWork } from "../entities/day-computer-work.entity";
import { Log } from "../entities/log.entity";
import { MonthComputerWork } from "../entities/month-computer-work.entity";
import { PeriodComputerWork } from "../entities/period-computer-work.entity";
import { YearComputerWork } from "../entities/year-computer-work.entity";

export class StatisticsHoursMember {
    computer: Computer;
    hours: number;
}

export class StatisticsHours {
    dateStart: Date;
    dateEnd: Date;
    computers: StatisticsHoursMember[];
}

export class StatisticsPeriodDate {
    dateStart: Date;
    dateEnd: Date;
    hours: number;
    operatingSystem: string;
}

export class StatisticsPeriodMember {
    computer: Computer;
    periods: StatisticsPeriodDate[]
}

export class StatisticsPeriod {
    dateStart: Date;
    dateEnd: Date;
    computers: StatisticsPeriodMember[];
}

export class CreateStatisticsResult {
    status: "OK" | "ERROR";
}