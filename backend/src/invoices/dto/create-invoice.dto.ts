import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class InvoiceProductManualDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateInvoiceManualDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceProductManualDto)
  products: InvoiceProductManualDto[];
}