import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { Computer } from '../entities/computer.entity';
import { ComputerService } from '../services/computer.service';
import { CreateComputerDto, UpdateComputerDto, ReadAllComputerDto, ReadComputerDto } from '../dto/computer.dto';
import { HasRoles } from 'src/auth/decorators/has-roles.decorator';
import { RolesGuard } from 'src/auth/services/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { ComputerPaginationResult } from '../types/computer.options';

@HasRoles("admin")
@UseGuards(RolesGuard)
@UseGuards(AuthGuard("jwt"))
@Controller('computers')
export class ComputerController {
  constructor(
    private readonly computerService: ComputerService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() computerOptions: ReadAllComputerDto): Promise<ComputerPaginationResult> {
    const { pagination, sorting, ...filter } = computerOptions;
    return this.computerService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/audinces')
  @HttpCode(HttpStatus.OK)
  getAllAudincesMethod(): Promise<string[]> {
    return this.computerService.readAllAudinces();
  }

  @Get('/getOne')
  @HttpCode(HttpStatus.OK)
  getOneAction(@Query() readComputerDto: ReadComputerDto): Promise<Computer> {
    return this.computerService.readOne(readComputerDto);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneByIdAction(@Param('id') id: number): Promise<Computer> {
    return await this.computerService.readById(id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() computer: CreateComputerDto): Promise<Computer>{
    return this.computerService.create(computer);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() computer: UpdateComputerDto
  ): Promise<Computer> {
      return this.computerService.update(id, computer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAction(@Param('id') id: number): Promise<void>{
    return this.computerService.delete(id);
  }
}