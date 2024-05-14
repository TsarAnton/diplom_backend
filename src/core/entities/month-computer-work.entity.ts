import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Computer } from './computer.entity';

@Entity({ name: 'month_computer_work', engine: 'InnoDB' })
export class MonthComputerWork {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	date: Date;

    @Column()
	hours: number;

	@ManyToOne(
		() => Computer,
		computer => computer.logsWindows,
		{ onDelete: 'RESTRICT', onUpdate: 'RESTRICT' },
	)
	@JoinColumn({ name: 'computer_id', referencedColumnName: 'id' })
	computer: Computer;

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedDate: Date;
}