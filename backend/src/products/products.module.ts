import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { CategoriesModule } from '../categories/categories.module'; // Import CategoriesModule
import { InvoiceProduct } from '../invoices/invoice-product.entity'; // Import InvoiceProduct entity

@Module({
  imports: [TypeOrmModule.forFeature([Product,InvoiceProduct]),
  CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
