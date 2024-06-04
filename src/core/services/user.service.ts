import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { IUserOptions, UserPaginationResult } from '../types/user.options';
import { RoleService } from './role.service';
import { CreateUserDto, UpdateUserDto, ReadUserDto } from '../dto/user.dto';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserService  {
	constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
		@InjectRepository(UserRole)
		private userRoleRepository: Repository<UserRole>,
        private roleService: RoleService,
    ) {}

	public async create(
        createUserDto: CreateUserDto,
    ): Promise<User> {
		const existingUser = await this.readOne({ login: createUserDto.login});
		let rolesEntities = [];
    	if(existingUser) {
      		throw new BadRequestException(`User with login ${createUserDto.login} already exist`);
    	}
    	let set = new Set();
    	for(let role of createUserDto.roles) {
      		if(set.has(role)) {
       			throw new BadRequestException(`Role with id=${role} appears 2 or more times`);
      		} else {
        		const existingRole = await this.roleService.readById(role);
        		if(existingRole === null) {
          			throw new NotFoundException(`Role with id=${role} does not exist`);
        		}
				rolesEntities.push(existingRole);
      		}
    	}
        const { roles, ...user } = createUserDto;
        const createdUser = await this.userRepository.save(user);
		createdUser.roles = rolesEntities;
		await this.userRepository.createQueryBuilder()
			.insert()
			.into(UserRole)
			.values(rolesEntities.map(el => ({
				user: createdUser,
				role: el
			})))
			.execute();
		console.log(createdUser);
		return createdUser;
	}

	public async readAll(
        options: IUserOptions,
    ): Promise<UserPaginationResult> {

		const queryBuilder = this.userRepository.createQueryBuilder("user");

		 queryBuilder
		 	.select(['user.id', 'user.login', 'user.password']);
		// 	.from(User, "user");

		if (options.filter) {
			if (options.filter.login) {
				queryBuilder.andWhere('user.login LIKE :login', {
					login: "%" + options.filter.login + "%",
				});
			}
		}

		if(options.pagination) {
			queryBuilder.offset(options.pagination.page * options.pagination.size).limit(options.pagination.size);
		}

		if(options.sorting) {
			queryBuilder.addOrderBy(options.sorting.column, options.sorting.direction);
		}

		const entities = await queryBuilder.getMany();
		const entitiesCount = await queryBuilder.getCount();
		if(options.pagination) {
			const pageCount = Math.floor(entitiesCount / options.pagination.size);
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
    ): Promise<User> {
		const user = await this.userRepository.findOneBy({ id });
		if( user === null ) {
			throw new NotFoundException(`User with id=${id} does not exist`);
		}
		return user;
	}

    public async readOne(
        readUserDto: ReadUserDto,
    ): Promise<User> {
        const user = await this.userRepository.findOneBy({ ...readUserDto });
		return user;
    }

	public async update(
		id: number,
		updateUserDto: UpdateUserDto,
	): Promise<User> {
		const existingUser = await this.readById(id);
      	if(existingUser === null) {
        	throw new NotFoundException(`User with id=${id} does not exist`);
      	}
      	if(updateUserDto.login) {
        	const existingUsers = (await this.readAll({ filter: { login: updateUserDto.login } })).entities;
       		if(existingUsers.length !== 0 && (existingUsers.length > 1 || existingUsers[0].id != id)) {
         		throw new BadRequestException(`User with login ${updateUserDto.login} already exist`);
        	}
      	}
      	const userRoles = (await this.readUserRoles(id))?.map(el => el.id);
      	let set = new Set();
		if(updateUserDto.deletedRoles) {
      		for(let role of updateUserDto.deletedRoles) {
        		if(set.has(role)) {
    	      		throw new BadRequestException(`Role with id=${role} appears 2 or more times`);
	        	} else {
          			const existingRole = await this.roleService.readById(role);
          			if(existingRole === null) {
        	    		throw new NotFoundException(`Role with id=${role} does not exist`);
    	      		}
	          		if(!userRoles.includes(role)) {
            			throw new BadRequestException(`User with id=${id} does not have role with id=${role}`);
          			}
        		}
      		}
		}
		if(updateUserDto.addedRoles) {
      		for(let role of updateUserDto.addedRoles) {
        		if(set.has(role)) {
    	    		throw new BadRequestException(`Role with id=${role} appears 2 or more times`);
	        	} else {
          			const existingRole = await this.roleService.readById(role);
          			if(existingRole === null) {
        	    		throw new NotFoundException(`Role with id=${role} does not exist`);
    	      		}
	          		if(userRoles.includes(role)) {
            			throw new BadRequestException(`User with id=${id} already has role with id=${role}`);
          			}
        		}
      		}
		}
        const {addedRoles, deletedRoles , ...user } = updateUserDto;

		await this.userRepository.update(id, user);
		const updatedUser = await this.readById(id);

		if(deletedRoles !== undefined && deletedRoles.length !== 0) {
			await this.userRoleRepository.createQueryBuilder()
				.softDelete()
				.where("role_id IN (:...roles)", {
					roles: deletedRoles,
				})
				.andWhere("user_id = :userId", {
					userId: id,
				})
				.execute()
		}

		if(addedRoles !== undefined && addedRoles.length !== 0) {
			await this.userRepository.createQueryBuilder()
				.insert()
				.into(UserRole)
				.values((await this.roleService.readAllByIds(addedRoles)).map(el => ({
					user: updatedUser,
					role: el
				})))
				.execute();
		}
		updatedUser.roles = await this.readUserRoles(id);
		return updatedUser;
	}

	public async delete(
        id: number,
    ): Promise<void> {
		const existingUser = await this.readById(id);
    	if(existingUser === null) {
      		throw new NotFoundException(`User with id=${id} does not exist`);
    	}
		await this.userRoleRepository.createQueryBuilder()
			.softDelete()
			.where("user_id = :userId", {
				userId: id
			})
			.andWhere("role_id IN (:...roles)", {
				roles: (await this.readUserRoles(id)).map(el => el.id),
			})
			.execute();
		await this.userRepository.softDelete(id);
	}

	public async readUserRoles(
		id: number,
	): Promise<Role[]> {
		const userRolesEntities = await this.userRoleRepository.find({
			select: ['role'],
			where: {
				user: await this.readById(id),
			},
			relations: ['role'],
		})
		
		return await this.roleService.readAllByIds(userRolesEntities.map(el => el.role.id));
	}

	public async readAllWithRoles(
		options: IUserOptions,
	): Promise<UserPaginationResult> {

		const queryBuilder = this.userRepository.createQueryBuilder("user");

		 queryBuilder
		 	.select(['user.id', 'user.login', 'user.password']);
		// 	.from(User, "user");

		if (options.filter) {
			if (options.filter.login) {
				queryBuilder.andWhere('user.login LIKE :login', {
					login: "%" + options.filter.login + "%",
				});
			}
		}

		if(options.pagination) {
			queryBuilder.offset(options.pagination.page * options.pagination.size).limit(options.pagination.size);
		}

		if(options.sorting) {
			queryBuilder.addOrderBy(options.sorting.column, options.sorting.direction);
		}

		let entities = await queryBuilder.getMany();
		for(let user of entities) {
			user.roles = await this.readUserRoles(user.id);
		}
		const entitiesCount = await queryBuilder.getCount();
		if(options.pagination) {
			const pageCount = Math.floor(entitiesCount / options.pagination.size);
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
}