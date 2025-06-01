import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginateDto, RegisterUserDto } from 'src/common/dto/user.dto';
import { User, UserDocument } from 'src/common/schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async registerUser(payload: RegisterUserDto) {
    // check if user name or email has been taken
    const checkEmail = await this.userModel.findOne({ email: payload.email });

    if (checkEmail) {
      throw new BadRequestException('User with email already exists');
    }

    const checkUsername = await this.userModel.findOne({
      username: payload.username,
    });

    if (checkUsername) {
      throw new BadRequestException('User with this username already exists');
    }

    const user = await this.userModel.create(payload);

    // create the user if none of these has been taken

    return user;
  }

  async fetchAllUsers(options: PaginateDto) {
    const { limit = 10, page = 1 } = options;

    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('_id email username createdAt updatedAt');

    const totalUsers = await this.userModel.countDocuments();

    return {
      users: users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
      },
    };
  }
}
