import { InjectQueue } from '@nestjs/bullmq';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MESSAGE_QUEUE, MESSAGE_QUEUE_JOBS } from './message.constant';
import { Queue } from 'bullmq';
import { ConversationService } from '../conversation/conversation.service';
import { Message, MessageDocument } from 'src/common/schema/message.schema';
import {
  MessageStatus,
  MessageStatusDocument,
} from 'src/common/schema/message-status.schema';
import { QueryMessagesDto, SendMessageDto } from 'src/common/dto/message.dto';
import { MessageStatusEnum } from 'src/common/enums/message.enum';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(MessageStatus.name)
    private messageStatusModel: Model<MessageStatusDocument>,
    @InjectQueue(MESSAGE_QUEUE) private messageQueue: Queue,
    private readonly conversationService: ConversationService,
  ) {}

  async sendMessage(payload: SendMessageDto) {
    const checkSender =
      await this.conversationService.checkIfMemberInConversation(
        payload.conversationId,
        payload.senderId,
      );

    if (!checkSender || checkSender.leftAt)
      throw new ForbiddenException('You are not a member of this conversation');

    const message = new this.messageModel(payload);
    const savedMessage = await message.save();

    await this.messageQueue.add(
      MESSAGE_QUEUE_JOBS.PROCESS_MESSAGE,
      {
        messageId: savedMessage._id,
        conversationId: payload.conversationId,
        senderId: payload.senderId,
      },
      {
        delay: 100,
      },
    );

    return savedMessage;
  }

  async getMessages(payload: QueryMessagesDto) {
    const { conversationId, page = 1, limit = 10 } = payload;

    const skip = (page - 1) * limit;

    const messages = await this.messageModel
      .find({
        conversationId,
        deletedAt: { $exists: false },
      })
      .populate('senderId', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.messageModel.countDocuments({
      conversationId,
      deletedAt: { $exists: false },
    });

    return {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(messageId: string, userId: string) {
    const existingStatus = await this.messageStatusModel.findOne({
      messageId,
      userId,
    });

    if (existingStatus) {
      existingStatus.status = MessageStatusEnum.READ;
      return await existingStatus.save();
    } else {
      const newStatus = new this.messageStatusModel({
        messageId,
        userId,
        status: MessageStatusEnum.READ,
        timestamp: new Date(),
      });
      return await newStatus.save();
    }
  }

  async getMessageStatus(messageId: string) {
    return await this.messageStatusModel
      .find({ messageId })
      .populate('userId', 'username')
      .exec();
  }
}
