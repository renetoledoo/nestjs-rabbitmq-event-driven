import { Injectable } from '@nestjs/common';

@Injectable()
export class KiwifyGateway {
  process(data: any) {
    console.log('Inicando processo pagamento ', data);
  }
}
