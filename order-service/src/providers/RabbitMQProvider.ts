import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQProvider implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const connectionUrl = this.configService.getOrThrow<string>('RABBITMQ_URL');

    this.connection = await amqp.connect(connectionUrl);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange('orders.exchange', 'topic', {
      durable: true,
    });

    console.log('RabbitMQ Connection established');
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  publish(exchange: string, routingKey: string, message: unknown): boolean {
    const newMessage = {
      pattern: routingKey,
      data: message,
    };

    const resultPublish = this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(newMessage)),
      {
        persistent: true,
        contentType: 'application/json',
      },
    );

    console.log('Return Publish ', resultPublish);
    return resultPublish;
  }
}
