import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto, ReadAllUserDto, ReadUserDto } from '../dto/user.dto';
import { RoleService } from '../services/role.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() userOptions: ReadAllUserDto): Promise<User[]> {
    const { pagination, sorting, ...filter } = userOptions;
    return this.userService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/getOne')
  @HttpCode(HttpStatus.OK)
  getOneAction(@Query() readUserDto: ReadUserDto): Promise<User> {
    return this.userService.readOne(readUserDto);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneByIdAction(@Param('id') id: number): Promise<User> {
    const user = await this.userService.readById(id);
    return user;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() user: CreateUserDto): Promise<User>{
    console.log("Create");
    console.log(user);
    return this.userService.create(user);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() user: UpdateUserDto
  ): Promise<User> {
      return this.userService.update(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAction(@Param('id') id: number): Promise<void>{

    return this.userService.delete(id);
  }
}