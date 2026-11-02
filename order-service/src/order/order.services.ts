import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { RabbitMQProvider } from 'src/providers/RabbitMQProvider';

@Injectable()
export class OrderService {
  constructor(private readonly rabbitMqProvider: RabbitMQProvider) {}

  save(order: CreateOrderDto) {
    const orderCreated = this.rabbitMqProvider.publish(
      'orders.exchange',
      'orders.created',
      order,
    );

    if (orderCreated) {
      return {
        status: 'success',
        msg: 'order created',
      };
    } else {
      return {
        status: 'failed',
        msg: 'order failed',
      };
    }
  }
}
