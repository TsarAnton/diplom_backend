import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { IUserOptions } from '../types/user.options';
import { RoleService } from './role.service';
import { CreateUserDto, UpdateUserDto, ReadUserDto } from '../dto/user.dto';

@Injectable()
export class UserService  {
	constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private roleService: RoleService,
    ) {}

	public async create(
        createUserDto: CreateUserDto,
    ): Promise<User> {
        const { roles, ...properties } = createUserDto;
        const rolesEntities = await this.roleService.readAllByIds(roles);
        const user = { ...properties, rolesEntities };
        return this.userRepository.save(user);
	}

	public async readAll(
        options: IUserOptions,
    ): Promise<User[]> {

		const queryBuilder = this.userRepository.createQueryBuilder();

		queryBuilder
			.select(['user.id', 'user.login', 'user.password'])
			.from(User, 'user');

		if (options.filter) {
			if (options.filter.login) {
				queryBuilder.andWhere('user.login = :login', {
					login: options.filter.login,
				});
			}
			if(options.filter.roles) {
				// if(typeof options.filter.roles === "string") {
				// 	queryBuilder.andWhere('computer.id = :roles', {
				// 		roles: Number(options.filter.roles),
				// 	});
				// } else {
					queryBuilder.andWhere('computer.id IN (:...roles)', {
						roles: options.filter.roles, //options.filter.roles.map(id => Number(id)),
					});
				// }
			}
		}

		if(options.sorting) {
			queryBuilder.orderBy(options.sorting.column, options.sorting.direction);
		}

		if(options.pagination) {
			queryBuilder.skip(options.pagination.page * options.pagination.size).take(options.pagination.size);
		}

		return await queryBuilder.getMany();
	}

	public async readById(
        id: number,
    ): Promise<User> {
		return this.userRepository.findOneBy({ id });
	}

    public async readOne(
        readUserDto: ReadUserDto,
    ): Promise<User> {
        return this.userRepository.findOneBy({ ...readUserDto });
    }

	public async update(
		id: number,
		updateUserDto: UpdateUserDto,
	): Promise<User> {
        const {roles, ...properties } = updateUserDto;
        const rolesEntities = await this.roleService.readAllByIds(roles);
        const user = { rolesEntities, ...properties };
		await this.userRepository.update(id, user);
		return this.readById(id);
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.userRepository.softDelete(id);
	}
}