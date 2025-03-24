import { define, factory } from 'typeorm-seeding';
import { faker } from '@faker-js/faker/locale/fr';
import { Coupon } from '../../../coupons/coupon.entity';
import { User } from '../../../users/user.entity';
import { Product } from '../../../products/product.entity';

define(Coupon, () => {
  const coupon = new Coupon();
  coupon.code = faker.string.alphanumeric(10).toUpperCase();
  coupon.discountType = faker.helpers.arrayElement(['PERCENTAGE', 'FIXED']);
  coupon.discountValue = parseFloat(faker.commerce.price());
  coupon.isGlobal = faker.datatype.boolean();
  coupon.usageLimit = faker.number.int({ min: 1, max: 100 });
  coupon.users = faker.datatype.boolean() ? [factory(User)() as any] : [];
  coupon.products = faker.datatype.boolean() ? [factory(Product)() as any] : [];
  coupon.expiryDate = faker.date.future();
  coupon.createdAt = new Date();
  coupon.updatedAt = new Date();
  return coupon;
});
