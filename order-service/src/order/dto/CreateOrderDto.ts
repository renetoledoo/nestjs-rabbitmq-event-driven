import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class ItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

class PaymentDto {
  @IsString()
  method: string;

  @IsNumber()
  installment: number;
}

class DeliveryDto {
  @IsString()
  addressId: string;
}
export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PaymentDto)
  payment: PaymentDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery: DeliveryDto;
}
