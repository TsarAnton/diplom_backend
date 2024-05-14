import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DayComputerWork } from '../entities/day-computer-work.entity';
import { IDayComputerWorkOptions } from '../types/day-computer-work.options';
import { CreateDayComputerWorkDto, UpdateDayComputerWorkDto, ReadDayComputerWorkDto } from '../dto/day-computer-work.dto';
import { ComputerService } from './computer.service';

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
		const dayComputerWorkEntity = await this.createDayComputerWorkEntityFromCreateDto(createDayComputerWorkDto);
        return this.dayComputerWorkRepository.save(dayComputerWorkEntity);
	}

	public async readAll(
        options: IDayComputerWorkOptions,
    ): Promise<DayComputerWork[]> {

		const queryBuilder = this.dayComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['dayComputerWork.id', 'dayComputerWork.date', 'dayComputerWork.computerId', 'dayComputerWork.hours'])
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
    ): Promise<DayComputerWork> {
		return this.dayComputerWorkRepository.findOneBy({ id });
	}

    public async readOne(
        readDayComputerWorkDto: ReadDayComputerWorkDto,
    ): Promise<DayComputerWork> {
        return this.dayComputerWorkRepository.findOneBy({ ...readDayComputerWorkDto });
    }

	public async update(
		id: number,
		updateDayComputerWorkDto: UpdateDayComputerWorkDto,
	): Promise<DayComputerWork> {
		const dayComputerWorkEntity = await this.createDayComputerWorkEntityFromUpdateDto(updateDayComputerWorkDto, id);
		await this.dayComputerWorkRepository.update(id, dayComputerWorkEntity);
		return dayComputerWorkEntity;
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.dayComputerWorkRepository.softDelete(id);
	}

	private async createDayComputerWorkEntityFromCreateDto(
		createDayComputerWorkDto: CreateDayComputerWorkDto,
	): Promise<DayComputerWork> {
		let dayComputerWork = new DayComputerWork();
		for(let prop in createDayComputerWorkDto) {
			dayComputerWork[prop] = createDayComputerWorkDto[prop];
		}
		dayComputerWork.computer = await this.computerService.readById(createDayComputerWorkDto.computerId);
		return dayComputerWork;
	}

	private async createDayComputerWorkEntityFromUpdateDto(
		updateDayComputerWorkDto: UpdateDayComputerWorkDto,
		id: number,
	): Promise<DayComputerWork> {
		let existingDayComputerWork = await this.readById(id);
		for(let prop in updateDayComputerWorkDto) {
			if(updateDayComputerWorkDto[prop] && prop.toString() !== "computerId") {
				existingDayComputerWork[prop] = updateDayComputerWorkDto[prop];
			}
		}
		if(updateDayComputerWorkDto.computerId) {
			existingDayComputerWork.computer = await this.computerService.readById(updateDayComputerWorkDto.computerId);
		}
		return existingDayComputerWork;
	}
}