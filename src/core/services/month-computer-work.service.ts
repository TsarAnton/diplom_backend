import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MonthComputerWork } from '../entities/month-computer-work.entity';
import { IMonthComputerWorkOptions, MonthComputerWorkPaginationResult } from '../types/month-computer-work.options';
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
    ): Promise<MonthComputerWorkPaginationResult> {

		const queryBuilder = this.monthComputerWorkRepository.createQueryBuilder("monthComputerWork");

		queryBuilder
			.select(['monthComputerWork.id', 'monthComputerWork.date', 'monthComputerWork.operatingSystem'])
			//.from(MonthComputerWork, 'monthComputerWork')
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
			if (options.filter.dateStart) {
				queryBuilder.andWhere('monthComputerWork.date >= :dateStart', {
					dateStart: options.filter.dateStart,
				});
			}
			if (options.filter.dateEnd) {
				queryBuilder.andWhere('monthComputerWork.date <= :dateEnd', {
					date: options.filter.dateEnd,
				});
			}
            if (options.filter.operatingSystem) {
				queryBuilder.andWhere('monthComputerWork.operatingSystem LIKE :operatingSystem', {
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
		operatingSystem: string,
    ): Promise<StatisticsHoursMember[]> {

		const queryBuilder = this.monthComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select('monthComputerWork.hours')
			.from(MonthComputerWork, 'monthComputerWork')
            .leftJoin('monthComputerWork.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ])
			.where('monthComputerWork.date IN (:...dates)', {
				dates: dates,
			});

        if (operatingSystem) {
			queryBuilder.andWhere('monthComputerWork.operatingSystem LIKE :operatingSystem', {
				operatingSystem: "%" + operatingSystem + "%",
			});
		}
		if(computerIds.length !== 0) {
			queryBuilder.andWhere('computer.id IN (:...computers)', {
				computers: computerIds, //options.filter.computers.map(id => Number(id)),
			});
		}

		queryBuilder.orderBy('computer.id', 'ASC');

		const computersArray = await queryBuilder.getMany();

		if(computersArray.length === 0) {
			return [];
		}

		let currentComputerId = computersArray[0].computer.id;
		let statisticsHoursMember = new StatisticsHoursMember();
		statisticsHoursMember.computer = computersArray[0].computer;
		statisticsHoursMember.hours = 0;

		let result = [];

		for(let el of computersArray) {
			if(currentComputerId !== el.computer.id) {
				result.push(statisticsHoursMember);
				statisticsHoursMember = new StatisticsHoursMember();
				statisticsHoursMember.computer = el.computer;
				statisticsHoursMember.hours = 0;
			}
			statisticsHoursMember.hours += el.hours;
		}
		result.push(statisticsHoursMember);

		return result;
	}
}