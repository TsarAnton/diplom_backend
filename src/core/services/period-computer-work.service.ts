import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PeriodComputerWork } from '../entities/period-computer-work.entity';
import { IPeriodComputerWorkOptions } from '../types/period-computer-work.options';
import { CreatePeriodComputerWorkDto, UpdatePeriodComputerWorkDto, ReadPeriodComputerWorkDto } from '../dto/period-computer-work.dto';
import { ComputerService } from './computer.service';

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
		const periodComputerWork = { computer, ...properties };
        return this.periodComputerWorkRepository.save(periodComputerWork);
	}

	public async readAll(
        options: IPeriodComputerWorkOptions,
    ): Promise<PeriodComputerWork[]> {

		const queryBuilder = this.periodComputerWorkRepository.createQueryBuilder();

		queryBuilder
			.select(['periodComputerWork.id', 'periodComputerWork.date', 'periodComputerWork.dateEnd', 'periodComputerWork.computerId', 'periodComputerWork.operatingSystem', 'periodComputerWork.loginId'])
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
			if (options.filter.operatingSystem) {
				queryBuilder.andWhere('periodComputerWork.operatingSystem = :operatingSystem', {
					operatingSystem: options.filter.operatingSystem,
				});
			}
			if (options.filter.loginId) {
				queryBuilder.andWhere('periodComputerWork.loginId = :loginId', {
					loginId: options.filter.loginId,
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
    ): Promise<PeriodComputerWork> {
		return this.periodComputerWorkRepository.findOneBy({ id });
	}

    public async readOne(
        readPeriodComputerWorkDto: ReadPeriodComputerWorkDto,
    ): Promise<PeriodComputerWork> {
        return this.periodComputerWorkRepository.findOneBy({ ...readPeriodComputerWorkDto });
    }

	public async update(
		id: number,
		updatePeriodComputerWorkDto: UpdatePeriodComputerWorkDto,
	): Promise<PeriodComputerWork> {
		const { computerId, ...properties } = updatePeriodComputerWorkDto;
		const computer = await this.computerService.readById(computerId);
		const periodComputerWork = { computer, ...properties };
		//await this.periodComputerWorkRepository.update(id, periodComputerWork);
		return (await this.periodComputerWorkRepository.update(id, periodComputerWork)).raw;
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.periodComputerWorkRepository.softDelete(id);
	}
}