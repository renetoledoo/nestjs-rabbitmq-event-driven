import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/CreateOrderDto';
import { KiwifyGateway } from './gateway/payment/KiwifyGatewat';
import { promises } from 'dns';

const MAX_ATTEMPT = 3;
const DELAY = 5000;

@Injectable()
export class AppService {
  constructor(private readonly kiwifyGateway: KiwifyGateway) {}

  async process(order: CreateOrderDto) {
    let lastError: Error = new Error('Unknowm error');

    for (let attempt = 1; attempt <= MAX_ATTEMPT; attempt++) {
      try {
        return this.kiwifyGateway.process(order);
      } catch (error) {
        lastError = error as Error;

        console.log(`Attempt ${attempt} failed. Retrying in ${DELAY / 1000}s`);

        if (attempt < MAX_ATTEMPT) {
          await new Promise((resolve) => setTimeout(resolve, DELAY));
        }
      }
    }

    throw lastError;
  }
}
