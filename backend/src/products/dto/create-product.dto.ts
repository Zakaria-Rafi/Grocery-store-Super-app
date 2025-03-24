import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @IsNotEmpty()
  @IsString()
  barcode: string;

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
  priceBeforeTax?: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsArray()
  @IsOptional()
  categoryIds?: number[]; // Array of category IDs
}
