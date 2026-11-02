import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);
  const rabbitUrl = configService.getOrThrow<string>('RABBITMQ_URL');

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: 'inventory.orders.created',
      exchange: 'orders.exchange',
      exchangeType: 'topic',
      routingKey: 'orders.created',
      queueOptions: {
        durable: true,
      },
    },
    noAck: false,
  });

  await app.listen();
}

bootstrap();
