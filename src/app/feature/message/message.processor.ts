import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MESSAGE_QUEUE, MESSAGE_QUEUE_JOBS } from './message.constant';
import { Job, JobData } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MessageStatus,
  MessageStatusDocument,
} from 'src/common/schema/message-status.schema';
import { MessageStatusEnum } from 'src/common/enums/message.enum';

@Processor(MESSAGE_QUEUE, { concurrency: 10 })
@Injectable()
export class MessageProcessor extends WorkerHost {
  constructor(
    @InjectModel(MessageStatus.name)
    private messageStatusModel: Model<MessageStatusDocument>,
  ) {
    super();
  }
  async process(job: Job) {
    switch (job.name) {
      case MESSAGE_QUEUE_JOBS.PROCESS_MESSAGE:
        await this.handleProcessMessage(job.data);
        break;

      default:
        break;
    }
  }

  private async handleProcessMessage(data: {
    messageId: string;
    conversationId: string;
    senderId: string;
  }) {
    const { messageId, conversationId, senderId } = data;

    try {
      // Simulate network delay
      await this.delay(Math.random() * 1000 + 500);

      // Mark as SENT
      await this.updateMessageStatus(
        messageId,
        senderId,
        MessageStatusEnum.SENT,
      );

      // Simulate delivery delay
      await this.delay(Math.random() * 2000 + 1000);

      // Mark as DELIVERED
      await this.updateMessageStatus(
        messageId,
        senderId,
        MessageStatusEnum.DELIVERED,
      );

      console.log(`Message ${messageId} processed successfully`);
    } catch (error) {
      // Mark as FAILED
      await this.updateMessageStatus(
        messageId,
        senderId,
        MessageStatusEnum.FAILED,
      );
      throw error;
    }
  }
  private async updateMessageStatus(
    messageId: string,
    userId: string,
    status: MessageStatusEnum,
  ) {
    const existingStatus = await this.messageStatusModel.findOne({
      messageId,
      userId,
    });

    if (existingStatus) {
      existingStatus.status = status;
      await existingStatus.save();
    } else {
      const newStatus = new this.messageStatusModel({
        messageId,
        userId,
        status,
        timestamp: new Date(),
      });
      await newStatus.save();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
