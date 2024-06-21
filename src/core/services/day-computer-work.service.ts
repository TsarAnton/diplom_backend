import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DayComputerWork } from '../entities/day-computer-work.entity';
import { DayComputerWorkPaginationResult, IDayComputerWorkOptions } from '../types/day-computer-work.options';
import { CreateDayComputerWorkDto, UpdateDayComputerWorkDto, ReadDayComputerWorkDto } from '../dto/day-computer-work.dto';
import { ComputerService } from './computer.service';
import { ReadStatisticsDto } from '../dto/statistics.dto';
import { ReadStatisticsHours, StatisticsHours, StatisticsHoursMember } from '../types/statistics.options';
import { Computer } from '../entities/computer.entity';

@Injectable()
export class DayComputerWorkService  {
	constructor(
        @InjectRepository(DayComputerWork)
        private dayComputerWorkRepository: Repository<DayComputerWork>,
		private computerService: ComputerService,
		@InjectRepository(Computer)
        private computerRepository: Repository<Computer>,
    ) {}

	public async create(
        createDayComputerWorkDto: CreateDayComputerWorkDto,
    ): Promise<DayComputerWork> {
		const { computerId, ...properties } = createDayComputerWorkDto;
		const computer = await this.computerService.readById(computerId);
		if(computer === null) {
			throw new BadRequestException(`Computer with id=${computerId} does not exist`);
		}
		const dayComputerWork = { computer, ...properties };
        return this.dayComputerWorkRepository.save(dayComputerWork);
	}

