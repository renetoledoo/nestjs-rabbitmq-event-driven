import { Controller,  } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @EventPattern('orders.created')
  inventory(order: any): any {
    console.log(order);
  }
}
