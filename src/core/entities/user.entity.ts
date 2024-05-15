import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';

import { Role } from './role.entity';

@Entity({ name: 'user', engine: 'InnoDB' })
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 100, unique: true })
	login: string;

    @Column({ length: 100 })
	password: string;

    @ManyToMany(() => Role)
    @JoinTable()
    roles: Role[];

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedDate: Date;
}