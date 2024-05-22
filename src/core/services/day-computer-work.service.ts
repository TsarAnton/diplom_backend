import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DayComputerWork } from '../entities/day-computer-work.entity';
import { IDayComputerWorkOptions } from '../types/day-computer-work.options';
import { CreateDayComputerWorkDto, UpdateDayComputerWorkDto, ReadDayComputerWorkDto } from '../dto/day-computer-work.dto';
import { ComputerService } from './computer.service';
import { ReadStatisticsDto } from '../dto/statistics.dto';
import { StatisticsHours, StatisticsHoursMember } from '../types/statistics.options';

@Injectable()
export class DayComputerWorkService  {
	constructor(
        @InjectRepository(DayComputerWork)
        private dayComputerWorkRepository: Repository<DayComputerWork>,
		private computerService: ComputerService,
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
    ): Promise<DayComputerWork[]> {

		const queryBuilder = this.dayComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['dayComputerWork.id', 'dayComputerWork.date', 'dayComputerWork.computerId', 'dayComputerWork.hours', 'dayComputerWork.operatingSystem'])
			.from(DayComputerWork, 'dayComputerWork')
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
				queryBuilder.andWhere('dayComputerWork.date = :date', {
					date: options.filter.date,
				});
			}
			if (options.filter.hours) {
				queryBuilder.andWhere('dayComputerWork.hours = :hours', {
					hours: options.filter.hours,
				});
			}
			if (options.filter.operatingSystem) {
				queryBuilder.andWhere('dayComputerWork.operatingSystem = :operatingSystem', {
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
        dates: Date[],
		computerIds: number[],
    ): Promise<StatisticsHoursMember[]> {

		const queryBuilder = this.dayComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['dayComputerWork.computerId', 'dayComputerWork.hours'])
			.from(DayComputerWork, 'dayComputerWork')
            .leftJoin('dayComputerWork.computer', 'computer')
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
			.andWhere('dayComputerWork.date IN (:...dates)', {
				dates: dates,
			})
			.groupBy('dayComputerWork.computer');
		
		const computersArray = await queryBuilder.getMany();

		const computers = computersArray.map(el => ({
			computer: el.computer,
			hours: el.hours,
		}))

		return computers;
	}
}