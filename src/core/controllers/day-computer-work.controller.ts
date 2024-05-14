import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { DayComputerWork } from '../entities/day-computer-work.entity';
import { DayComputerWorkService } from '../services/day-computer-work.service';
import { ComputerService } from '../services/computer.service';
import { CreateDayComputerWorkDto, UpdateDayComputerWorkDto, ReadAllDayComputerWorkDto, ReadDayComputerWorkDto } from '../dto/day-computer-work.dto';

@Controller('dayComputersWork')
export class DayComputerWorkController {
  constructor(
    private readonly dayComputerWorkService: DayComputerWorkService,
    private readonly computerService: ComputerService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() dayComputerWorkOptions: ReadAllDayComputerWorkDto): Promise<DayComputerWork[]> {
    const { pagination, sorting, ...filter } = dayComputerWorkOptions;
    return this.dayComputerWorkService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/getOne')
  @HttpCode(HttpStatus.OK)
  getOneAction(@Query() readDayComputerWorkDto: ReadDayComputerWorkDto): Promise<DayComputerWork> {
    return this.dayComputerWorkService.readOne(readDayComputerWorkDto);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneByIdAction(@Param('id') id: number): Promise<DayComputerWork> {
    const dayComputerWork = await this.dayComputerWorkService.readById(id);
    if( dayComputerWork === null ) {
      throw new NotFoundException(`DayComputerWork with id=${id} does not exist`);
    }
    return dayComputerWork;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() dayComputerWork: CreateDayComputerWorkDto): Promise<DayComputerWork>{
    const existingComputer = await this.computerService.readById(dayComputerWork.computerId);
    if(existingComputer === null) {
      throw new BadRequestException(`Computer with id=${dayComputerWork.computerId} does not exist`);
    }
    return this.dayComputerWorkService.create(dayComputerWork);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() dayComputerWork: UpdateDayComputerWorkDto
  ): Promise<DayComputerWork> {
      const existingDayComputerWork = await this.dayComputerWorkService.readById(id);
      if(existingDayComputerWork === null) {
        throw new NotFoundException(`DayComputerWork with id=${id} does not exist`);
      }
      const existingComputer = await this.computerService.readById(dayComputerWork.computerId);
      if(existingComputer === undefined) {
        throw new BadRequestException(`Computer with id=${dayComputerWork.computerId} does not exist`);
      }
      return this.dayComputerWorkService.update(id, dayComputerWork);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAction(@Param('id') id: number): Promise<void>{
    const existingDayComputerWork = await this.dayComputerWorkService.readById(id);
    if(existingDayComputerWork === null) {
      throw new NotFoundException(`DayComputerWork with id=${id} does not exist`);
    }
    return this.dayComputerWorkService.delete(id);
  }
}