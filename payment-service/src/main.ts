import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:1103@localhost:5672'],
      queue: 'order-queue',
      queueOptions: {
        durable: true,
      },
    },
    noAck: false,
  });

  await app.listen();
}

bootstrap();