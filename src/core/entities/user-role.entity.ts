import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Role } from './role.entity';
import { User } from './user.entity';

@Entity({ name: 'user_role', engine: 'InnoDB' })
export class UserRole {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(
		() => Role,
		role => role.roleUsers,
		{ onDelete: 'RESTRICT', onUpdate: 'RESTRICT' },
	)
	@JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
	role: Role;

	@ManyToOne(
		() => User,
		user => user.userRoles,
		{ onDelete: 'RESTRICT', onUpdate: 'RESTRICT' },
	)
	@JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
	user: User;

	@DeleteDateColumn({ name: 'deleted_date', type: 'timestamp' })
	deletedAt: Date;
}