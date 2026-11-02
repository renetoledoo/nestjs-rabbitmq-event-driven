import { Injectable } from '@nestjs/common';

@Injectable()
export class KiwifyGateway {
  async process(data: any) {
    await new Promise(() => {
      setTimeout(() => {
        console.log('Simulando processo de pagamento com promise');
      }, 4000);
    });

    throw new Error('Error on payment gateway');
    console.log(data);
  }
}
