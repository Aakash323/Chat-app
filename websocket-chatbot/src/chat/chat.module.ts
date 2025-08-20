import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { User } from 'src/user/entity/user.entity';
import { Message } from 'src/message/entity/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Message])],
  providers: [ChatGateway],
})
export class ChatModule {}
