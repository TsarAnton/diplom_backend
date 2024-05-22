import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';

import { User } from './user.entity';
import { UserRole } from './user-role.entity';

@Entity({ name: 'role', engine: 'InnoDB' })
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 100, unique: true })
	name: string;

    @OneToMany(
		() => UserRole,
		userRole => userRole.role,
	)
	roleUsers: UserRole[];

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedDate: Date;
}