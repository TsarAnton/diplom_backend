import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PeriodComputerWork } from '../entities/period-computer-work.entity';
import { IPeriodComputerWorkOptions, PeriodComputerWorkPaginationResult } from '../types/period-computer-work.options';
import { CreatePeriodComputerWorkDto, UpdatePeriodComputerWorkDto, ReadPeriodComputerWorkDto } from '../dto/period-computer-work.dto';
import { ComputerService } from './computer.service';
import { StatisticsPeriod, StatisticsPeriodMember } from '../types/statistics.options';
import { ReadStatisticsDto } from '../dto/statistics.dto';
import { getDateDiffHours } from '../types/date.functions';
import { Computer } from '../entities/computer.entity';

@Injectable()
export class PeriodComputerWorkService  {
	constructor(
        @InjectRepository(PeriodComputerWork)
        private periodComputerWorkRepository: Repository<PeriodComputerWork>,
		private computerService: ComputerService,
		@InjectRepository(Computer)
        private computerRepository: Repository<Computer>,
    ) {}

	public async create(
        createPeriodComputerWorkDto: CreatePeriodComputerWorkDto,
    ): Promise<PeriodComputerWork> {
		const { computerId, ...properties } = createPeriodComputerWorkDto;
		const computer = await this.computerService.readById(computerId);
    	if(computer === null) {
      		throw new BadRequestException(`Computer with id=${computerId} does not exist`);
    	}
		const periodComputerWork = { computer, ...properties };
        return this.periodComputerWorkRepository.save(periodComputerWork);
	}

