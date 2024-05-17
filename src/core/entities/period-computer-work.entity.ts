import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Computer } from './computer.entity';

@Entity({ name: 'period_computer_work', engine: 'InnoDB' })
export class PeriodComputerWork {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	dateStart: Date;

    @Column()
	dateEnd: Date;

    @Column()
	operatingSystem: string;

	@Column()
	loginId: string;

	@ManyToOne(
		() => Computer,
		computer => computer.periodsComputerWork,
		{ onDelete: 'RESTRICT', onUpdate: 'RESTRICT' },
	)
	@JoinColumn({ name: 'computer_id', referencedColumnName: 'id' })
	computer: Computer;

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedDate: Date;
}