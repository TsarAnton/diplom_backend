import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MonthComputerWork } from '../entities/month-computer-work.entity';
import { IMonthComputerWorkOptions } from '../types/month-computer-work.options';
import { CreateMonthComputerWorkDto, UpdateMonthComputerWorkDto, ReadMonthComputerWorkDto } from '../dto/month-computer-work.dto';
import { ComputerService } from './computer.service';

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
		const monthComputerWorkEntity = await this.createMonthComputerWorkEntityFromCreateDto(createMonthComputerWorkDto);
        return this.monthComputerWorkRepository.save(monthComputerWorkEntity);
	}

	public async readAll(
        options: IMonthComputerWorkOptions,
    ): Promise<MonthComputerWork[]> {

		const queryBuilder = this.monthComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['monthComputerWork.id', 'monthComputerWork.date', 'monthComputerWork.computerId', 'monthComputerWork.hours'])
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
			if(options.filter.computerIds) {
				if(typeof options.filter.computerIds === "string") {
					queryBuilder.andWhere('computer.id = :computerIds', {
						computerIds: Number(options.filter.computerIds),
					});
				} else {
					queryBuilder.andWhere('computer.id IN (:...computerIds)', {
						computerIds: options.filter.computerIds.map(id => Number(id)),
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
		
		return await queryBuilder.getMany();
	}

	public async readById(
        id: number,
    ): Promise<MonthComputerWork> {
		return this.monthComputerWorkRepository.findOneBy({ id });
	}

    public async readOne(
        readMonthComputerWorkDto: ReadMonthComputerWorkDto,
    ): Promise<MonthComputerWork> {
        return this.monthComputerWorkRepository.findOneBy({ ...readMonthComputerWorkDto });
    }

	public async update(
		id: number,
		updateMonthComputerWorkDto: UpdateMonthComputerWorkDto,
	): Promise<MonthComputerWork> {
		const monthComputerWorkEntity = await this.createMonthComputerWorkEntityFromUpdateDto(updateMonthComputerWorkDto, id);
		await this.monthComputerWorkRepository.update(id, monthComputerWorkEntity);
		return monthComputerWorkEntity;
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.monthComputerWorkRepository.softDelete(id);
	}

	private async createMonthComputerWorkEntityFromCreateDto(
		createMonthComputerWorkDto: CreateMonthComputerWorkDto,
	): Promise<MonthComputerWork> {
		let monthComputerWork = new MonthComputerWork();
		for(let prop in createMonthComputerWorkDto) {
			monthComputerWork[prop] = createMonthComputerWorkDto[prop];
		}
		monthComputerWork.computer = await this.computerService.readById(createMonthComputerWorkDto.computerId);
		return monthComputerWork;
	}

	private async createMonthComputerWorkEntityFromUpdateDto(
		updateMonthComputerWorkDto: UpdateMonthComputerWorkDto,
		id: number,
	): Promise<MonthComputerWork> {
		let existingMonthComputerWork = await this.readById(id);
		for(let prop in updateMonthComputerWorkDto) {
			if(updateMonthComputerWorkDto[prop] && prop.toString() !== "computerId") {
				existingMonthComputerWork[prop] = updateMonthComputerWorkDto[prop];
			}
		}
		if(updateMonthComputerWorkDto.computerId) {
			existingMonthComputerWork.computer = await this.computerService.readById(updateMonthComputerWorkDto.computerId);
		}
		return existingMonthComputerWork;
	}
}