	public async readAll(
        options: IDayComputerWorkOptions,
    ): Promise<DayComputerWorkPaginationResult> {

		const queryBuilder = this.dayComputerWorkRepository.createQueryBuilder("dayComputerWork");

		queryBuilder
			.select(['dayComputerWork.id', 'dayComputerWork.date', 'dayComputerWork.operatingSystem'])
			//.from(DayComputerWork, 'dayComputerWork')
            .leftJoin('dayComputerWork.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ]);

		if (options.filter) {
			if (options.filter.date) {
				queryBuilder.andWhere('dateComputerWork.date = :date', {
					date: options.filter.date,
				});
			}
			if (options.filter.dateStart) {
				queryBuilder.andWhere('dayComputerWork.date >= :dateStart', {
					dateStart: options.filter.dateStart,
				});
			}
			if (options.filter.dateEnd) {
				queryBuilder.andWhere('dayComputerWork.date <= :dateEnd', {
					date: options.filter.dateEnd,
				});
			}
            if (options.filter.operatingSystem) {
				queryBuilder.andWhere('dayComputerWork.operatingSystem LIKE :operatingSystem', {
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
    ): Promise<DayComputerWork> {
		const dayComputerWork = await this.dayComputerWorkRepository.findOneBy({ id });
		if( dayComputerWork === null ) {
			throw new NotFoundException(`DayComputerWork with id=${id} does not exist`);
		}
		return dayComputerWork;
	}

    public async readOne(
        readDayComputerWorkDto: ReadDayComputerWorkDto,
    ): Promise<DayComputerWork> {
		return await this.dayComputerWorkRepository.findOne({
			select: ['id', 'computer', 'date', 'operatingSystem', 'hours'],
			where: {
				computer: await this.computerService.readById(readDayComputerWorkDto.computerId),
				date: readDayComputerWorkDto.date,
				operatingSystem: readDayComputerWorkDto.operatingSystem,
			},
			relations: ['computer'],
		})
        //return this.dayComputerWorkRepository.findOneBy({ ...readDayComputerWorkDto });
    }

	public async update(
		id: number,
		updateDayComputerWorkDto: UpdateDayComputerWorkDto,
	): Promise<DayComputerWork> {
		const existingDayComputerWork = await this.readById(id);
      	if(existingDayComputerWork === null) {
        	throw new NotFoundException(`DayComputerWork with id=${id} does not exist`);
      	}
		const { computerId, ...properties } = updateDayComputerWorkDto;
		if(computerId) {
			const computer = await this.computerService.readById(computerId);
			if(computer === null) {
				throw new BadRequestException(`Computer with id=${computerId} does not exist`);
			}
			const dayComputerWork = { computer, ...properties };
			await this.dayComputerWorkRepository.update(id, dayComputerWork);
		} else {
			await this.dayComputerWorkRepository.update(id, { ...properties });
		}
		return this.readById(id);
	}

	public async delete(
        id: number,
    ): Promise<void> {
		const existingDayComputerWork = await this.readById(id);
    	if(existingDayComputerWork === null) {
      		throw new NotFoundException(`DayComputerWork with id=${id} does not exist`);
    	}
		await this.dayComputerWorkRepository.softDelete(id);
	}

	public async readWorkHours(
        options: ReadStatisticsHours,
    ): Promise<StatisticsHours> {

		const queryBuilder = this.computerRepository.createQueryBuilder("computer");

		queryBuilder
			.select(['computer.id', 'computer.name', 'computer.macAddress', 'computer.ipAddress', 'computer.audince']);

			if(options.datesDay.length !== 0) {
				queryBuilder.leftJoin('computer.daysComputerWork', 'daysComputerWork', 'daysComputerWork.date IN (:...dates)', {
					dates: options.datesDay,
				})
				.andWhere("(daysComputerWork.hours <> 0" + ((options.datesYear.length === 0 && options.datesMonth.length === 0) ? ")" : ""))
				.addSelect(['daysComputerWork.hours', 'daysComputerWork.date']);
			}
			if(options.datesMonth.length !== 0) {
				queryBuilder.leftJoin('computer.monthsComputerWork', 'monthsComputerWork', 'monthsComputerWork.date IN (:...dates2)', {
					dates2: options.datesMonth,
				})
				.addSelect(['monthsComputerWork.hours', 'monthsComputerWork.date']);
				if(options.datesDay.length === 0) {
					queryBuilder.andWhere("(monthsComputerWork.hours <> 0" + (options.datesYear.length === 0 ? ")" : ""));
				} else {
					queryBuilder.orWhere("monthsComputerWork.hours <> 0" + (options.datesYear.length === 0 ? ")" : ""));
				}
			}
			if(options.datesYear.length !== 0) {
				queryBuilder.leftJoin('computer.yearsComputerWork', 'yearsComputerWork', 'yearsComputerWork.date IN (:...dates3)', {
					dates3: options.datesYear,
				})
				.addSelect(['yearsComputerWork.hours', 'yearsComputerWork.date']);
				if(options.datesMonth.length === 0 && options.datesDay.length === 0) {
					queryBuilder.andWhere("(yearsComputerWork.hours <> 0)");
				} else {
					queryBuilder.orWhere("yearsComputerWork.hours <> 0)");
				}
			}

            if (options.operatingSystem) {
				queryBuilder.andWhere('dayComputerWork.operatingSystem LIKE :operatingSystem', {
					operatingSystem: "%" + options.operatingSystem + "%",
				});
			}
			if(options.computerIds.length !== 0) {
				queryBuilder.andWhere('computer.id IN (:...computers)', {
					computers: options.computerIds,
			});
		}

		if(options.sorting) {
			queryBuilder.orderBy(options.sorting.column, options.sorting.direction);
		}

		if(options.pagination) {
			queryBuilder.skip(options.pagination.page * options.pagination.size).take(options.pagination.size);
		}

		const entities = await queryBuilder.getMany();
		const entitiesCount = await queryBuilder.getCount();

		const computersArray = entities.map(function(el) {
			let computer = new Computer;
			computer.name = el.name;
			computer.macAddress = el.macAddress;
			computer.ipAddress = el.ipAddress;
			computer.audince = el.audince;
			computer.id = el.id;
			const dayHours = el.daysComputerWork ? el.daysComputerWork.reduce((acc, el1) => acc + Number(el1.hours), 0) : 0;
			const monthHours = el.monthsComputerWork ? el.monthsComputerWork.reduce((acc, el1) => acc + Number(el1.hours), 0) : 0;
			const yearHours = el.yearsComputerWork ? el.yearsComputerWork.reduce((acc, el1) => acc + Number(el1.hours), 0) : 0;
 			return {
				computer: computer,
				hours: Number((dayHours + monthHours + yearHours).toFixed(4)),
			}
		});

		if(options.pagination) {
			const pageCount = Math.floor(entitiesCount / options.pagination.size) - ((entitiesCount % +options.pagination.size === 0) ? 1: 0);
			return {
				dateStart: options.dateStart,
				dateEnd: options.dateEnd,
				meta: {
					page: +options.pagination.page,
					maxPage: pageCount,
					entitiesCount: pageCount === +options.pagination.page ? (entitiesCount % +options.pagination.size) : +options.pagination.size,
				},
				computers: computersArray,
			};
		}
		return {
			dateStart: options.dateStart,
			dateEnd: options.dateEnd,
			meta: null,
			computers: computersArray,
		};
	}
}