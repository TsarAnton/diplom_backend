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
    if( role === null ) {
      throw new NotFoundException(`Role with id=${id} does not exist`);
    }
    return role;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() role: CreateRoleDto): Promise<Role>{
    const existingRole = await this.roleService.readOne({ name: role.name});
    if(existingRole) {
      throw new BadRequestException(`Role with name ${role.name} already exist`);
    }
    return this.roleService.create(role);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() role: UpdateRoleDto
  ): Promise<Role> {
      const existingRole = await this.roleService.readById(id);
      if(existingRole === null) {
        throw new NotFoundException(`Role with id=${id} does not exist`);
      }
      if(role.name) {
        const existingRoles = await this.roleService.readAll({ filter: { name: role.name } });
        if(existingRole && (existingRoles.length > 1 || existingRoles[0].id !== id)) {
          throw new BadRequestException(`Role with name ${role.name} already exist`);
        }
      }
      return this.roleService.update(id, role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAction(@Param('id') id: number): Promise<void>{
    const existingRole = await this.roleService.readById(id);
    if(existingRole === null) {
      throw new NotFoundException(`Role with id=${id} does not exist`);
    }
    return this.roleService.delete(id);
  }
}