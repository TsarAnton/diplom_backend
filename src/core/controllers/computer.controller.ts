import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { Computer } from '../entities/computer.entity';
import { ComputerService } from '../services/computer.service';
import { CreateComputerDto, UpdateComputerDto, ReadAllComputerDto, ReadComputerDto } from '../dto/computer.dto';

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
    const computer = await this.computerService.readById(id);
    if( computer === null ) {
      throw new NotFoundException(`Computer with id=${id} does not exist`);
    }
    return computer;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() computer: CreateComputerDto): Promise<Computer>{
    const existingComputer = await this.computerService.readOne({ macAddress: computer.macAddress});
    if(existingComputer) {
      throw new BadRequestException(`Computer with mac-address ${computer.macAddress} already exist`);
    }
    return this.computerService.create(computer);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() computer: UpdateComputerDto
  ): Promise<Computer> {
      const existingComputer = await this.computerService.readById(id);
      if(existingComputer === null) {
        throw new NotFoundException(`Computer with id=${id} does not exist`);
      }
      if(computer.macAddress) {
        const existingComputers = await this.computerService.readAll({ filter: { macAddress: computer.macAddress } });
        if(existingComputer && (existingComputers.length > 1 || existingComputers[0].id !== id)) {
          throw new BadRequestException(`Computer with mac-address ${computer.macAddress} already exist`);
        }
      }
      return this.computerService.update(id, computer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAction(@Param('id') id: number): Promise<void>{
    const existingComputer = await this.computerService.readById(id);
    if(existingComputer === null) {
      throw new NotFoundException(`Computer with id=${id} does not exist`);
    }
    return this.computerService.delete(id);
  }
}