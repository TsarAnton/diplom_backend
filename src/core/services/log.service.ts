import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Log } from '../entities/log.entity';
import { ILogOptions } from '../types/log.options';
import { CreateLogDto, UpdateLogDto, ReadLogDto } from '../dto/log.dto';
import { ComputerService } from './computer.service';

@Injectable()
export class LogService  {
	constructor(
        @InjectRepository(Log)
        private logRepository: Repository<Log>,
		private computerService: ComputerService,
    ) {}

	public async create(
        createLogDto: CreateLogDto,
    ): Promise<Log> {
		const existingComputer = await this.computerService.readById(createLogDto.computerId);
    	if(existingComputer === null) {
     		 throw new BadRequestException(`Computer with id=${createLogDto.computerId} does not exist`);
    	}
		const logEntity = await this.createLogEntityFromCreateDto(createLogDto);
        return this.logRepository.save(logEntity);
	}

	public async readAll(
        options: ILogOptions,
    ): Promise<Log[]> {

		const queryBuilder = this.logRepository.createQueryBuilder();

		queryBuilder
			.select(['log.id', 'log.date', 'log.loginId', 'log.operatingSystem', 'log.type'])
			.from(Log, 'log')
            .leftJoin('log.computer', 'computer')
            .addSelect([
                'computer.id',
                'computer.name',
                'computer.ipAddress',
                'computer.macAddress',
                'computer.audince',
            ]);

		if (options.filter) {
			if (options.filter.dateStart) {
				queryBuilder.andWhere('log.date >= :dateStart', {
					dateStart: options.filter.dateStart,
				});
			}
			if (options.filter.dateEnd) {
				queryBuilder.andWhere('log.date <= :dateEnd', {
					date: options.filter.dateEnd,
				});
			}
			if (options.filter.date) {
				queryBuilder.andWhere('log.date = :date', {
					date: options.filter.date,
				});
			}
			if (options.filter.loginId) {
				queryBuilder.andWhere('log.loginId = :loginId', {
					loginId: options.filter.loginId,
				});
			}
            if (options.filter.operatingSystem) {
				queryBuilder.andWhere('log.operatingSystem LIKE :operatingSystem', {
					operatingSystem: "%" + options.filter.operatingSystem + "%",
				});
			}
            if (options.filter.type) {
				queryBuilder.andWhere('log.type = :type', {
					type: options.filter.type,
				});
			}
			if(options.filter.computerIds) {
				if(typeof options.filter.computerIds === "string") {
					queryBuilder.andWhere('computer.id = :computers', {
						computers: Number(options.filter.computerIds),
					});
				} else {
					queryBuilder.andWhere('computer.id IN (:...computers)', {
						computers: options.filter.computerIds, //options.filter.computers.map(id => Number(id)),
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
    ): Promise<Log> {
		const log = await this.logRepository.findOneBy({ id });
		if( log === null ) {
			throw new NotFoundException(`Log with id=${id} does not exist`);
		}
		return log;
	}

    public async readOne(
        readLogDto: ReadLogDto,
    ): Promise<Log> {
        return this.logRepository.findOneBy({ ...readLogDto });
    }

	public async update(
		id: number,
		updateLogDto: UpdateLogDto,
	): Promise<Log> {
		const existingLog = await this.readById(id);
      	if(existingLog === null) {
        	throw new NotFoundException(`Log with id=${id} does not exist`);
      	}
		if(updateLogDto.computerId) {
      		const existingComputer = await this.computerService.readById(updateLogDto.computerId);
      		if(existingComputer === undefined) {
        		throw new BadRequestException(`Computer with id=${updateLogDto.computerId} does not exist`);
      		}
		}
		const logEntity = await this.createLogEntityFromUpdateDto(updateLogDto, id);
		await this.logRepository.update(id, logEntity);
		return logEntity;
	}

	public async delete(
        id: number,
    ): Promise<void> {
		const existingLog = await this.readById(id);
    	if(existingLog === null) {
      		throw new NotFoundException(`Log with id=${id} does not exist`);
    	}
		await this.logRepository.softDelete(id);
	}

	private async createLogEntityFromCreateDto(
		createLogDto: CreateLogDto,
	): Promise<Log> {
		let log = new Log();
		for(let prop in createLogDto) {
			log[prop] = createLogDto[prop];
		}
		log.computer = await this.computerService.readById(createLogDto.computerId);
		return log;
	}

	private async createLogEntityFromUpdateDto(
		updateLogDto: UpdateLogDto,
		id: number,
	): Promise<Log> {
		let existingLog = await this.readById(id);
		for(let prop in updateLogDto) {
			if(updateLogDto[prop] && prop.toString() !== "computerId") {
				existingLog[prop] = updateLogDto[prop];
			}
		}
		if(updateLogDto.computerId) {
			existingLog.computer = await this.computerService.readById(updateLogDto.computerId);
		}
		return existingLog;
	}
}