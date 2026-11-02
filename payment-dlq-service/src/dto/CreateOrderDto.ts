class ItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

class PaymentDto {
  method: string;
  installment: number;
}

class DeliveryDto {
  addressId: string;
}
export class CreateOrderDto {
  customerId: string;
  items: ItemDto[];
  payment: PaymentDto;
  delivery: DeliveryDto;
}
