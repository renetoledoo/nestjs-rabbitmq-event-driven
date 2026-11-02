import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { KiwifyGateway } from './gateway/payment/KiwifyGatewat';
import { Retry } from './decorators/retry.decorators';

@Injectable()
export class AppService {
  constructor(private readonly kiwifyGateway: KiwifyGateway) {}

  @Retry()
  async process(order: CreateOrderDto) {
    console.log('Entrou aqui no process');
    return await this.kiwifyGateway.process(order);
  }
}
