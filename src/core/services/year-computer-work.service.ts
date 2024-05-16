import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { YearComputerWork } from '../entities/year-computer-work.entity';
import { IYearComputerWorkOptions } from '../types/year-computer-work.options';
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
		const yearComputerWork = { computer, ...properties };
        return this.yearComputerWorkRepository.save(yearComputerWork);
	}

	public async readAll(
        options: IYearComputerWorkOptions,
    ): Promise<YearComputerWork[]> {

		const queryBuilder = this.yearComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['yearComputerWork.id', 'yearComputerWork.date', 'yearComputerWork.computerId', 'yearComputerWork.hours', 'yearComputerWork.operatingSystem'])
			.from(YearComputerWork, 'yearComputerWork')
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
			if (options.filter.hours) {
				queryBuilder.andWhere('yearComputerWork.hours = :hours', {
					hours: options.filter.hours,
				});
			}
			if (options.filter.operatingSystem) {
				queryBuilder.andWhere('yearComputerWork.operatingSystem = :operatingSystem', {
					operatingSystem: options.filter.operatingSystem,
				});
			}
			if(options.filter.computers) {
				// if(typeof options.filter.computers === "string") {
				// 	queryBuilder.andWhere('computer.id = :computers', {
				// 		computers: Number(options.filter.computers),
				// 	});
				// } else {
					queryBuilder.andWhere('computer.id IN (:...computers)', {
						computers: options.filter.computers, //options.filter.computers.map(id => Number(id)),
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
    ): Promise<YearComputerWork> {
		return this.yearComputerWorkRepository.findOneBy({ id });
	}

    public async readOne(
        readYearComputerWorkDto: ReadYearComputerWorkDto,
    ): Promise<YearComputerWork> {
        return this.yearComputerWorkRepository.findOneBy({ ...readYearComputerWorkDto });
    }

	public async update(
		id: number,
		updateYearComputerWorkDto: UpdateYearComputerWorkDto,
	): Promise<YearComputerWork> {
		const { computerId, ...properties } = updateYearComputerWorkDto;
		const computer = await this.computerService.readById(computerId);
		const yearComputerWork = { computer, ...properties };
		//await this.yearComputerWorkRepository.update(id, yearComputerWork);
		return (await this.yearComputerWorkRepository.update(id, yearComputerWork)).raw;
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.yearComputerWorkRepository.softDelete(id);
	}

	public async readWorkHours(
        dates: Date[],
    ): Promise<StatisticsHoursMember[]> {

		const queryBuilder = this.yearComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['yearComputerWork.computerId', 'yearComputerWork.hours'])
			.from(YearComputerWork, 'yearComputerWork')
            .leftJoin('yearComputerWork.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ])
			.andWhere('yearComputerWork.date IN (:...dates)', {
				dates: dates,
			})
			.groupBy('yearComputerWork.computer');
		
		const computersArray = await queryBuilder.getMany();

		const computers = computersArray.map(el => ({
			computer: el.computer,
			hours: el.hours,
		}))

		return computers;
	}
}