import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Computer } from './computer.entity';

@Entity({ name: 'log_windows', engine: 'InnoDB' })
export class LogWindows {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	type: boolean;

	@Column()
	date: Date;

    @Column({ name: 'login_id', length: 15 })
	loginId: string;

	@Column({ name: 'operating_system', length: 50 })
	operatingSystem: string;

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