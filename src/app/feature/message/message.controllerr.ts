import { Controller } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messge')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
}
