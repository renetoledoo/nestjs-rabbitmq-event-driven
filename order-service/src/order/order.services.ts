import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/CreateOrderDto';

@Injectable()
export class OrderService {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  save(order: CreateOrderDto) {
    const orderCreated = this.client.emit('order_create', order);
    return orderCreated;
  }
}