	public async readAll(
        options: IPeriodComputerWorkOptions,
    ): Promise<PeriodComputerWorkPaginationResult> {
		const queryBuilder = this.periodComputerWorkRepository.createQueryBuilder("periodComputerWork");

		queryBuilder
			.select(['periodComputerWork.id', 'periodComputerWork.dateStart', 'periodComputerWork.dateEnd', 'periodComputerWork.loginId', 'periodComputerWork.operatingSystem'])
            .leftJoin('periodComputerWork.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ]);

		if (options.filter) {
			if (options.filter.dateStart) {
				queryBuilder.andWhere('periodComputerWork.dateStart >= :dateStart', {
					dateStart: options.filter.dateStart,
				});
			}
			if (options.filter.dateEnd) {
				queryBuilder.andWhere('periodComputerWork.dateEnd <= :dateEnd', {
					dateEnd: options.filter.dateEnd,
				});
			}
			if (options.filter.loginId) {
				queryBuilder.andWhere('periodComputerWork.loginId = :loginId', {
					loginId: options.filter.loginId,
				});
			}
            if (options.filter.operatingSystem) {
				queryBuilder.andWhere('periodComputerWork.operatingSystem LIKE :operatingSystem', {
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
    ): Promise<PeriodComputerWork> {
		const periodComputerWork = await this.periodComputerWorkRepository.findOneBy({ id });
		if( periodComputerWork === null ) {
			throw new NotFoundException(`PeriodComputerWork with id=${id} does not exist`);
		}
		return periodComputerWork; 
	}

    public async readOne(
        readPeriodComputerWorkDto: ReadPeriodComputerWorkDto,
    ): Promise<PeriodComputerWork> {
		//console.log(readPeriodComputerWorkDto);
		return await this.periodComputerWorkRepository.findOne({
			select: ['id', 'computer', 'dateStart', 'dateEnd', 'loginId', 'operatingSystem'],
			where: {
				computer: await this.computerService.readById(readPeriodComputerWorkDto.computerId),
				dateStart: readPeriodComputerWorkDto.dateStart,
				dateEnd: readPeriodComputerWorkDto.dateEnd,
				loginId: readPeriodComputerWorkDto.loginId,
				operatingSystem: readPeriodComputerWorkDto.operatingSystem,
			},
			relations: ['computer'],
		})
		//return await this.periodComputerWorkRepository.findOneBy({ ...readPeriodComputerWorkDto });
    }

	public async update(
		id: number,
		updatePeriodComputerWorkDto: UpdatePeriodComputerWorkDto,
	): Promise<PeriodComputerWork> {
		const existingPeriodComputerWork = await this.readById(id);
      	if(existingPeriodComputerWork === null) {
        	throw new NotFoundException(`PeriodComputerWork with id=${id} does not exist`);
      	}
		const { computerId, ...properties } = updatePeriodComputerWorkDto;
		if(computerId) {
			const computer = await this.computerService.readById(computerId);
			if(computer === null) {
				throw new BadRequestException(`Computer with id=${computerId} does not exist`);
			  }
			const periodComputerWork = { computer, ...properties };
			await this.periodComputerWorkRepository.update(id, periodComputerWork);
		} else {
			await this.periodComputerWorkRepository.update(id, { ...properties });
		}
		
		return this.readById(id);
	}

	public async delete(
        id: number,
    ): Promise<void> {
		const existingPeriodComputerWork = await this.readById(id);
    	if(existingPeriodComputerWork === null) {
      		throw new NotFoundException(`PeriodComputerWork with id=${id} does not exist`);
    	}
		await this.periodComputerWorkRepository.softDelete(id);
	}

	public async readWorkPeriods(
        readStatisticsDto: ReadStatisticsDto,
    ): Promise<StatisticsPeriod> {
		const queryBuilder = this.computerRepository.createQueryBuilder("computer");

		queryBuilder
			.select(['computer.id', 'computer.name', 'computer.macAddress', 'computer.ipAddress', 'computer.audince'])
			.leftJoin('computer.periodsComputerWork', 'periodsComputerWork')
			.addSelect([
				'periodsComputerWork.dateStart',
				'periodsComputerWork.dateEnd',
				'periodsComputerWork.loginId',
				'periodsComputerWork.operatingSystem',
			])
			.where('periodsComputerWork.dateEnd IS NOT NULL')

        if (readStatisticsDto.operatingSystem) {
			queryBuilder.andWhere('periodsComputerWork.operatingSystem LIKE :operatingSystem', {
				operatingSystem: "%" + readStatisticsDto.operatingSystem + "%",
			});
		}
		if(readStatisticsDto.computers.length !== 0) {
			queryBuilder.andWhere('computer.id IN (:...computers)', {
				computers: readStatisticsDto.computers,
			});
		}

		queryBuilder.andWhere('((periodsComputerWork.dateStart >= :dateStart AND periodsComputerWork.dateStart <= :dateEnd) OR (periodsComputerWork.dateEnd <= :dateEnd AND periodsComputerWork.dateEnd >= :dateStart))', {
			dateStart: readStatisticsDto.dateStart,
			dateEnd: readStatisticsDto.dateEnd
		});

		if(readStatisticsDto.sorting) {
			queryBuilder.orderBy(readStatisticsDto.sorting.column, readStatisticsDto.sorting.direction);
		}

		if(readStatisticsDto.pagination) {
			queryBuilder.skip(readStatisticsDto.pagination.page * readStatisticsDto.pagination.size).take(readStatisticsDto.pagination.size);
		}

		const entities = await queryBuilder.getMany();
		const entitiesCount = await queryBuilder.getCount();

		const dateStart = new Date(readStatisticsDto.dateStart);
		const dateEnd = new Date(readStatisticsDto.dateEnd);
		
		const arrayPeriod = entities.map(function(el) {
			const computer = new Computer;
			computer.id = el.id;
			computer.name = el.name;
			computer.ipAddress = el.ipAddress;
			computer.macAddress = el.macAddress;
			computer.audince = el.audince;
			return {
				computer: computer,
				periods: el.periodsComputerWork.map(function(el1) {
					const realDateStart = dateStart.getTime() > el1.dateStart.getTime() ? dateStart : el1.dateStart;
					const realDateEnd = dateEnd.getTime() < el1.dateEnd.getTime() ? dateEnd : el1.dateEnd;
					return {
						dateStart: realDateStart,
						dateEnd: realDateEnd,
						hours: Number(getDateDiffHours(realDateStart, realDateEnd).toFixed(4)),
						operatingSystem: el1.operatingSystem,
					};
				}),
			};
		});

		if(readStatisticsDto.pagination) {
			const pageCount = Math.floor(entitiesCount / readStatisticsDto.pagination.size) - ((entitiesCount % +readStatisticsDto.pagination.size === 0) ? 1: 0);
			return {
				dateStart: readStatisticsDto.dateStart,
				dateEnd: readStatisticsDto.dateEnd,
				meta: {
					page: +readStatisticsDto.pagination.page,
					maxPage: pageCount,
					entitiesCount: pageCount === +readStatisticsDto.pagination.page ? (entitiesCount % +readStatisticsDto.pagination.size) : +readStatisticsDto.pagination.size,
				},
				computers: arrayPeriod,
			};
		}

		return {
			dateStart: readStatisticsDto.dateStart,
			dateEnd: readStatisticsDto.dateEnd,
			meta: null,
			computers: arrayPeriod,
		};
	}
}