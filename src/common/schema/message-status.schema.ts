import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MessageStatusEnum } from '../enums/message.enum';

@Schema({})
export class MessageStatus {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Message' })
  messageId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ enum: MessageStatusEnum, required: true })
  status: MessageStatusEnum;
}

export const MessageStatusSchema = SchemaFactory.createForClass(MessageStatus);
MessageStatusSchema.index({ messageId: 1, userid: 1 }, { unique: true });
