// backend/src/products/dto/update-product.dto.ts
import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === '' ? null : Number(value))
  price?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value === '' ? null : Number(value))
  stock?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsArray()
  imagesUrl?: string[];

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  allergens?: string;

  @IsOptional()
  @IsString()
  nutritionalValues?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return null;
    return Number(value);
  })
  priceBeforeTax?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return null;
    return Number(value);
  })
  taxRate?: number;

  @IsArray()
  @IsOptional()
  categoryIds?: number[]; // Array of category IDs
}
