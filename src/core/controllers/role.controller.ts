import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto, ReadAllRoleDto, ReadRoleDto } from '../dto/role.dto';

@Controller('roles')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() roleOptions: ReadAllRoleDto): Promise<Role[]> {
    const { pagination, sorting, ...filter } = roleOptions;
    return this.roleService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/getOne')
  @HttpCode(HttpStatus.OK)
  getOneAction(@Query() readRoleDto: ReadRoleDto): Promise<Role> {
    return this.roleService.readOne(readRoleDto);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneByIdAction(@Param('id') id: number): Promise<Role> {
    const role = await this.roleService.readById(id);
    return role;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() role: CreateRoleDto): Promise<Role>{
    return this.roleService.create(role);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() role: UpdateRoleDto
  ): Promise<Role> {
      return this.roleService.update(id, role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAction(@Param('id') id: number): Promise<void>{
    return this.roleService.delete(id);
  }
}