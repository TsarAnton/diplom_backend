import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Computer } from './computer.entity';

@Entity({ name: 'day_computer_work', engine: 'InnoDB' })
export class DayComputerWork {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	date: Date;

    @Column("decimal")
	hours: number;

	@Column()
	operatingSystem: string;

	@ManyToOne(
		() => Computer,
		computer => computer.daysComputerWork,
		{ onDelete: 'RESTRICT', onUpdate: 'RESTRICT' },
	)
	@JoinColumn({ name: 'computer_id', referencedColumnName: 'id' })
	computer: Computer;

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedDate: Date;
}