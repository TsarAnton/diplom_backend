import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { LogWindows } from '../entities/log-windows.entity';
import { LogWindowsService } from '../services/log-windows.service';
import { ComputerService } from '../services/computer.service';
import { CreateLogWindowsDto, UpdateLogWindowsDto, ReadAllLogWindowsDto, ReadLogWindowsDto } from '../dto/log-windows.dto';

@Controller('logsWindows')
export class LogWindowsController {
  constructor(
    private readonly logWindowsService: LogWindowsService,
    private readonly computerService: ComputerService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() logWindowsOptions: ReadAllLogWindowsDto): Promise<LogWindows[]> {
    const { pagination, sorting, ...filter } = logWindowsOptions;
    return this.logWindowsService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/getOne')
  @HttpCode(HttpStatus.OK)
  getOneAction(@Query() readLogWindowsDto: ReadLogWindowsDto): Promise<LogWindows> {
    return this.logWindowsService.readOne(readLogWindowsDto);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneByIdAction(@Param('id') id: number): Promise<LogWindows> {
    const logWindows = await this.logWindowsService.readById(id);
    if( logWindows === null ) {
      throw new NotFoundException(`LogWindows with id=${id} does not exist`);
    }
    return logWindows;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() logWindows: CreateLogWindowsDto): Promise<LogWindows>{
    const existingComputer = await this.computerService.readById(logWindows.computerId);
    if(existingComputer === null) {
      throw new BadRequestException(`Computer with id=${logWindows.computerId} does not exist`);
    }
    return this.logWindowsService.create(logWindows);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() logWindows: UpdateLogWindowsDto
  ): Promise<LogWindows> {
      const existingLogWindows = await this.logWindowsService.readById(id);
      if(existingLogWindows === null) {
        throw new NotFoundException(`LogWindows with id=${id} does not exist`);
      }
      const existingComputer = await this.computerService.readById(logWindows.computerId);
      if(existingComputer === undefined) {
        throw new BadRequestException(`Computer with id=${logWindows.computerId} does not exist`);
      }
      return this.logWindowsService.update(id, logWindows);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAction(@Param('id') id: number): Promise<void>{
    const existingLogWindows = await this.logWindowsService.readById(id);
    if(existingLogWindows === null) {
      throw new NotFoundException(`LogWindows with id=${id} does not exist`);
    }
    return this.logWindowsService.delete(id);
  }
}