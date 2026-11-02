import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { Channel, Message } from 'amqplib';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('orders.created')
  payment(@Payload() order: CreateOrderDto, @Ctx() context: RmqContext) {
    console.log('Entrou aqui');
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      console.log(order);
      channel.ack(originalMsg);
    } catch (error) {
      channel.nack(originalMsg, false, false);
      console.log(error);
    }
  }
}
