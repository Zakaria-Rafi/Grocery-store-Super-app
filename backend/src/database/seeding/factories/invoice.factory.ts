// src/database/factories/invoice.factory.ts
import { define, factory } from 'typeorm-seeding';
import { faker } from '@faker-js/faker/locale/fr';
import { Invoice } from '../../../invoices/invoice.entity';
import { User } from '../../../users/user.entity';
import { Coupon } from '../../../coupons/coupon.entity';

define(Invoice, () => {
  const invoice = new Invoice();
  invoice.orderNumber = faker.string.uuid();
  invoice.status = faker.helpers.arrayElement([
    'PENDING',
    'PAID',
    'CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
  ]);
  if (
    invoice.status === 'REFUNDED' ||
    invoice.status === 'PARTIALLY_REFUNDED'
  ) {
    invoice.refundedAmount = parseFloat(faker.commerce.price());
  }
  invoice.user = factory(User)() as any;
  invoice.coupon = faker.datatype.boolean() ? (factory(Coupon)() as any) : null;
  invoice.amount = parseFloat(faker.commerce.price());
  invoice.paimentmethod = faker.helpers.arrayElement([
    'paypal',
    'stripe',
    'cash',
  ]);
  invoice.created_at = new Date();
  invoice.updated_at = new Date();
  return invoice;
});
