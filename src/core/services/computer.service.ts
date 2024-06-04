import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Computer } from '../entities/computer.entity';
import { IComputerOptions } from '../types/computer.options';
import { CreateComputerDto, UpdateComputerDto, ReadComputerDto } from '../dto/computer.dto';

@Injectable()
export class ComputerService  {
	constructor(
        @InjectRepository(Computer)
        private computerRepository: Repository<Computer>,
    ) {}

	public async create(
        createComputerDto: CreateComputerDto,
    ): Promise<Computer> {
		const existingComputer = await this.readOne({ macAddress: createComputerDto.macAddress});
    	if(existingComputer) {
      		throw new BadRequestException(`Computer with mac-address ${existingComputer.macAddress} already exist`);
    	}
        return this.computerRepository.save(createComputerDto);
	}

	public async readAll(
        options: IComputerOptions,
    ): Promise<Computer[]> {

		const queryBuilder = this.computerRepository.createQueryBuilder();

		queryBuilder
			.select(['computer.id', 'computer.name', 'computer.macAddress', 'computer.ipAddress', 'computer.audince'])
			.from(Computer, 'computer');

		if (options.filter) {
			if (options.filter.name) {
				queryBuilder.andWhere('computer.name LIKE :name', {
					name: "%" + options.filter.name + "%",
				});
			}
			if (options.filter.macAddress) {
				queryBuilder.andWhere('computer.macAddress = :macAddress', {
					macAddress: options.filter.macAddress,
				});
			}
            if (options.filter.ipAddress) {
				queryBuilder.andWhere('computer.ipAddress = :ipAddress', {
					ipAddress: options.filter.ipAddress,
				});
			}
            if (options.filter.audince) {
				queryBuilder.andWhere('computer.audince = :audince', {
					audince: options.filter.audince,
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
    ): Promise<Computer> {
		const computer = await this.computerRepository.findOneBy({ id });
		if( computer === null ) {
			throw new NotFoundException(`Computer with id=${id} does not exist`);
		}
		return computer;
	}

    public async readOne(
        readComputerDto: ReadComputerDto,
    ): Promise<Computer> {
        return this.computerRepository.findOneBy({ ...readComputerDto });
    }

	public async update(
		id: number,
		updateComputerDto: UpdateComputerDto,
	): Promise<Computer> {
		const existingComputer = await this.readById(id);
      	if(existingComputer === null) {
        	throw new NotFoundException(`Computer with id=${id} does not exist`);
      	}
      	if(updateComputerDto.macAddress) {
        	const existingComputers = await this.readAll({ filter: { macAddress: updateComputerDto.macAddress } });
        	if(existingComputers.length !== 0 && (existingComputers.length > 1 || existingComputers[0].id != id)) {
          		throw new BadRequestException(`Computer with mac-address ${updateComputerDto.macAddress} already exist`);
        	}
      	}
		await this.computerRepository.update(id, updateComputerDto);
		return this.readById(id);
	}

	public async delete(
        id: number,
    ): Promise<void> {
		const existingComputer = await this.readById(id);
    	if(existingComputer === null) {
      		throw new NotFoundException(`Computer with id=${id} does not exist`);
    	}
		await this.computerRepository.softDelete(id);
	}
}