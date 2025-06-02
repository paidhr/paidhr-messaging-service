import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MessageTypeEnum } from '../enums/message.enum';

export type MessageDocument = Message & Document;

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
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ enum: MessageTypeEnum, default: MessageTypeEnum.TEXT })
  messageType: string;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  replyMessageId: Types.ObjectId;

  @Prop([
    {
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: String,
    },
  ])
  attachments?: Array<{
    fileName: String;
    fileUrl: string;
    fileType: string;
    fileSize: string;
  }>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
