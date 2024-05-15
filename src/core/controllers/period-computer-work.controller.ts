import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { PeriodComputerWork } from '../entities/period-computer-work.entity';
import { PeriodComputerWorkService } from '../services/period-computer-work.service';
import { ComputerService } from '../services/computer.service';
import { CreatePeriodComputerWorkDto, UpdatePeriodComputerWorkDto, ReadAllPeriodComputerWorkDto, ReadPeriodComputerWorkDto } from '../dto/period-computer-work.dto';

@Controller('periodComputersWork')
export class PeriodComputerWorkController {
  constructor(
    private readonly periodComputerWorkService: PeriodComputerWorkService,
    private readonly computerService: ComputerService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() periodComputerWorkOptions: ReadAllPeriodComputerWorkDto): Promise<PeriodComputerWork[]> {
    const { pagination, sorting, ...filter } = periodComputerWorkOptions;
    return this.periodComputerWorkService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/getOne')
  @HttpCode(HttpStatus.OK)
  getOneAction(@Query() readPeriodComputerWorkDto: ReadPeriodComputerWorkDto): Promise<PeriodComputerWork> {
    return this.periodComputerWorkService.readOne(readPeriodComputerWorkDto);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneByIdAction(@Param('id') id: number): Promise<PeriodComputerWork> {
    const periodComputerWork = await this.periodComputerWorkService.readById(id);
    if( periodComputerWork === null ) {
      throw new NotFoundException(`PeriodComputerWork with id=${id} does not exist`);
    }
    return periodComputerWork;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() periodComputerWork: CreatePeriodComputerWorkDto): Promise<PeriodComputerWork>{
    const existingComputer = await this.computerService.readById(periodComputerWork.computerId);
    if(existingComputer === null) {
      throw new BadRequestException(`Computer with id=${periodComputerWork.computerId} does not exist`);
    }
    return this.periodComputerWorkService.create(periodComputerWork);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() periodComputerWork: UpdatePeriodComputerWorkDto
  ): Promise<PeriodComputerWork> {
      const existingPeriodComputerWork = await this.periodComputerWorkService.readById(id);
      if(existingPeriodComputerWork === null) {
        throw new NotFoundException(`PeriodComputerWork with id=${id} does not exist`);
      }
      const existingComputer = await this.computerService.readById(periodComputerWork.computerId);
      if(existingComputer === undefined) {
        throw new BadRequestException(`Computer with id=${periodComputerWork.computerId} does not exist`);
      }
      return this.periodComputerWorkService.update(id, periodComputerWork);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAction(@Param('id') id: number): Promise<void>{
    const existingPeriodComputerWork = await this.periodComputerWorkService.readById(id);
    if(existingPeriodComputerWork === null) {
      throw new NotFoundException(`PeriodComputerWork with id=${id} does not exist`);
    }
    return this.periodComputerWorkService.delete(id);
  }
}