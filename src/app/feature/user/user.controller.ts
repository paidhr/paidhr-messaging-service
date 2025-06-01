import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { PaginateDto, RegisterUserDto } from 'src/common/dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async registerUser(@Body() body: RegisterUserDto) {
    const user = await this.userService.registerUser(body);

    return { message: 'User registered succesfully', data: user };
  }

  @Get()
  async fetchAllUsers(@Query() query: PaginateDto) {
    const users = await this.userService.fetchAllUsers(query);
    return { message: 'Users fetched successfully', data: users };
  }
}
