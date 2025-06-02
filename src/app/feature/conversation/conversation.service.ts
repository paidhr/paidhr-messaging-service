import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AddMemberToConversationDto,
  CreateConversationDto,
  CreateConversationParamDto,
  FetchConversationMembersDto,
  PaginationDto,
} from 'src/common/dto/conversation.dto';

import { UserService } from '../user/user.service';
import {
  ConversationMemberRoleEnum,
  ConversationTypeEnum,
} from 'src/common/enums/conversation.enum';
import {
  Conversation,
  ConversationDocument,
} from 'src/common/schema/conversation.schema';
import {
  ConversationMember,
  ConversationMemberDocument,
} from 'src/common/schema/conversation-member.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(ConversationMember.name)
    private conversationMemberModel: Model<ConversationMemberDocument>,
    private readonly userService: UserService,
  ) {}

  //  create a conversation
  async createConversation(
    payload: CreateConversationDto & CreateConversationParamDto,
  ) {
    if (
      payload.memberIds.some((member) => member.toString() === payload.userId)
    ) {
      throw new BadRequestException(
        'Cannot have a conversation with yourself as a member',
      );
    }

    const user = await this.userService.fetchUserById(payload.userId);

    // check if all the members exists
    for (const member of payload.memberIds) {
      const check = await this.userService.fetchUserById(member.toString());
      if (!check)
        throw new BadRequestException(
          `User with id - ${member.toString()} does not exists`,
        );
    }

    // if it iis private, check if the conversation has been created before
    if (payload.type === ConversationTypeEnum.PRIVATE) {
      // check if there exists a conversation before
      if (
        await this.checkExistingPrivateConversation(
          payload.userId,
          payload.memberIds[0].toString(),
        )
      ) {
        throw new BadRequestException(
          'You already have  a private conversation with this user',
        );
      }
    }

    const conversation = await this.conversationModel.create({
      type: payload.type,
      name:
        payload.type === ConversationTypeEnum.PRIVATE && !payload.name
          ? `${user.username} & ${(await this.userService.fetchUserById(payload.memberIds[0].toString())).username}`
          : payload.name,
      description:
        payload.type === ConversationTypeEnum.PRIVATE && !payload.description
          ? `Private Convo between ${user.username} & ${(await this.userService.fetchUserById(payload.memberIds[0].toString())).username}`
          : payload.description,
      avatarUrl: payload.avatarUrl,
      createdBy: user,
      isPublic:
        payload.type === ConversationTypeEnum.PRIVATE
          ? false
          : payload.type === ConversationTypeEnum.PUBLIC_CHANEL
            ? true
            : payload.isPublic,
    });

    await this.conversationMemberModel.create({
      conversationId: conversation._id,
      userId: user._id,
      role:
        payload.type === ConversationTypeEnum.PRIVATE
          ? ConversationMemberRoleEnum.MEMBER
          : ConversationMemberRoleEnum.ADMIN,
      joinedAt: new Date(),
    });

    if (payload.memberIds && payload.memberIds.length >= 1) {
      await this.addMemberToConversation({
        conversationId: conversation.id,
        memberIds: payload.memberIds,
      });
    }

    return { user, conversation };
  }

  async findConversationById(conversationId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }

    return conversation;
  }

  async fetchMembersOfAConversation(payload: FetchConversationMembersDto) {
    await this.userService.fetchUserById(payload.userId);

    await this.findConversationById(payload.conversationId);

    const member = await this.checkIfMemberInConversation(
      payload.conversationId,
      payload.userId,
    );

    if (!member || !!member.leftAt) {
      throw new ForbiddenException(
        'You are not a member of this conversation and cannot fetch members',
      );
    }

    return await this.conversationMemberModel
      .find({
        conversationId: new Types.ObjectId(payload.conversationId),
      })
      .select('role joinedAt leftAt')
      .populate('userId', 'id username email avatarUrl')
      .sort({ role: 1 });
  }

  //   async joinGroup() {}

  // fetch all conversation

  // fetch all cnversations a user belongs to

  // remove from conversations

  // join conversation

  async adminAddMemberToConversation(
    payload: AddMemberToConversationDto & CreateConversationParamDto,
  ) {
    // check if the user is the admin
    const user = await this.userService.fetchUserById(payload.userId);

    if (
      payload.memberIds.some((member) => member.toString() === payload.userId)
    ) {
      throw new BadRequestException(
        'Cannot have a conversation with yourself as a member',
      );
    }

    const conversation = await this.findConversationById(
      payload.conversationId,
    );

    const member = this.conversationMemberModel.findOne({
      userId: user,
      conversationId: conversation,
      role: ConversationMemberRoleEnum.ADMIN,
    });

    if (!member) throw new ForbiddenException(`You cannot add member`);

    await this.addMemberToConversation({
      conversationId: payload.conversationId,
      memberIds: payload.memberIds,
    });
    return;
  }

  async adminRemoveMemberFromConversation(
    payload: AddMemberToConversationDto & CreateConversationParamDto,
  ) {
    // check if the user is the admin
    const user = await this.userService.fetchUserById(payload.userId);

    if (
      payload.memberIds.some((member) => member.toString() === payload.userId)
    ) {
      throw new BadRequestException('Cannot remove yourself from group');
    }

    const conversation = await this.findConversationById(
      payload.conversationId,
    );

    const admin = this.conversationMemberModel.findOne({
      userId: user,
      conversationId: conversation,
      role: ConversationMemberRoleEnum.ADMIN,
    });

    if (!admin) throw new ForbiddenException(`You cannot add member`);

    await this.removeMemberFromConversation({
      conversationId: payload.conversationId,
      memberIds: payload.memberIds,
    });
    return;
  }

  async joinConversation(payload: FetchConversationMembersDto) {
    const user = await this.userService.fetchUserById(payload.userId);
    const conversation = await this.findConversationById(
      payload.conversationId,
    );

    // check if conversation is public or private
    if (!conversation.isPublic) {
      throw new ForbiddenException(
        'Cannot join a private group unless added by admin',
      );
    }

    // check if the person has joined previously
    const checkMember = await this.checkIfMemberInConversation(
      payload.conversationId,
      payload.userId,
    );
    if (checkMember && !checkMember.leftAt) {
      throw new BadRequestException(
        'You are already a member of this conversation',
      );
    } else if (!checkMember) {
      await this.addMemberToConversation({
        conversationId: payload.conversationId,
        memberIds: [new Types.ObjectId(payload.userId)],
      });
    } else {
      delete checkMember.leftAt;
      checkMember.joinedAt = new Date();
      checkMember.save();
    }
  }

  async leaveConversation(payload: FetchConversationMembersDto) {
    const user = await this.userService.fetchUserById(payload.userId);
    const conversation = await this.findConversationById(
      payload.conversationId,
    );

    // check if the person has joined previously
    const checkMember = await this.checkIfMemberInConversation(
      payload.conversationId,
      payload.userId,
    );
    if (checkMember && checkMember.role == ConversationMemberRoleEnum.ADMIN) {
      throw new ForbiddenException('Admin cannot leave conversations');
    } else if (checkMember && !checkMember.leftAt) {
      checkMember.leftAt = new Date();
      checkMember.save();
    } else if (checkMember && checkMember.leftAt) {
      throw new ForbiddenException(
        'You are no longer part of this convrsation',
      );
    }
  }

  // add member to conversation
  async addMemberToConversation(payload: AddMemberToConversationDto) {
    // check if conversation exists
    await this.fetchConversationById(payload.conversationId);

    for (const member of payload.memberIds) {
      // check if the member is there already
      const joinedMember = await this.checkIfMemberInConversation(
        payload.conversationId,
        member.toString(),
      );

      if (!joinedMember) {
        this.conversationMemberModel.create({
          conversationId: new Types.ObjectId(payload.conversationId),
          userId: new Types.ObjectId(member),
          joinedAt: new Date(),
          role: ConversationMemberRoleEnum.MEMBER,
        });
      }

      if (joinedMember && joinedMember?.leftAt !== null) {
        delete joinedMember.leftAt;
        joinedMember.joinedAt = new Date();
        joinedMember.save();
      }
    }
  }

  async removeMemberFromConversation(payload: AddMemberToConversationDto) {
    const conversation = await this.fetchConversationById(
      payload.conversationId,
    );

    await this.conversationMemberModel.updateMany(
      {
        userId: { $in: payload.memberIds.map((id) => new Types.ObjectId(id)) },
        conversationId: new Types.ObjectId(payload.conversationId),
      },
      {
        leftAt: new Date(),
      },
    );
  }

  private async fetchConversationById(conversationId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) throw new BadRequestException('Conversation not found');
    return conversation;
  }

  async checkIfMemberInConversation(conversationId: string, memberId: string) {
    return await this.conversationMemberModel.findOne({
      conversationId: new Types.ObjectId(conversationId),
      userId: new Types.ObjectId(memberId),
    });
  }

  async checkExistingPrivateConversation(
    userId1: string,
    userId2: string,
  ): Promise<boolean> {
    // Get all conversation IDs where userId1 is a member
    const user1Conversations = await this.conversationMemberModel
      .find({ userId: new Types.ObjectId(userId1) })
      .select('conversationId')
      .lean();

    // Get all conversation IDs where userId2 is a member
    const user2Conversations = await this.conversationMemberModel
      .find({ userId: new Types.ObjectId(userId2) })
      .select('conversationId')
      .lean();

    // Find common conversation IDs
    const user1ConvIds = user1Conversations.map((c) =>
      c.conversationId.toString(),
    );

    const user2ConvIds = user2Conversations.map((c) =>
      c.conversationId.toString(),
    );

    const commonConvIds = user1ConvIds.filter((id) =>
      user2ConvIds.includes(id),
    );

    if (commonConvIds.length === 0) return false;

    // Check if any common conversation is private with exactly 2 members
    for (const convId of commonConvIds) {
      const memberCount = await this.conversationMemberModel.countDocuments({
        conversationId: new Types.ObjectId(convId),
      });

      if (memberCount === 2) {
        const conversation = await this.conversationModel.findById(convId);
        if (conversation?.type === ConversationTypeEnum.PRIVATE) {
          return true;
        }
      }
    }

    return false;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    await this.userService.fetchUserById(userId);
    return this.conversationMemberModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          leftAt: { $exists: false }, // Only active memberships
        },
      },
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conversation',
        },
      },
      {
        $unwind: '$conversation',
      },
      {
        $replaceRoot: { newRoot: '$conversation' },
      },
      {
        $addFields: {
          id: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
          __v: 0,
        },
      },
    ]);
  }

  async getPublicConversations(payload: PaginationDto) {
    const { page = 1, limit = 10 } = payload;
    const skip = (page - 1) * limit;

    const [channels, total] = await Promise.all([
      this.conversationModel.aggregate([
        {
          $match: {
            isPublic: true,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
        {
          $project: {
            _id: 0,
            __v: 0,
          },
        },
      ]),
      this.conversationModel.countDocuments({
        type: ConversationTypeEnum.PUBLIC_CHANEL,
        isPublic: true,
      }),
    ]);

    return {
      data: channels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
