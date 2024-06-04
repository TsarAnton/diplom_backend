import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { Log } from '../entities/log.entity';
import { LogService } from '../services/log.service';
import { ComputerService } from '../services/computer.service';
import { CreateLogDto, UpdateLogDto, ReadAllLogDto, ReadLogDto } from '../dto/log.dto';
import { LogPaginationResult } from '../types/log.options';

@Controller('logsWindows')
export class LogController {
  constructor(
    private readonly logService: LogService,
    private readonly computerService: ComputerService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() logOptions: ReadAllLogDto): Promise<LogPaginationResult> {
    const { pagination, sorting, ...filter } = logOptions;
    return this.logService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/getOne')
  @HttpCode(HttpStatus.OK)
  getOneAction(@Query() readLogDto: ReadLogDto): Promise<Log> {
    return this.logService.readOne(readLogDto);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneByIdAction(@Param('id') id: number): Promise<Log> {
    return await this.logService.readById(id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() log: CreateLogDto): Promise<Log>{
    return this.logService.create(log);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() log: UpdateLogDto
  ): Promise<Log> {
      return this.logService.update(id, log);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAction(@Param('id') id: number): Promise<void>{
    return this.logService.delete(id);
  }
}