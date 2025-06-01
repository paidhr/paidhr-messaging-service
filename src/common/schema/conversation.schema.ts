import { Prop, Schema } from '@nestjs/mongoose';
import { ConversationTypeEnum } from '../enums/conversation.enum';
import { Types } from 'mongoose';

@Schema({})
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
