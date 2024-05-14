import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { LogWindows } from './log-windows.entity';

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

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedDate: Date;
}