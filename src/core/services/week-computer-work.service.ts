import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WeekComputerWork } from '../entities/week-computer-work.entity';
import { IWeekComputerWorkOptions } from '../types/week-computer-work.options';
import { CreateWeekComputerWorkDto, UpdateWeekComputerWorkDto, ReadWeekComputerWorkDto } from '../dto/week-computer-work.dto';
import { ComputerService } from './computer.service';

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
		const weekComputerWorkEntity = await this.createWeekComputerWorkEntityFromCreateDto(createWeekComputerWorkDto);
        return this.weekComputerWorkRepository.save(weekComputerWorkEntity);
	}

	public async readAll(
        options: IWeekComputerWorkOptions,
    ): Promise<WeekComputerWork[]> {

		const queryBuilder = this.weekComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['weekComputerWork.id', 'weekComputerWork.date', 'weekComputerWork.computerId', 'weekComputerWork.hours'])
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
		const weekComputerWorkEntity = await this.createWeekComputerWorkEntityFromUpdateDto(updateWeekComputerWorkDto, id);
		await this.weekComputerWorkRepository.update(id, weekComputerWorkEntity);
		return weekComputerWorkEntity;
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.weekComputerWorkRepository.softDelete(id);
	}

	private async createWeekComputerWorkEntityFromCreateDto(
		createWeekComputerWorkDto: CreateWeekComputerWorkDto,
	): Promise<WeekComputerWork> {
		let weekComputerWork = new WeekComputerWork();
		for(let prop in createWeekComputerWorkDto) {
			weekComputerWork[prop] = createWeekComputerWorkDto[prop];
		}
		weekComputerWork.computer = await this.computerService.readById(createWeekComputerWorkDto.computerId);
		return weekComputerWork;
	}

	private async createWeekComputerWorkEntityFromUpdateDto(
		updateWeekComputerWorkDto: UpdateWeekComputerWorkDto,
		id: number,
	): Promise<WeekComputerWork> {
		let existingWeekComputerWork = await this.readById(id);
		for(let prop in updateWeekComputerWorkDto) {
			if(updateWeekComputerWorkDto[prop] && prop.toString() !== "computerId") {
				existingWeekComputerWork[prop] = updateWeekComputerWorkDto[prop];
			}
		}
		if(updateWeekComputerWorkDto.computerId) {
			existingWeekComputerWork.computer = await this.computerService.readById(updateWeekComputerWorkDto.computerId);
		}
		return existingWeekComputerWork;
	}
}