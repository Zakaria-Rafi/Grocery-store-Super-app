import { Factory, Seeder } from 'typeorm-seeding';
import { CartItem } from '../../../cart/cart-item.entity';
import { Cart } from '../../../cart/cart.entity';
import { Category } from '../../../categories/category.entity';
import { Coupon } from '../../../coupons/coupon.entity';
import { InvoiceProduct } from '../../../invoices/invoice-product.entity';
import { Invoice } from '../../../invoices/invoice.entity';
import { Product } from '../../../products/product.entity';
import { User } from '../../../users/user.entity';

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(User)().createMany(15);
    await factory(Category)().createMany(15);
    await factory(Product)().createMany(15);
    await factory(Cart)().createMany(15);
    await factory(CartItem)().createMany(15);
    await factory(Invoice)().createMany(15);
    await factory(InvoiceProduct)().createMany(15);
    await factory(Coupon)().createMany(15);
  }
}
