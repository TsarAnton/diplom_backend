import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PeriodComputerWork } from '../entities/period-computer-work.entity';
import { IPeriodComputerWorkOptions } from '../types/period-computer-work.options';
import { CreatePeriodComputerWorkDto, UpdatePeriodComputerWorkDto, ReadPeriodComputerWorkDto } from '../dto/period-computer-work.dto';
import { ComputerService } from './computer.service';
import { StatisticsPeriod, StatisticsPeriodMember } from '../types/statistics.options';
import { ReadStatisticsDto } from '../dto/statistics.dto';
import { getDateDiffHours } from '../types/date.functions';

@Injectable()
export class PeriodComputerWorkService  {
	constructor(
        @InjectRepository(PeriodComputerWork)
        private periodComputerWorkRepository: Repository<PeriodComputerWork>,
		private computerService: ComputerService,
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
    ): Promise<PeriodComputerWork[]> {
		const queryBuilder = this.periodComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['periodComputerWork.id', 'periodComputerWork.dateStart', 'periodComputerWork.dateEnd', 'periodComputerWork.loginId', 'periodComputerWork.operatingSystem'])
			.from(PeriodComputerWork, 'periodComputerWork')
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
				queryBuilder.andWhere('periodComputerWork.dateStart = :dateStart', {
					dateStart: options.filter.dateStart,
				});
			}
			if (options.filter.dateEnd) {
				queryBuilder.andWhere('periodComputerWork.dateEnd = :dateEnd', {
					dateEnd: options.filter.dateEnd,
				});
			}
			if (options.filter.loginId) {
				queryBuilder.andWhere('periodComputerWork.loginId = :loginId', {
					loginId: options.filter.loginId,
				});
			}
            if (options.filter.operatingSystem) {
				queryBuilder.andWhere('periodComputerWork.operatingSystem = :operatingSystem', {
					operatingSystem: options.filter.operatingSystem,
				});
			}
			if(options.filter.computers) {
				queryBuilder.andWhere('computer.id IN (:...computers)', {
					computers: options.filter.computers, //options.filter.computers.map(id => Number(id)),
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
		//await this.periodComputerWorkRepository.update(id, periodComputerWork);
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

		const queryBuilder = this.periodComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['periodComputerWork.computerId', 'periodComputerWork.dateStart', 'periodComputerWork.dateEnd'])
			.from(PeriodComputerWork, 'periodComputerWork')
            .leftJoin('periodComputerWork.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ])
			.andWhere('computer.id IN (:...computers)', {
				computers: readStatisticsDto.computers,
			})
			.andWhere('periodComputerWork.startDate >= :dateStart', {
				dateStart: readStatisticsDto.dateStart,
			})
			.andWhere('periodComputerWork.dateEnd IS NOT NULL')
			.orderBy('computer.id', 'ASC');
		
		let computersArray = await queryBuilder.getMany();

		if(computersArray.length === 0) {
			return null;
		}

		let statisticsPeriod = new StatisticsPeriod();
		statisticsPeriod.dateStart = readStatisticsDto.dateStart;
		statisticsPeriod.dateEnd = readStatisticsDto.dateEnd;

		let statisticsPeriodMember = new StatisticsPeriodMember();
		let currentComputerId = computersArray[0].computer.id;
		statisticsPeriodMember.computer = computersArray[0].computer;

		for(let el of computersArray) {
			if(el.dateEnd.getTime() > readStatisticsDto.dateEnd.getTime()) {
				el.dateEnd = readStatisticsDto.dateEnd;
			}
			if(el.computer.id !== currentComputerId) {
				statisticsPeriod.computers.push(statisticsPeriodMember);
				statisticsPeriodMember.computer = el.computer;
			}
			statisticsPeriodMember.periods.push({ 
				dateStart: el.dateStart, 
				dateEnd: el.dateEnd, 
				hours: getDateDiffHours(el.dateStart, el.dateEnd),
			});
		}
		return statisticsPeriod;
	}
}