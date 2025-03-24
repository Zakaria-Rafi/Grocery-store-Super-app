import {IsString, IsOptional, IsArray } from 'class-validator';

export class FullRefundDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class PartialRefundDto {
  @IsArray()
  items: {
    productId: number;
    quantity: number;
  }[];

  @IsString()
  @IsOptional()
  reason?: string;
}