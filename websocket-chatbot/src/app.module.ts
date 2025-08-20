import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { Controller, Get } from '@nestjs/common';
import { User } from './user/entity/user.entity';
import { Message } from './message/entity/message.entity';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', 
      host: 'localhost',
      port: 5000,
      username: 'postgres',
      password: 'Aakash@123',
      database: 'Chat app',
      entities: [User, Message],
      synchronize: true,
    }),
    ChatModule,
    UserModule,
    MessageModule,
  ],
  
})
export class AppModule {}
