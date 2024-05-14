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
				queryBuilder.andWhere('computer.name = :name', {
					name: options.filter.name,
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
		return this.computerRepository.findOneBy({ id });
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
		await this.computerRepository.update(id, updateComputerDto);
		return this.readById(id);
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.computerRepository.softDelete(id);
	}
}