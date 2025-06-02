import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MessageService } from './message.service';
import { MessageProcessor } from './message.processor';
import { BullModule } from '@nestjs/bullmq';
import { MESSAGE_QUEUE } from './message.constant';
import { ConversationModule } from '../conversation/conversation.module';
import { Message, MessageSchema } from 'src/common/schema/message.schema';
import {
  MessageStatus,
  MessageStatusSchema,
} from 'src/common/schema/message-status.schema';
import { MessageController } from './message.controllerr';

@Module({
  imports: [
    ConversationModule,
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: MessageStatus.name, schema: MessageStatusSchema },
    ]),
    BullModule.registerQueue({
      name: MESSAGE_QUEUE,
    }),
  ],
  providers: [MessageService, MessageProcessor],
  controllers: [MessageController],
})
export class MessageModule {}
