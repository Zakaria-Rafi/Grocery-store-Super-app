import { define, factory } from 'typeorm-seeding';
import { faker } from '@faker-js/faker/locale/fr';
import { Cart } from '../../../cart/cart.entity';
import { User } from '../../../users/user.entity';

define(Cart, () => {
  const cart = new Cart();
  cart.user = factory(User)() as any;
  cart.totalPrice = faker.number.float({
    min: 0,
    max: 1000,
    fractionDigits: 2,
  });
  cart.status = faker.helpers.arrayElement(['PENDING', 'PAID', 'CANCELED']);
  cart.coupon = null;
  cart.createdAt = new Date();
  cart.updatedAt = new Date();
  return cart;
});
