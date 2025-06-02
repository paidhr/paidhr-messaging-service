import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  GetSignleUserDto,
  QueryUsersDto,
} from 'src/common/dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async registerUser(@Body() body: CreateUserDto) {
    const user = await this.userService.registerUser(body);
    return { message: 'User registered successfully', data: user };
  }

  @Get('')
  async fetchAllUsers(@Query() query: QueryUsersDto) {
    const users = await this.userService.fetchAllUsers(query);
    return { message: 'Users fetched siuccessfully', data: users };
  }

  @Get([':username', '@:username'])
  async getSingleUser(@Param() param: GetSignleUserDto) {
    const cleanUsername = param.username.replace(/^@/, '');
    const user = await this.userService.fetchSingleUser({
      username: cleanUsername,
    });
    return { message: 'User fetched successfully', data: user };
  }
}
