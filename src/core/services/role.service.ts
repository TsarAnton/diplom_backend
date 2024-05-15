import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../entities/role.entity';
import { IRoleOptions } from '../types/role.options';
import { CreateRoleDto, UpdateRoleDto, ReadRoleDto } from '../dto/role.dto';

@Injectable()
export class RoleService  {
	constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) {}

	public async create(
        createRoleDto: CreateRoleDto,
    ): Promise<Role> {
        return this.roleRepository.save(createRoleDto);
	}

	public async readAll(
        options: IRoleOptions,
    ): Promise<Role[]> {

		const queryBuilder = this.roleRepository.createQueryBuilder();

		queryBuilder
			.select(['role.id', 'role.name'])
			.from(Role, 'role');

		if (options.filter) {
			if (options.filter.name) {
				queryBuilder.andWhere('role.name = :name', {
					name: options.filter.name,
				});
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
    ): Promise<Role> {
		return this.roleRepository.findOneBy({ id });
	}

    public async readOne(
        readRoleDto: ReadRoleDto,
    ): Promise<Role> {
        return this.roleRepository.findOneBy({ ...readRoleDto });
    }

	public async update(
		id: number,
		updateRoleDto: UpdateRoleDto,
	): Promise<Role> {
		await this.roleRepository.update(id, updateRoleDto);
		return this.readById(id);
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.roleRepository.softDelete(id);
	}

    public async readAllByIds(
        ids: number[],
    ): Promise<Role[]> {

		const queryBuilder = this.roleRepository.createQueryBuilder();

		queryBuilder
			.select(['role.id', 'role.name'])
			.from(Role, 'role')
            .andWhere('role.id IN (:...ids)', {
                ids: ids,
            });

		return await queryBuilder.getMany();
	}
}