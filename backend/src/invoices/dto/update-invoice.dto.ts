import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsArray()
  products?: Array<{
    productId: number;
    quantity: number;
  }>;
}