import { Injectable } from '@nestjs/common';

@Injectable()
export class KiwifyGateway {
  async process(data: any) {
    await new Promise((resolve) => {
      setTimeout(() => {
        console.log('Simulando processo de pagamento');
        resolve(true);
      }, 2000);
    });

    console.log(data);

    throw new Error('Error on payment gateway');
  }
}