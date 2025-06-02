import {
  IsMongoId,
  IsOptional,
  IsNumber,
  Min,
  IsString,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MessageTypeEnum } from '../enums/message.enum';

export class QueryMessagesDto {
  @IsMongoId()
  conversationId: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class SendMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(MessageTypeEnum)
  @IsOptional()
  messageType?: string = MessageTypeEnum.TEXT;

  @IsMongoId()
  @IsOptional()
  replyToMessageId?: string;

  @IsMongoId()
  senderId: string;
}
