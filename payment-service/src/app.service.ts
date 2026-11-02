import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { KiwifyGateway } from './gateway/payment/KiwifyGatewat';
import { promises } from 'dns';
import { Retry } from './decorators/retry.decorators';

const MAX_ATTEMPT = 3;
const DELAY = 5000;

@Injectable()
export class AppService {
  constructor(private readonly kiwifyGateway: KiwifyGateway) {}
  
  @Retry()
  async process(order: CreateOrderDto) {
    return await this.kiwifyGateway.process(order);
  }
}
