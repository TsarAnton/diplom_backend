import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { WeekComputerWork } from '../entities/week-computer-work.entity';
import { WeekComputerWorkService } from '../services/week-computer-work.service';
import { ComputerService } from '../services/computer.service';
import { CreateWeekComputerWorkDto, UpdateWeekComputerWorkDto, ReadAllWeekComputerWorkDto, ReadWeekComputerWorkDto } from '../dto/week-computer-work.dto';

@Controller('weekComputersWork')
export class WeekComputerWorkController {
  constructor(
    private readonly weekComputerWorkService: WeekComputerWorkService,
    private readonly computerService: ComputerService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() weekComputerWorkOptions: ReadAllWeekComputerWorkDto): Promise<WeekComputerWork[]> {
    const { pagination, sorting, ...filter } = weekComputerWorkOptions;
    return this.weekComputerWorkService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/getOne')
  @HttpCode(HttpStatus.OK)
  getOneAction(@Query() readWeekComputerWorkDto: ReadWeekComputerWorkDto): Promise<WeekComputerWork> {
    return this.weekComputerWorkService.readOne(readWeekComputerWorkDto);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneByIdAction(@Param('id') id: number): Promise<WeekComputerWork> {
    const weekComputerWork = await this.weekComputerWorkService.readById(id);
    if( weekComputerWork === null ) {
      throw new NotFoundException(`WeekComputerWork with id=${id} does not exist`);
    }
    return weekComputerWork;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() weekComputerWork: CreateWeekComputerWorkDto): Promise<WeekComputerWork>{
    const existingComputer = await this.computerService.readById(weekComputerWork.computerId);
    if(existingComputer === null) {
      throw new BadRequestException(`Computer with id=${weekComputerWork.computerId} does not exist`);
    }
    return this.weekComputerWorkService.create(weekComputerWork);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() weekComputerWork: UpdateWeekComputerWorkDto
  ): Promise<WeekComputerWork> {
      const existingWeekComputerWork = await this.weekComputerWorkService.readById(id);
      if(existingWeekComputerWork === null) {
        throw new NotFoundException(`WeekComputerWork with id=${id} does not exist`);
      }
      const existingComputer = await this.computerService.readById(weekComputerWork.computerId);
      if(existingComputer === undefined) {
        throw new BadRequestException(`Computer with id=${weekComputerWork.computerId} does not exist`);
      }
      return this.weekComputerWorkService.update(id, weekComputerWork);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAction(@Param('id') id: number): Promise<void>{
    const existingWeekComputerWork = await this.weekComputerWorkService.readById(id);
    if(existingWeekComputerWork === null) {
      throw new NotFoundException(`WeekComputerWork with id=${id} does not exist`);
    }
    return this.weekComputerWorkService.delete(id);
  }
}