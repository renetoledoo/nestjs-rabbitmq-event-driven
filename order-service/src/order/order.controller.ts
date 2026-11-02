import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.services';
import { CreateOrderDto } from './dto/CreateOrderDto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    // pass
  }
}
