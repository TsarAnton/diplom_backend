import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { YearComputerWork } from '../entities/year-computer-work.entity';
import { IYearComputerWorkOptions } from '../types/year-computer-work.options';
import { CreateYearComputerWorkDto, UpdateYearComputerWorkDto, ReadYearComputerWorkDto } from '../dto/year-computer-work.dto';
import { ComputerService } from './computer.service';

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
		const yearComputerWorkEntity = await this.createYearComputerWorkEntityFromCreateDto(createYearComputerWorkDto);
        return this.yearComputerWorkRepository.save(yearComputerWorkEntity);
	}

	public async readAll(
        options: IYearComputerWorkOptions,
    ): Promise<YearComputerWork[]> {

		const queryBuilder = this.yearComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['yearComputerWork.id', 'yearComputerWork.date', 'yearComputerWork.computerId', 'yearComputerWork.hours'])
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
		const yearComputerWorkEntity = await this.createYearComputerWorkEntityFromUpdateDto(updateYearComputerWorkDto, id);
		await this.yearComputerWorkRepository.update(id, yearComputerWorkEntity);
		return yearComputerWorkEntity;
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.yearComputerWorkRepository.softDelete(id);
	}

	private async createYearComputerWorkEntityFromCreateDto(
		createYearComputerWorkDto: CreateYearComputerWorkDto,
	): Promise<YearComputerWork> {
		let yearComputerWork = new YearComputerWork();
		for(let prop in createYearComputerWorkDto) {
			yearComputerWork[prop] = createYearComputerWorkDto[prop];
		}
		yearComputerWork.computer = await this.computerService.readById(createYearComputerWorkDto.computerId);
		return yearComputerWork;
	}

	private async createYearComputerWorkEntityFromUpdateDto(
		updateYearComputerWorkDto: UpdateYearComputerWorkDto,
		id: number,
	): Promise<YearComputerWork> {
		let existingYearComputerWork = await this.readById(id);
		for(let prop in updateYearComputerWorkDto) {
			if(updateYearComputerWorkDto[prop] && prop.toString() !== "computerId") {
				existingYearComputerWork[prop] = updateYearComputerWorkDto[prop];
			}
		}
		if(updateYearComputerWorkDto.computerId) {
			existingYearComputerWork.computer = await this.computerService.readById(updateYearComputerWorkDto.computerId);
		}
		return existingYearComputerWork;
	}
}