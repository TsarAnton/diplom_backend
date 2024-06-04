import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { MonthComputerWork } from '../entities/month-computer-work.entity';
import { MonthComputerWorkService } from '../services/month-computer-work.service';
import { ComputerService } from '../services/computer.service';
import { CreateMonthComputerWorkDto, UpdateMonthComputerWorkDto, ReadAllMonthComputerWorkDto, ReadMonthComputerWorkDto } from '../dto/month-computer-work.dto';
import { HasRoles } from 'src/auth/decorators/has-roles.decorator';
import { RolesGuard } from 'src/auth/services/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { MonthComputerWorkPaginationResult } from '../types/month-computer-work.options';

@HasRoles("admin")
@UseGuards(RolesGuard)
@UseGuards(AuthGuard("jwt"))
@Controller('monthComputersWork')
export class MonthComputerWorkController {
  constructor(
    private readonly monthComputerWorkService: MonthComputerWorkService,
    private readonly computerService: ComputerService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() monthComputerWorkOptions: ReadAllMonthComputerWorkDto): Promise<MonthComputerWorkPaginationResult> {
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
    return await this.monthComputerWorkService.readById(id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() monthComputerWork: CreateMonthComputerWorkDto): Promise<MonthComputerWork>{
    return this.monthComputerWorkService.create(monthComputerWork);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() monthComputerWork: UpdateMonthComputerWorkDto
  ): Promise<MonthComputerWork> {
      return this.monthComputerWorkService.update(id, monthComputerWork);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAction(@Param('id') id: number): Promise<void>{
    return this.monthComputerWorkService.delete(id);
  }
}