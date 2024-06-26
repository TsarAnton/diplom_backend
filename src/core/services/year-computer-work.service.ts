import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { YearComputerWork } from '../entities/year-computer-work.entity';
import { IYearComputerWorkOptions, YearComputerWorkPaginationResult } from '../types/year-computer-work.options';
import { CreateYearComputerWorkDto, UpdateYearComputerWorkDto, ReadYearComputerWorkDto } from '../dto/year-computer-work.dto';
import { ComputerService } from './computer.service';
import { StatisticsHoursMember } from '../types/statistics.options';

@Injectable()
export class YearComputerWorkService  {
	constructor(
        @InjectRepository(YearComputerWork)
        private yearComputerWorkRepository: Repository<YearComputerWork>,
		private computerService: ComputerService,
    ) {}

	public async create(
        createYearComputerWorkDto: CreateYearComputerWorkDto,
    ): Promise<YearComputerWork> {
		const { computerId, ...properties } = createYearComputerWorkDto;
		const computer = await this.computerService.readById(computerId);
    	if(computer === null) {
      		throw new BadRequestException(`Computer with id=${computerId} does not exist`);
    	}
		const yearComputerWork = { computer, ...properties };
        return this.yearComputerWorkRepository.save(yearComputerWork);
	}

	public async readAll(
        options: IYearComputerWorkOptions,
    ): Promise<YearComputerWorkPaginationResult> {

		const queryBuilder = this.yearComputerWorkRepository.createQueryBuilder("yearComputerWork");

		queryBuilder
			.select(['yearComputerWork.id', 'yearComputerWork.date', 'yearComputerWork.operatingSystem'])
			//.from(YearComputerWork, 'yearComputerWork')
            .leftJoin('yearComputerWork.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ]);

		if (options.filter) {
			if (options.filter.date) {
				queryBuilder.andWhere('yearComputerWork.date = :date', {
					date: options.filter.date,
				});
			}
			if (options.filter.dateStart) {
				queryBuilder.andWhere('yearComputerWork.date >= :dateStart', {
					dateStart: options.filter.dateStart,
				});
			}
			if (options.filter.dateEnd) {
				queryBuilder.andWhere('yearComputerWork.date <= :dateEnd', {
					date: options.filter.dateEnd,
				});
			}
            if (options.filter.operatingSystem) {
				queryBuilder.andWhere('yearComputerWork.operatingSystem LIKE :operatingSystem', {
					operatingSystem: "%" + options.filter.operatingSystem + "%",
				});
			}
			if(options.filter.computers) {
				if(typeof options.filter.computers === "string") {
					queryBuilder.andWhere('computer.id = :computers', {
						computers: Number(options.filter.computers),
					});
				} else {
					queryBuilder.andWhere('computer.id IN (:...computers)', {
						computers: options.filter.computers, //options.filter.computers.map(id => Number(id)),
					});
				}
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
    ): Promise<YearComputerWork> {
		const yearComputerWork = await this.yearComputerWorkRepository.findOneBy({ id });
		if( yearComputerWork === null ) {
			throw new NotFoundException(`YearComputerWork with id=${id} does not exist`);
		}
		return yearComputerWork;
	}

    public async readOne(
        readYearComputerWorkDto: ReadYearComputerWorkDto,
    ): Promise<YearComputerWork> {
		return await this.yearComputerWorkRepository.findOne({
			select: ['id', 'computer', 'date', 'operatingSystem', 'hours'],
			where: {
				computer: await this.computerService.readById(readYearComputerWorkDto.computerId),
				date: readYearComputerWorkDto.date,
				operatingSystem: readYearComputerWorkDto.operatingSystem,
			},
			relations: ['computer'],
		})
        //return this.yearComputerWorkRepository.findOneBy({ ...readYearComputerWorkDto });
    }

	public async update(
		id: number,
		updateYearComputerWorkDto: UpdateYearComputerWorkDto,
	): Promise<YearComputerWork> {
		const existingYearComputerWork = await this.readById(id);
      	if(existingYearComputerWork === null) {
        	throw new NotFoundException(`YearComputerWork with id=${id} does not exist`);
      	}
		const { computerId, ...properties } = updateYearComputerWorkDto;
		if(computerId) {
			const computer = await this.computerService.readById(computerId);
			if(computer === undefined) {
				throw new BadRequestException(`Computer with id=${computerId} does not exist`);
			}
			const yearComputerWork = { computer, ...properties };
			await this.yearComputerWorkRepository.update(id, yearComputerWork);
		} else {
			await this.yearComputerWorkRepository.update(id, { ...properties });
		}
		return this.readById(id);
	}

	public async delete(
        id: number,
    ): Promise<void> {
		const existingYearComputerWork = await this.readById(id);
    	if(existingYearComputerWork === null) {
      		throw new NotFoundException(`YearComputerWork with id=${id} does not exist`);
    	}
		await this.yearComputerWorkRepository.softDelete(id);
	}
}