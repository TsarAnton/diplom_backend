import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { LogWindows } from './log-windows.entity';
import { DayComputerWork } from './day-computer-work.entity';
import { MonthComputerWork } from './month-computer-work.entity';
import { YearComputerWork } from './year-computer-work.entity';
import { PeriodComputerWork } from './period-computer-work.entity';

@Entity({ name: 'computer', engine: 'InnoDB' })
export class Computer {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 50 })
	name: string;

    @Column({ length: 12, unique: true })
	macAddress: string;

    @Column({ length: 15 })
	ipAddress: string;    

	@Column({ length: 20 })
	audince: string;    

	@OneToMany(
		() => LogWindows,
		logWindows => logWindows.computer,
	)
	logsWindows: LogWindows[];

	@OneToMany(
		() => DayComputerWork,
		dayComputerWork => dayComputerWork.computer,
	)
	daysComputerWork: DayComputerWork[];

	@OneToMany(
		() => MonthComputerWork,
		monthComputerWork => monthComputerWork.computer,
	)
	monthsComputerWork: MonthComputerWork[];

	@OneToMany(
		() => YearComputerWork,
		yearComputerWork => yearComputerWork.computer,
	)
	yearsComputerWork: YearComputerWork[];

	@OneToMany(
		() => PeriodComputerWork,
		periodComputerWork => periodComputerWork.computer,
	)
	periodsComputerWork: PeriodComputerWork[];

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedDate: Date;
}