import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MonthComputerWork } from '../entities/month-computer-work.entity';
import { IMonthComputerWorkOptions } from '../types/month-computer-work.options';
import { CreateMonthComputerWorkDto, UpdateMonthComputerWorkDto, ReadMonthComputerWorkDto } from '../dto/month-computer-work.dto';
import { ComputerService } from './computer.service';
import { StatisticsHoursMember } from '../types/statistics.options';

@Injectable()
export class MonthComputerWorkService  {
	constructor(
        @InjectRepository(MonthComputerWork)
        private monthComputerWorkRepository: Repository<MonthComputerWork>,
		private computerService: ComputerService,
    ) {}

	public async create(
        createMonthComputerWorkDto: CreateMonthComputerWorkDto,
    ): Promise<MonthComputerWork> {
		const { computerId, ...properties } = createMonthComputerWorkDto;
		const computer = await this.computerService.readById(computerId);
    	if(computer === null) {
      		throw new BadRequestException(`Computer with id=${createMonthComputerWorkDto.computerId} does not exist`);
    	}
		const monthComputerWork = { computer, ...properties };
        return this.monthComputerWorkRepository.save(monthComputerWork);
	}

	public async readAll(
        options: IMonthComputerWorkOptions,
    ): Promise<MonthComputerWork[]> {

		const queryBuilder = this.monthComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['monthComputerWork.id', 'monthComputerWork.date', 'monthComputerWork.computerId', 'monthComputerWork.hours', 'monthComputerWork.operatingSystem'])
			.from(MonthComputerWork, 'monthComputerWork')
            .leftJoin('monthComputerWork.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ]);

		if (options.filter) {
			if (options.filter.date) {
				queryBuilder.andWhere('monthComputerWork.date = :date', {
					date: options.filter.date,
				});
			}
			if (options.filter.hours) {
				queryBuilder.andWhere('monthComputerWork.hours = :hours', {
					hours: options.filter.hours,
				});
			}
			if (options.filter.operatingSystem) {
				queryBuilder.andWhere('monthComputerWork.operatingSystem = :operatingSystem', {
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
    ): Promise<MonthComputerWork> {
		const monthComputerWork = await this.monthComputerWorkRepository.findOneBy({ id });
		if( monthComputerWork === null ) {
			throw new NotFoundException(`MonthComputerWork with id=${id} does not exist`);
		}
		return monthComputerWork;
	}

    public async readOne(
        readMonthComputerWorkDto: ReadMonthComputerWorkDto,
    ): Promise<MonthComputerWork> {
		return await this.monthComputerWorkRepository.findOne({
			select: ['id', 'computer', 'date', 'operatingSystem', 'hours'],
			where: {
				computer: await this.computerService.readById(readMonthComputerWorkDto.computerId),
				date: readMonthComputerWorkDto.date,
				operatingSystem: readMonthComputerWorkDto.operatingSystem,
			},
			relations: ['computer'],
		})
        //return this.monthComputerWorkRepository.findOneBy({ ...readMonthComputerWorkDto });
    }

	public async update(
		id: number,
		updateMonthComputerWorkDto: UpdateMonthComputerWorkDto,
	): Promise<MonthComputerWork> {
		const existingMonthComputerWork = await this.readById(id);
      	if(existingMonthComputerWork === null) {
       		throw new NotFoundException(`MonthComputerWork with id=${id} does not exist`);
      	}
		const { computerId, ...properties } = updateMonthComputerWorkDto;
		if(computerId) {
			const computer = await this.computerService.readById(computerId);
			if(computer === null) {
				throw new BadRequestException(`Computer with id=${computerId} does not exist`);
			  }
			const monthComputerWork = { computer, ...properties };
			await this.monthComputerWorkRepository.update(id, monthComputerWork);
		} else {
			await this.monthComputerWorkRepository.update(id, { ...properties });
		}
		return this.readById(id);
	}

	public async delete(
        id: number,
    ): Promise<void> {
		const existingMonthComputerWork = await this.readById(id);
    	if(existingMonthComputerWork === null) {
      		throw new NotFoundException(`MonthComputerWork with id=${id} does not exist`);
    	}
		await this.monthComputerWorkRepository.softDelete(id);
	}

	public async readWorkHours(
        dates: Date[],
		computerIds: number[],
    ): Promise<StatisticsHoursMember[]> {

		const queryBuilder = this.monthComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['monthComputerWork.computerId', 'monthComputerWork.hours'])
			.from(MonthComputerWork, 'monthComputerWork')
            .leftJoin('monthComputerWork.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ])
			.andWhere('computer.id IN (:...computers)', {
				computers: computerIds,
			})
			.andWhere('monthComputerWork.date IN (:...dates)', {
				dates: dates,
			})
			.groupBy('monthComputerWork.computer');
		
		const computersArray = await queryBuilder.getMany();

		const computers = computersArray.map(el => ({
			computer: el.computer,
			hours: el.hours,
		}))

		return computers;
	}
}