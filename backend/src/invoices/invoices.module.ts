import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './invoice.entity';
import { InvoiceProduct } from './invoice-product.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Cart } from 'src/cart/cart.entity';
import { JwtModule } from '@nestjs/jwt';
import { StripeService } from './stripe.service';
import { PayPalService } from './paypal.service';
import { RefundItem } from './RefundItem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceProduct, User, Product, Cart,RefundItem]), // Register entities
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [InvoicesService, StripeService, PayPalService],
  controllers: [InvoicesController],
  exports: [InvoicesService], // Export InvoicesService to make it available in other modules
})
export class InvoicesModule {}