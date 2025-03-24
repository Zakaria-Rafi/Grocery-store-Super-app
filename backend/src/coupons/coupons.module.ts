import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponController } from './coupons.controller';
import { Coupon } from './coupon.entity';
import { CouponsService } from './coupons.service';
import { Product } from '../products/product.entity';
import { ProductsModule } from '../products/products.module';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { SearchModule } from 'src/elasticsearch/elasticsearch.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, Product, User]), // Register User entity
    ProductsModule, // Add ProductsModule to the imports array
    UsersModule, // Add UsersModule to the imports array
    SearchModule,
  ],
  providers: [CouponsService],
  controllers: [CouponController],
  exports: [CouponsService],
})
export class CouponsModule {}
