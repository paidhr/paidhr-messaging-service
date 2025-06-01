import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ConversationMemberRoleEnum } from '../enums/conversation.enum';

@Schema()
export class ConversationMember {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ enum: ConversationMemberRoleEnum, required: true })
  role: ConversationMemberRoleEnum;

  @Prop({ default: Date.now })
  joinedAt: Date;

  @Prop()
  leftAt?: Date;
}

export const ConversationMemberSchema =
  SchemaFactory.createForClass(ConversationMember);

// Relationship
ConversationMemberSchema.index(
  { conversationId: 1, userId: 1 },
  { unique: true },
);

ConversationMemberSchema.index({ userId: 1 });
