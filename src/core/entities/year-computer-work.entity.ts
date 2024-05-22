import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Computer } from './computer.entity';

@Entity({ name: 'year_computer_work', engine: 'InnoDB' })
export class YearComputerWork {
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
		computer => computer.yearsComputerWork,
		{ onDelete: 'RESTRICT', onUpdate: 'RESTRICT' },
	)
	@JoinColumn({ name: 'computer_id', referencedColumnName: 'id' })
	computer: Computer;

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedDate: Date;
}