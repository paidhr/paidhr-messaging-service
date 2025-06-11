import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ConversationTypeEnum } from '../enums/conversation.enum';
import { Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;
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
export class Conversation {
  @Prop({ enum: ConversationTypeEnum, required: true })
  type: ConversationTypeEnum;

  @Prop()
  name?: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isPublic: Boolean;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
