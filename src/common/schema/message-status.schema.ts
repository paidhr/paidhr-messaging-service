import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MessageStatusEnum } from '../enums/message.enum';

export type MessageStatusDocument = MessageStatus & Document;
@Schema({
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id, delete ret.__v;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id, delete ret.__v;
    },
  },
  timestamps: true,
})
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
