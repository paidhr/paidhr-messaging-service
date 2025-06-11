import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import {
  AddMemberToConversationDto,
  CreateConversationDto,
  CreateConversationParamDto,
  FetchConversationMembersDto,
  JoinConversationParamDto,
  PaginationDto,
} from 'src/common/dto/conversation.dto';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post(':userId')
  async createConversation(
    @Body() body: CreateConversationDto,
    @Param() params: CreateConversationParamDto,
  ) {
    const conversation = await this.conversationService.createConversation({
      ...body,
      ...params,
    });

    return { message: 'Conversation created successfully', data: conversation };
  }

  @Get('member/:conversationId/:userId')
  async getMembersOfAConversation(@Param() param: FetchConversationMembersDto) {
    // you can only get members of a conversations that you are part of
    const members =
      await this.conversationService.fetchMembersOfAConversation(param);
    return {
      message: 'Fetched members successfully',
      data: members,
    };
  }

  @Post('add/member/:userId')
  async adminAddMemberToConversation(
    @Body() body: AddMemberToConversationDto,
    @Param() param: CreateConversationParamDto,
  ) {
    await this.conversationService.adminAddMemberToConversation({
      ...body,
      ...param,
    });
    return { message: 'Members added successfully', data: {} };
  }

  @Post('remove/member/:userId')
  async adminRemoveMemberFromConversation(
    @Body() body: AddMemberToConversationDto,
    @Param() param: CreateConversationParamDto,
  ) {
    await this.conversationService.adminRemoveMemberFromConversation({
      ...body,
      ...param,
    });
    return { message: 'Members removed successfully', data: {} };
  }

  @Post('join/:conversationId')
  async joinConversation(
    @Param() param: JoinConversationParamDto,
    @Body() body: CreateConversationParamDto,
  ) {
    const conversation = await this.conversationService.joinConversation({
      ...param,
      ...body,
    });

    return { message: 'Join conversation successfully', data: {} };
  }

  @Post('leave/:conversationId')
  async leaveConversation(
    @Param() param: JoinConversationParamDto,
    @Body() body: CreateConversationParamDto,
  ) {
    const conversation = await this.conversationService.leaveConversation({
      ...param,
      ...body,
    });

    return { message: 'Leave conversation successfully', data: {} };
  }

  @Get('joined/:userId')
  async fetchAllUsersConversation(@Param() param: CreateConversationParamDto) {
    const conversations = await this.conversationService.getUserConversations(
      param.userId,
    );
    return { message: 'Conversations fetchd succssfully', data: conversations };
  }

  @Get('public')
  async fetchAllPublicConversations(@Query() paginationOptions: PaginationDto) {
    const conversations =
      await this.conversationService.getPublicConversations(paginationOptions);

    return { message: 'Fetched all public conversations', data: conversations };
  }
}
