import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.services';
import { CreateOrderDto } from './dto/CreateOrderDto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.save(createOrderDto);
  }
}
