import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { YearComputerWork } from '../entities/year-computer-work.entity';
import { YearComputerWorkService } from '../services/year-computer-work.service';
import { ComputerService } from '../services/computer.service';
import { CreateYearComputerWorkDto, UpdateYearComputerWorkDto, ReadAllYearComputerWorkDto, ReadYearComputerWorkDto } from '../dto/year-computer-work.dto';

@Controller('yearComputersWork')
export class YearComputerWorkController {
  constructor(
    private readonly yearComputerWorkService: YearComputerWorkService,
    private readonly computerService: ComputerService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() yearComputerWorkOptions: ReadAllYearComputerWorkDto): Promise<YearComputerWork[]> {
    const { pagination, sorting, ...filter } = yearComputerWorkOptions;
    return this.yearComputerWorkService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/getOne')
  @HttpCode(HttpStatus.OK)
  getOneAction(@Query() readYearComputerWorkDto: ReadYearComputerWorkDto): Promise<YearComputerWork> {
    return this.yearComputerWorkService.readOne(readYearComputerWorkDto);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneByIdAction(@Param('id') id: number): Promise<YearComputerWork> {
    const yearComputerWork = await this.yearComputerWorkService.readById(id);
    return yearComputerWork;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() yearComputerWork: CreateYearComputerWorkDto): Promise<YearComputerWork>{
    return this.yearComputerWorkService.create(yearComputerWork);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() yearComputerWork: UpdateYearComputerWorkDto
  ): Promise<YearComputerWork> {
      return this.yearComputerWorkService.update(id, yearComputerWork);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAction(@Param('id') id: number): Promise<void>{
    return this.yearComputerWorkService.delete(id);
  }
}