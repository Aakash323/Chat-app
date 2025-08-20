import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Controller, Get } from '@nestjs/common';


async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    });
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.listen(3000);
    console.log('Server running on http://localhost:3000');
    console.log('Socket.IO endpoint: http://localhost:3000/socket.io/');
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
bootstrap();