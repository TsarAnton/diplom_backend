import { Controller, Get, Post, Delete, Param, Body, Put, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto, ReadAllUserDto, ReadUserDto, ReadAllUserWithRolesDto, VerifyUserDto } from '../dto/user.dto';
import { RoleService } from '../services/role.service';
import { AuthGuard } from '@nestjs/passport';
import { HasRoles } from 'src/auth/decorators/has-roles.decorator';
import { RolesGuard } from 'src/auth/services/roles.guard';
import { UserPaginationResult } from '../types/user.options';

@HasRoles("admin")
@UseGuards(RolesGuard)
@UseGuards(AuthGuard("jwt"))
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    ){
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAction(@Query() userOptions: ReadAllUserDto): Promise<UserPaginationResult> {
    const { pagination, sorting, ...filter } = userOptions;
    return this.userService.readAll({
      pagination,
      sorting,
      filter,
    });
  }

  @Get('/verify')
  @HttpCode(HttpStatus.OK)
  verifyAction(@Query() userOptions: VerifyUserDto): Promise<boolean> {
    return this.userService.verifyPassword(userOptions);
  }

  @Get("/getManyWithRoles")
  @HttpCode(HttpStatus.OK)
  getAllWithRolesAction(@Query() userOptions: ReadAllUserWithRolesDto): Promise<UserPaginationResult> {
    const { pagination, sorting, ...filter } = userOptions;
    return this.userService.readAllWithRoles({
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