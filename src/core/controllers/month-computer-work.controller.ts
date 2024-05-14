import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { MonthComputerWork } from '../entities/month-computer-work.entity';
import { MonthComputerWorkService } from '../services/month-computer-work.service';
import { ComputerService } from '../services/computer.service';
import { CreateMonthComputerWorkDto, UpdateMonthComputerWorkDto, ReadAllMonthComputerWorkDto, ReadMonthComputerWorkDto } from '../dto/month-computer-work.dto';

@Controller('monthComputersWork')
export class MonthComputerWorkController {
  constructor(
    private readonly monthComputerWorkService: MonthComputerWorkService,
    private readonly computerService: ComputerService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() monthComputerWorkOptions: ReadAllMonthComputerWorkDto): Promise<MonthComputerWork[]> {
    const { pagination, sorting, ...filter } = monthComputerWorkOptions;
    return this.monthComputerWorkService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/getOne')
  @HttpCode(HttpStatus.OK)
  getOneAction(@Query() readMonthComputerWorkDto: ReadMonthComputerWorkDto): Promise<MonthComputerWork> {
    return this.monthComputerWorkService.readOne(readMonthComputerWorkDto);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneByIdAction(@Param('id') id: number): Promise<MonthComputerWork> {
    const monthComputerWork = await this.monthComputerWorkService.readById(id);
    if( monthComputerWork === null ) {
      throw new NotFoundException(`MonthComputerWork with id=${id} does not exist`);
    }
    return monthComputerWork;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() monthComputerWork: CreateMonthComputerWorkDto): Promise<MonthComputerWork>{
    const existingComputer = await this.computerService.readById(monthComputerWork.computerId);
    if(existingComputer === null) {
      throw new BadRequestException(`Computer with id=${monthComputerWork.computerId} does not exist`);
    }
    return this.monthComputerWorkService.create(monthComputerWork);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() monthComputerWork: UpdateMonthComputerWorkDto
  ): Promise<MonthComputerWork> {
      const existingMonthComputerWork = await this.monthComputerWorkService.readById(id);
      if(existingMonthComputerWork === null) {
        throw new NotFoundException(`MonthComputerWork with id=${id} does not exist`);
      }
      const existingComputer = await this.computerService.readById(monthComputerWork.computerId);
      if(existingComputer === undefined) {
        throw new BadRequestException(`Computer with id=${monthComputerWork.computerId} does not exist`);
      }
      return this.monthComputerWorkService.update(id, monthComputerWork);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAction(@Param('id') id: number): Promise<void>{
    const existingMonthComputerWork = await this.monthComputerWorkService.readById(id);
    if(existingMonthComputerWork === null) {
      throw new NotFoundException(`MonthComputerWork with id=${id} does not exist`);
    }
    return this.monthComputerWorkService.delete(id);
  }
}