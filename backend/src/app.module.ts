import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import ormconfig from 'ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReportsModule } from './reports/reports.module';
import { CartModule } from './cart/cart.module';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(ormconfig as TypeOrmModuleOptions),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    InvoicesModule,
    ReportsModule,
    CartModule,
    CouponsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
