import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ArrayMaxSize,
  IsNumber,
  Min,
} from 'class-validator';
import { ConversationTypeEnum } from '../enums/conversation.enum';
import { Types } from 'mongoose';
import { Transform } from 'class-transformer';

export class CreateConversationDto {
  @IsEnum(ConversationTypeEnum)
  @IsNotEmpty()
  type: ConversationTypeEnum;

  @IsString()
  @ValidateIf((obj) => obj.type !== ConversationTypeEnum.PRIVATE)
  @IsNotEmpty({ message: 'Name is required for non-private conversations' })
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @IsMongoId({ each: true }) // Validates each array element is a valid MongoDB ID
  @IsOptional()
  @ValidateIf((obj) => obj.type === ConversationTypeEnum.PRIVATE)
  @ArrayMaxSize(1, {
    message: 'Private conversations can only have a maximum of 1 member',
  })
  memberIds: Types.ObjectId[];
}

export class PaginationDto {
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

export class CreateConversationParamDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}

export class AddMemberToConversationDto {
  @IsArray()
  @IsMongoId({ each: true }) // Validates each array element is a valid MongoDB ID
  memberIds: Types.ObjectId[];

  @IsMongoId()
  @IsNotEmpty()
  conversationId: string;
}

export class FetchConversationMembersDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  conversationId: string;
}

export class JoinConversationParamDto {
  @IsMongoId()
  @IsNotEmpty()
  conversationId: string;
}
