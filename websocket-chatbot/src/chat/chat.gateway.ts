import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Message } from '../message/entity/message.entity';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  
  private users: Map<string, string> = new Map();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const username = this.users.get(client.id);
    if (username) {
      console.log(`Client disconnected: ${username} (${client.id})`);
      this.server.emit('userLeft', { username });
      this.users.delete(client.id);
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() username: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.users.set(client.id, username);
    console.log(`${username} joined (${client.id})`);
    this.server.emit('userJoined', { username });

    
    let user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      user = this.userRepository.create({ username });
      await this.userRepository.save(user);
    }
    const messageHistory =await this.messageRepository.find({
      relations:['user'],
      order:{createdAt:'ASC'},
    });
    
    client.emit('previousMessage',messageHistory.map(msg=>({
       sender: msg.user.username,
      text: msg.text,
      createdAt: msg.createdAt,
    })))
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() text: string,
    @ConnectedSocket() client: Socket,
  ) {
    const username = this.users.get(client.id) || 'Anonymous';
    console.log(`Message from ${username}: ${text}`);

    let user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      user = this.userRepository.create({ username });
      await this.userRepository.save(user);
    }

    
    const message = this.messageRepository.create({ text, user });
    await this.messageRepository.save(message);


    this.server.emit('message', {
      sender: username,
      text: message.text,
      createdAt: message.createdAt,
    });
  }
}
