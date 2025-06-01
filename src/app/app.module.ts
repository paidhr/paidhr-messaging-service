import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './feature/user/user.module';
import { ConversationModule } from './feature/conversation/conversation.module';
import { MessageModule } from './feature/message/message.module';

@Module({
  imports: [
    UserModule,
    ConversationModule,
    MessageModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb://localhost:27017/paidhr',
        auth: {
          username: 'codedadi',
          password: '123456',
        },
        authSource: 'admin',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
