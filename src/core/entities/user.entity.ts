import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';

import { Role } from './role.entity';
import { UserRole } from './user-role.entity';

@Entity({ name: 'user', engine: 'InnoDB' })
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 100, unique: true })
	login: string;

    @Column({ length: 100 })
	password: string;

    @OneToMany(
		() => UserRole,
		userRole => userRole.user,
	)
	userRoles: UserRole[];

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedDate: Date;

	roles: Role[];
}