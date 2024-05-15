import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'role', engine: 'InnoDB' })
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 100, unique: true })
	name: string;

    @ManyToMany(() => User)
    users: User[];

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedDate: Date;
}