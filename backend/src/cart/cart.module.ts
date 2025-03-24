import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { Coupon } from '../coupons/coupon.entity'; // Import Coupon entity
import { InvoicesModule } from '../invoices/invoices.module'; // Import InvoicesModule
import { MailService } from 'src/utils/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { SearchModule } from 'src/elasticsearch/elasticsearch.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product, User, Coupon]), // Register Coupon entity
    InvoicesModule, // Add InvoicesModule to the imports array
    AuthModule,
    SearchModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is not set.');
        }
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  providers: [CartService, MailService],
  controllers: [CartController],
})
export class CartModule {}
