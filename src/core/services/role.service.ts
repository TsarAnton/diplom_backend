import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../entities/role.entity';
import { IRoleOptions, RolePaginationResult } from '../types/role.options';
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
		const existingRole = await this.readOne({ name: createRoleDto.name});
    	if(existingRole) {
      		throw new BadRequestException(`Role with name ${createRoleDto.name} already exist`);
    	}
        return this.roleRepository.save(createRoleDto);
	}

	public async readAll(
        options: IRoleOptions,
    ): Promise<RolePaginationResult> {

		const queryBuilder = this.roleRepository.createQueryBuilder("role");

		queryBuilder
			.select(['role.id', 'role.name']);
			//.from(Role, 'role');

		if (options.filter) {
			if (options.filter.name) {
				queryBuilder.andWhere('role.name LIKE :name', {
					name: "%" + options.filter.name + "%",
				});
			}
		}

		if(options.sorting) {
			queryBuilder.orderBy(options.sorting.column, options.sorting.direction);
		}

		if(options.pagination) {
			queryBuilder.skip(options.pagination.page * options.pagination.size).take(options.pagination.size);
		}

		const entities = await queryBuilder.getMany();
		const entitiesCount = await queryBuilder.getCount();
		if(options.pagination) {
			const pageCount = Math.floor(entitiesCount / options.pagination.size) - ((entitiesCount % +options.pagination.size === 0) ? 1: 0);
			return {
				meta: {
					page: +options.pagination.page,
					maxPage: pageCount,
					entitiesCount: pageCount === +options.pagination.page ? (entitiesCount % +options.pagination.size) : +options.pagination.size,
				},
				entities: entities,
			};
		}
		return {
			meta: null,
			entities: entities,
		};
	}

	public async readById(
        id: number,
    ): Promise<Role> {
		const role = await this.roleRepository.findOneBy({ id });
		if( role === null ) {
			throw new NotFoundException(`Role with id=${id} does not exist`);
		}
		return role;
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
		const existingRole = await this.readById(id);
      	if(existingRole === null) {
        	throw new NotFoundException(`Role with id=${id} does not exist`);
      	}
      	if(updateRoleDto.name) {
        	const existingRoles = (await this.readAll({ filter: { name: updateRoleDto.name } })).entities;
        	if(existingRoles.length !== 0 && (existingRoles.length > 1 || existingRoles[0].id != id)) {
          		throw new BadRequestException(`Role with name ${updateRoleDto.name} already exist`);
        	}
      	}
		await this.roleRepository.update(id, updateRoleDto);
		return this.readById(id);
	}

	public async delete(
        id: number,
    ): Promise<void> {
		const existingRole = await this.readById(id);
    	if(existingRole === null) {
      		throw new NotFoundException(`Role with id=${id} does not exist`);
    	}
		await this.roleRepository.softDelete(id);
	}

    public async readAllByIds(
        ids: number[],
    ): Promise<Role[]> {

		if(ids.length === 0) {
			return [];
		}
		
		const queryBuilder = this.roleRepository.createQueryBuilder();

		queryBuilder
			.select(['role.id', 'role.name'])
			.from(Role, 'role')
            .where('role.id IN (:...ids)', {
                ids: ids,
            });

		return await queryBuilder.getMany();
	}
}