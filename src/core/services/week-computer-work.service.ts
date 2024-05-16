import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WeekComputerWork } from '../entities/week-computer-work.entity';
import { IWeekComputerWorkOptions } from '../types/week-computer-work.options';
import { CreateWeekComputerWorkDto, UpdateWeekComputerWorkDto, ReadWeekComputerWorkDto } from '../dto/week-computer-work.dto';
import { ComputerService } from './computer.service';
import { StatisticsHoursMember } from '../types/statistics.options';

@Injectable()
export class WeekComputerWorkService  {
	constructor(
        @InjectRepository(WeekComputerWork)
        private weekComputerWorkRepository: Repository<WeekComputerWork>,
		private computerService: ComputerService,
    ) {}

	public async create(
        createWeekComputerWorkDto: CreateWeekComputerWorkDto,
    ): Promise<WeekComputerWork> {
		const { computerId, ...properties } = createWeekComputerWorkDto;
		const computer = await this.computerService.readById(computerId);
		const weekComputerWork = { computer, ...properties };
        return this.weekComputerWorkRepository.save(weekComputerWork);
	}

	public async readAll(
        options: IWeekComputerWorkOptions,
    ): Promise<WeekComputerWork[]> {

		const queryBuilder = this.weekComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['weekComputerWork.id', 'weekComputerWork.date', 'weekComputerWork.computerId', 'weekComputerWork.hours', 'weekComputerWork.operatingSystem'])
			.from(WeekComputerWork, 'weekComputerWork')
            .leftJoin('weekComputerWork.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ]);

		if (options.filter) {
			if (options.filter.date) {
				queryBuilder.andWhere('weekComputerWork.date = :date', {
					date: options.filter.date,
				});
			}
			if (options.filter.hours) {
				queryBuilder.andWhere('weekComputerWork.hours = :hours', {
					hours: options.filter.hours,
				});
			}
			if (options.filter.operatingSystem) {
				queryBuilder.andWhere('weekComputerWork.operatingSystem = :operatingSystem', {
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
    ): Promise<WeekComputerWork> {
		return this.weekComputerWorkRepository.findOneBy({ id });
	}

    public async readOne(
        readWeekComputerWorkDto: ReadWeekComputerWorkDto,
    ): Promise<WeekComputerWork> {
        return this.weekComputerWorkRepository.findOneBy({ ...readWeekComputerWorkDto });
    }

	public async update(
		id: number,
		updateWeekComputerWorkDto: UpdateWeekComputerWorkDto,
	): Promise<WeekComputerWork> {
		const { computerId, ...properties } = updateWeekComputerWorkDto;
		const computer = await this.computerService.readById(computerId);
		const weekComputerWork = { computer, ...properties };
        return (await this.weekComputerWorkRepository.update(id, weekComputerWork)).raw;
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.weekComputerWorkRepository.softDelete(id);
	}

	public async readWorkHours(
        dates: Date[],
    ): Promise<StatisticsHoursMember[]> {

		const queryBuilder = this.weekComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['weekComputerWork.computerId', 'weekComputerWork.hours'])
			.from(WeekComputerWork, 'weekComputerWork')
            .leftJoin('weekComputerWork.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ])
			.andWhere('weekComputerWork.date IN (:...dates)', {
				dates: dates,
			})
			.groupBy('weekComputerWork.computer');
		
		const computersArray = await queryBuilder.getMany();

		const computers = computersArray.map(el => ({
			computer: el.computer,
			hours: el.hours,
		}))

		return computers;
	}
}