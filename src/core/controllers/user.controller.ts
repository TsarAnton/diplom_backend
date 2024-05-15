import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto, ReadAllUserDto, ReadUserDto } from '../dto/user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
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
    if( user === null ) {
      throw new NotFoundException(`User with id=${id} does not exist`);
    }
    return user;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createAction(@Body() user: CreateUserDto): Promise<User>{
    const existingUser = await this.userService.readOne({ login: user.login});
    if(existingUser) {
      throw new BadRequestException(`User with login ${user.login} already exist`);
    }
    return this.userService.create(user);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAction(
    @Param('id') id: number, 
    @Body() user: UpdateUserDto
  ): Promise<User> {
      const existingUser = await this.userService.readById(id);
      if(existingUser === null) {
        throw new NotFoundException(`User with id=${id} does not exist`);
      }
      if(user.login) {
        const existingUsers = await this.userService.readAll({ filter: { login: user.login } });
        if(existingUser && (existingUsers.length > 1 || existingUsers[0].id !== id)) {
          throw new BadRequestException(`User with login ${user.login} already exist`);
        }
      }
      return this.userService.update(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAction(@Param('id') id: number): Promise<void>{
    const existingUser = await this.userService.readById(id);
    if(existingUser === null) {
      throw new NotFoundException(`User with id=${id} does not exist`);
    }
    return this.userService.delete(id);
  }
}