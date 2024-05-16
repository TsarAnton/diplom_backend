import { Computer } from "../entities/computer.entity";

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