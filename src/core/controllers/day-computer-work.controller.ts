import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { DayComputerWork } from '../entities/day-computer-work.entity';
import { DayComputerWorkService } from '../services/day-computer-work.service';
import { CreateDayComputerWorkDto, UpdateDayComputerWorkDto, ReadAllDayComputerWorkDto, ReadDayComputerWorkDto } from '../dto/day-computer-work.dto';
import { HasRoles } from 'src/auth/decorators/has-roles.decorator';
import { RolesGuard } from 'src/auth/services/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { DayComputerWorkPaginationResult } from '../types/day-computer-work.options';

@HasRoles("admin")
@UseGuards(RolesGuard)
@UseGuards(AuthGuard("jwt"))
@Controller('dayComputersWork')
export class DayComputerWorkController {
  constructor(
    private readonly dayComputerWorkService: DayComputerWorkService
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() dayComputerWorkOptions: ReadAllDayComputerWorkDto): Promise<DayComputerWorkPaginationResult> {
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
    return await this.dayComputerWorkService.readById(id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() dayComputerWork: CreateDayComputerWorkDto): Promise<DayComputerWork>{
    return this.dayComputerWorkService.create(dayComputerWork);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() dayComputerWork: UpdateDayComputerWorkDto
  ): Promise<DayComputerWork> {
      return this.dayComputerWorkService.update(id, dayComputerWork);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAction(@Param('id') id: number): Promise<void>{
    return this.dayComputerWorkService.delete(id);
  }
}