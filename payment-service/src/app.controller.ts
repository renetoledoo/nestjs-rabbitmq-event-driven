import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('orders_create')
  payment(order: any) {
    console.log(order, ' -< payment SERVICE');
  }
}
