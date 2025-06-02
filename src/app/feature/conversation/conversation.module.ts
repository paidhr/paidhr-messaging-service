import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from 'src/common/schema/conversation.schema';
import {
  ConversationMember,
  ConversationMemberSchema,
} from 'src/common/schema/conversation-member.schema';
import { UserModule } from '../user/user.module';

@Module({
  providers: [ConversationService],
  controllers: [ConversationController],
  exports: [ConversationService],
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      {
        name: ConversationMember.name,
        schema: ConversationMemberSchema,
      },
    ]),
  ],
})
export class ConversationModule {}
