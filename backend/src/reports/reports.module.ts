import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceProduct } from '../invoices/invoice-product.entity';
import { Product } from 'src/products/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceProduct, Product])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
