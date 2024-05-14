import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LogWindows } from '../entities/log-windows.entity';
import { ILogWindowsOptions } from '../types/log-windows.options';
import { CreateLogWindowsDto, UpdateLogWindowsDto, ReadLogWindowsDto } from '../dto/log-windows.dto';
import { ComputerService } from './computer.service';

@Injectable()
export class LogWindowsService  {
	constructor(
        @InjectRepository(LogWindows)
        private logWindowsRepository: Repository<LogWindows>,
		private computerService: ComputerService,
    ) {}

	public async create(
        createLogWindowsDto: CreateLogWindowsDto,
    ): Promise<LogWindows> {
		const logWindowsEntity = await this.createLogWindowsEntityFromCreateDto(createLogWindowsDto);
        return this.logWindowsRepository.save(logWindowsEntity);
	}

	public async readAll(
        options: ILogWindowsOptions,
    ): Promise<LogWindows[]> {

		const queryBuilder = this.logWindowsRepository.createQueryBuilder();

		queryBuilder
			.select(['logWindows.id', 'logWindows.date', 'logWindows.loginId', 'logWindows.operatingSystem', 'logWindows.type'])
			.from(LogWindows, 'logWindows')
            .leftJoin('logWindows.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ]);

		if (options.filter) {
			if (options.filter.date) {
				queryBuilder.andWhere('logWindows.date = :date', {
					date: options.filter.date,
				});
			}
			if (options.filter.loginId) {
				queryBuilder.andWhere('logWindows.loginId = :loginId', {
					loginId: options.filter.loginId,
				});
			}
            if (options.filter.operatingSystem) {
				queryBuilder.andWhere('logWindows.operatingSystem = :operatingSystem', {
					operatingSystem: options.filter.operatingSystem,
				});
			}
            if (options.filter.type) {
				queryBuilder.andWhere('logWindows.type = :type', {
					type: options.filter.type,
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
    ): Promise<LogWindows> {
		return this.logWindowsRepository.findOneBy({ id });
	}

    public async readOne(
        readLogWindowsDto: ReadLogWindowsDto,
    ): Promise<LogWindows> {
        return this.logWindowsRepository.findOneBy({ ...readLogWindowsDto });
    }

	public async update(
		id: number,
		updateLogWindowsDto: UpdateLogWindowsDto,
	): Promise<LogWindows> {
		const logWindowsEntity = await this.createLogWindowsEntityFromUpdateDto(updateLogWindowsDto, id);
		await this.logWindowsRepository.update(id, logWindowsEntity);
		return logWindowsEntity;
	}

	public async delete(
        id: number,
    ): Promise<void> {
		await this.logWindowsRepository.softDelete(id);
	}

	private async createLogWindowsEntityFromCreateDto(
		createLogWindowsDto: CreateLogWindowsDto,
	): Promise<LogWindows> {
		let logWindows = new LogWindows();
		for(let prop in createLogWindowsDto) {
			logWindows[prop] = createLogWindowsDto[prop];
		}
		logWindows.computer = await this.computerService.readById(createLogWindowsDto.computerId);
		return logWindows;
	}

	private async createLogWindowsEntityFromUpdateDto(
		updateLogWindowsDto: UpdateLogWindowsDto,
		id: number,
	): Promise<LogWindows> {
		let existingLogWindows = await this.readById(id);
		for(let prop in updateLogWindowsDto) {
			if(updateLogWindowsDto[prop] && prop.toString() !== "computerId") {
				existingLogWindows[prop] = updateLogWindowsDto[prop];
			}
		}
		if(updateLogWindowsDto.computerId) {
			existingLogWindows.computer = await this.computerService.readById(updateLogWindowsDto.computerId);
		}
		return existingLogWindows;
	}
}