import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/CreateOrderDto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('orders_create')
  payment(order: CreateOrderDto) {
    return this.appService.process(order);
  }
}
