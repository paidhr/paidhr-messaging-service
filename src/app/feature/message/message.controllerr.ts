import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { QueryMessagesDto, SendMessageDto } from 'src/common/dto/message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async sendMessage(@Body() body: SendMessageDto) {
    return await this.messageService.sendMessage(body);
  }

  @Get()
  async getMessages(@Query() query: QueryMessagesDto) {
    return await this.messageService.getMessages(query);
  }

  @Post(':id/read')
  async markAsRead(
    @Param('id') messageId: string,
    @Body('userId') userId: string,
  ) {
    return await this.messageService.markAsRead(messageId, userId);
  }

  @Get(':id/status')
  async getMessageStatus(@Param('id') messageId: string) {
    return await this.messageService.getMessageStatus(messageId);
  }
}
