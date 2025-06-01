import { Module } from '@nestjs/common';
import { MessageController } from './message.controllerr';
import { MessageService } from './message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/common/schema/message.schema';

@Module({
  controllers: [MessageController],
  providers: [MessageService],

  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
})
export class MessageModule {}
