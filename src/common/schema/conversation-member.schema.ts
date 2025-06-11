import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ConversationMemberRoleEnum } from '../enums/conversation.enum';

export type ConversationMemberDocument = ConversationMember & Document;
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
