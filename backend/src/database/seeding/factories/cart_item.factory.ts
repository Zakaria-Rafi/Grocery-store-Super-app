import { faker } from '@faker-js/faker/locale/fr';
import { define, factory } from 'typeorm-seeding';
import { CartItem } from '../../../cart/cart-item.entity';
import { Cart } from '../../../cart/cart.entity';
import { Product } from '../../../products/product.entity';

define(CartItem, () => {
  const cartItem = new CartItem();
  const product = factory(Product)() as any;
  const cart = factory(Cart)() as any;
  cartItem.product = product;
  cartItem.quantity = faker.number.int({ min: 1, max: 10 });
  cartItem.totalPrice = faker.number.float({
    min: 0,
    max: 300,
    fractionDigits: 2,
  });
  cartItem.cart = cart;
  return cartItem;
});
