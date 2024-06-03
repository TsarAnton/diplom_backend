import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { Computer } from '../entities/computer.entity';
import { ComputerService } from '../services/computer.service';
import { CreateComputerDto, UpdateComputerDto, ReadAllComputerDto, ReadComputerDto } from '../dto/computer.dto';
import { HasRoles } from 'src/auth/decorators/has-roles.decorator';
import { RolesGuard } from 'src/auth/services/roles.guard';
import { AuthGuard } from '@nestjs/passport';

// @HasRoles("admin")
// @UseGuards(RolesGuard)
// @UseGuards(AuthGuard("jwt"))
@Controller('computers')
export class ComputerController {
  constructor(
    private readonly computerService: ComputerService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() computerOptions: ReadAllComputerDto): Promise<Computer[]> {
    const { pagination, sorting, ...filter } = computerOptions;
    return this.computerService.readAll({
      pagination,
      sorting,
      filter,
    });
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