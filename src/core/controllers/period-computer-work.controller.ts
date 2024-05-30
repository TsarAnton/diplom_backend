import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { PeriodComputerWork } from '../entities/period-computer-work.entity';
import { PeriodComputerWorkService } from '../services/period-computer-work.service';
import { ComputerService } from '../services/computer.service';
import { CreatePeriodComputerWorkDto, UpdatePeriodComputerWorkDto, ReadAllPeriodComputerWorkDto, ReadPeriodComputerWorkDto } from '../dto/period-computer-work.dto';
import { HasRoles } from 'src/auth/decorators/has-roles.decorator';
import { RolesGuard } from 'src/auth/services/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@HasRoles("admin")
@UseGuards(RolesGuard)
@UseGuards(AuthGuard("jwt"))
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
    return this.periodComputerWorkService.readById(id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() periodComputerWork: CreatePeriodComputerWorkDto): Promise<PeriodComputerWork>{
    return this.periodComputerWorkService.create(periodComputerWork);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() periodComputerWork: UpdatePeriodComputerWorkDto
  ): Promise<PeriodComputerWork> {
      return this.periodComputerWorkService.update(id, periodComputerWork);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAction(@Param('id') id: number): Promise<void>{
    return this.periodComputerWorkService.delete(id);
  }
}