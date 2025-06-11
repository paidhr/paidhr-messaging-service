import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateUserDto,
  GetSignleUserDto,
  QueryUsersDto,
} from 'src/common/dto/user.dto';
import { User, UserDocument } from 'src/common/schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async registerUser(payload: CreateUserDto) {
    // check if the user name is chosen and also the display name

    const checkEmail = await this.userModel.findOne({ email: payload.email });

    if (checkEmail) throw new BadRequestException('Emaiil already taken');

    const checkUsername = await this.userModel.findOne({
      username: payload.username,
    });

    if (checkUsername) throw new BadRequestException('Username already taken');

    const user = this.userModel.create({
      ...payload,
    });

    return user;
  }

  async fetchAllUsers(payload: QueryUsersDto) {
    const { page = 1, limit = 10 } = payload;

    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find({})
      .sort({ created: -1 })
      .skip(skip)
      .limit(limit)
      .populate('username email avatarUrl');

    const total = await this.userModel.countDocuments();
    return {
      users: users.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async fetchSingleUser(payload: GetSignleUserDto) {
    const user = await this.userModel.findOne({ username: payload.username });

    if (!user) throw new BadRequestException('User does not exist');

    return user;
  }

  async fetchUserById(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) throw new BadRequestException('User not found');

    return user;
  }
}
