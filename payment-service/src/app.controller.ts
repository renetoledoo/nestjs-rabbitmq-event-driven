import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { Channel, Message } from 'amqplib';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('orders.created')
  async payment(@Payload() order: CreateOrderDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      console.log('Processing order:', order);

      await this.appService.process(order);

      channel.ack(message);

      console.log('Message ACK successfully');
    } catch (error) {
      console.error('Payment processing failed:', error);

      channel.nack(message, false, false);

      console.log('Message NACK successfully');
    }
  }
}
